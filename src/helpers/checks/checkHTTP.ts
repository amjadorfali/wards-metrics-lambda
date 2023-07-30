import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { HealthCheck, Status } from '../../model/HealthCheck';
import { DataType, getHttpAssertionFunc } from '../../service/AssertionService';
import _ from 'lodash';
import { postMetric, postMetricError } from '../../db';
import https from 'https';

export const checkHTTP = async (task: HealthCheck, location: string) => {
	const startingDate = new Date();
	try {
		const respond = await sendRequest(task);

		if (respond) {
			const { response, responseTime } = respond;
			let data: DataType[] = [];
			let sendNotification = false;
			let isAssertionFailed = false;
			if (!_.isEmpty(task.assertions) && task.assertions !== null) {
				const assertions = task.assertions;
				for (let i = 0; i < assertions.length; i++) {
					const { type } = assertions[i];
					const assertionFunc = getHttpAssertionFunc[type];
					const assertionResult = assertionFunc({ response, assertion: assertions[i], responseTime, url: task.url });
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
	} catch (err: any) {
		await postMetricError(task, startingDate, Status.ERROR, err.responseCode, err.response);
	}
};
const sendRequest: (task: HealthCheck) => Promise<{ response: AxiosResponse; responseTime: number } | undefined> = async (
	task: HealthCheck
) => {
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
		if (task.requestBody !== null) {
			axiosRequestConfig = { ...axiosRequestConfig, data: task.requestBody };
		}
		if (task.verifySSL) {
			const agent = new https.Agent({ rejectUnauthorized: false });

			axiosRequestConfig.httpsAgent = agent;
		}
	}
	const start = performance.now();
	const response: AxiosResponse = await axios(axiosRequestConfig);
	return { response, responseTime: performance.now() - start };
};
