import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { HealthCheck, Status } from '../../model/HealthCheck';
import { AssertionFnOptions, DataType, getHttpAssertionFunc } from '../../service/AssertionService';
import _ from 'lodash';
import { postMetric, updateInsights } from '../../db';
import https from 'https';
import * as tls from 'tls';
import get from 'lodash/get';
import { SQSClient } from '@aws-sdk/client-sqs';
import { QueueService } from '../../service/QueueService';
import PG from 'pg';

export const checkHTTP = async (timeSeriesClient: PG.Client, rdsClient: PG.Client, task: HealthCheck, location: string) => {
	const startingDate = new Date();

	try {
		var respond = await sendRequest(task);
	} catch (err: any) {
		const error = err as AxiosError;

		await postMetric(
			task,
			location,
			startingDate,
			[],
			Status.ERROR,
			error.response?.status ?? 500,
			new Date().getTime() - startingDate.getTime(),
			error.message,
			timeSeriesClient
		);
		await updateInsights(task.insightsId, Status.ERROR, '', '', rdsClient);
		await sendSQS(task);
		return;
	}

	if (respond) {
		const { response, responseTime } = respond;
		let data: DataType[] = [];
		let sendNotification = false;
		let isAssertionFailed = false;
		let errReason = '';

		const authorized = get(response, 'request.connection.authorized');
		if (task.verifySSL && !authorized) {
			(sendNotification = true), (isAssertionFailed = true);
			errReason = 'Assertion(s) Failed';
			data.push({
				message: 'SSL verification',
				isAssertionFailed: true
			});
		}
		if (!_.isEmpty(task.assertions) && !!task.assertions) {
			const assertions = task.assertions;
			for (let i = 0; i < assertions.length; i++) {
				const { type } = assertions[i];
				const assertionFunc = getHttpAssertionFunc[type];
				const assertionResult = assertionFunc({
					response,
					assertion: assertions[i],
					responseTime,
					url: task.url
				});
				if (assertionResult.isAssertionFailed) {
					sendNotification = true;
					isAssertionFailed = true;
					errReason = 'Assertion(s) Failed';
				}

				data.push(assertionResult);
			}
		}
		if (isAssertionFailed) {
			await sendSQS(task);
		}
		const status = isAssertionFailed ? Status.ASSERTION_FAILED : Status.SUCCESS;
		await postMetric(task, location, startingDate, data, status, response.status, responseTime, errReason, timeSeriesClient);
		await updateInsights(task.insightsId, status, response.tlsCert?.issuer.CN || '', response.tlsCert?.valid_to || '', rdsClient);
	}
};
const sendRequest: (task: HealthCheck) => Promise<
	| {
			response: AssertionFnOptions['response'];
			responseTime: number;
	  }
	| undefined
> = async (task: HealthCheck) => {
	let axiosRequestConfig: AxiosRequestConfig = {
		method: task.method,
		url: task.url
	};
	if (!!task.timeout) {
		axiosRequestConfig = { ...axiosRequestConfig, timeout: task.timeout };
	}
	if (task.headers) {
		const headers = task.headers.reduce<Record<string, string>>((prev, curr) => {
			return { ...prev, [curr.key]: curr.value };
		}, {});
		axiosRequestConfig = { ...axiosRequestConfig, headers };
	}
	if (!!task.httpUserName && !!task.httpPassword) {
		axiosRequestConfig = {
			...axiosRequestConfig,
			auth: {
				username: task.httpUserName,
				password: task.httpPassword
			}
		};
	}
	if (!!task.requestBody) {
		try {
			axiosRequestConfig = {
				...axiosRequestConfig,
				data: JSON.parse(task.requestBody)
			};
		} catch (err) {
			// TODO: Notify user on failed parsing - How?
			console.error(err);
		}
	}

	let tlsCert: tls.PeerCertificate | undefined;
	if (task.verifySSL) {
		const agent = new https.Agent({ rejectUnauthorized: true, requestCert: true }).on(
			'keylog',
			(line, tlsSocket) => (tlsCert = tlsSocket.getPeerCertificate(true))
		);

		axiosRequestConfig.httpsAgent = agent;
	}
	const start = performance.now();
	const response: AxiosResponse = await axios(axiosRequestConfig);
	// TODO: Pending DNS lookup
	return { response: { ...response, tlsCert }, responseTime: performance.now() - start };
};
const sendSQS = async (task: HealthCheck) => {
	const queue = new QueueService(
		new SQSClient({
			region: process.env.REGION,
			credentials: {
				accessKeyId: process.env.ACCESS_KEY_ID || '',
				secretAccessKey: process.env.ACCESS_KEY || ''
			}
		}),
		`https://sqs.${process.env.REGION}.amazonaws.com/387070877324/PROD_INCIDENT`
	);

	await queue.sendMessage(JSON.stringify(task));
	console.log('SQS SENT TO NOTIFICATION LAMBDA', task);
};
