import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import { HealthCheck, Status } from '../../model/HealthCheck';
import { AssertionFnOptions, DataType, getHttpAssertionFunc } from '../../service/AssertionService';
import _ from 'lodash';
import { postMetric, postMetricError } from '../../db';
import https from 'https';
import * as tls from 'tls';
import get from 'lodash/get';
export const checkHTTP = async (task: HealthCheck, location: string) => {
	const startingDate = new Date();

	try {
		var respond = await sendRequest(task);
	} catch (err: any) {
		const error = err as AxiosError;
		await postMetricError(
			task,
			startingDate,
			Status.ERROR,
			error.response?.status ?? 500,
			error.message,
			location,
			err.responseTime ?? new Date().getTime() - startingDate.getTime()
		);
	}

	if (respond) {
		const { response, responseTime } = respond;
		let data: DataType[] = [];
		let sendNotification = false;
		let isAssertionFailed = false;

		const authorized = get(response, 'request.connection.authorized');
		if (task.verifySSL && !authorized) {
			(sendNotification = true), (isAssertionFailed = true);
			data.push({
				noSLL: true,
				isAssertionFailed: true
			});
		}
		if (!_.isEmpty(task.assertions) && task.assertions !== null) {
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
				}

				data.push(assertionResult);
			}
		}

		await postMetric(
			task,
			location,
			startingDate,
			data,
			isAssertionFailed ? Status.ASSERTION_FAILED : Status.SUCCESS,
			response.status,
			responseTime
		);
	}
};
const sendRequest: (
	task: HealthCheck
) => Promise<{ response: AssertionFnOptions['response']; responseTime: number } | undefined> = async (task: HealthCheck) => {
	let axiosRequestConfig: AxiosRequestConfig = {
		method: task.method,
		url: task.url
	};
	if (task.timeout != null) {
		axiosRequestConfig = { ...axiosRequestConfig, timeout: task.timeout };
	}

	if (task.headers !== null) {
		axiosRequestConfig = { ...axiosRequestConfig, headers: task.headers };
	}
	if (task.httpUserName !== null && task.httpPassword !== null) {
		axiosRequestConfig = {
			...axiosRequestConfig,
			auth: {
				username: task.httpUserName,
				password: task.httpPassword
			}
		};
	}
	if (task.requestBody !== null) {
		axiosRequestConfig = { ...axiosRequestConfig, data: task.requestBody };
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
