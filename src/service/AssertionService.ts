import { Assertion, AssertionType } from '../model/HealthCheck';
import { AxiosResponse } from 'axios';
import * as tls from 'tls';
import get from 'lodash/get';

const assertResponseTime = ({ assertion, responseTime }: AssertionFnOptions): DataType => {
	let message = '';
	switch (assertion.compareType) {
		case 'BIG_EQUAL':
			message = `Response Time >= ${assertion.value}`;
			return { message, isAssertionFailed: !(responseTime >= +assertion.value) };
		case 'SMALL_EQUAL':
		default:
			message = `Response Time <= ${assertion.value}`;
			return { message, isAssertionFailed: !(responseTime <= +assertion.value) };
	}
};
const assertResponseValue = ({ response, assertion }: AssertionFnOptions): DataType => {
	let message = '';
	const responseData = String(response.data);

	switch (assertion.compareType) {
		case 'NOT_EQUAL':
			message = `Response Value != ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData !== assertion.value) };
		case 'DOES_NOT_CONTAIN':
			message = `Response Value does not contain ${assertion.value}`;
			return { message, isAssertionFailed: !!responseData.includes(assertion.value) };
		case 'CONTAINS':
			message = `Response Value contains ${assertion.value}`;
			return { message, isAssertionFailed: !responseData.includes(assertion.value) };
		case 'EQUAL':
		default:
			message = `Response Value = ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData === assertion.value) };
	}
};
const assertResponseJSON = ({
	response,
	assertion
}: {
	response: AxiosResponse<any, any>;
	assertion: Assertion;
	responseTime?: number;
	url?: string;
}): DataType => {
	// Change the `=` sign in the msg to the assertion.compareType if we add more compareTypes
	const message = `Response JSON ${assertion.key} = ${assertion.value}`;
	const responseData = String(get(response.data, assertion.key ?? ''));
	return { message, isAssertionFailed: !(responseData === assertion.value) };
};

const assertResponseCode = ({ response, assertion }: AssertionFnOptions): DataType => {
	const responseData = response.status;
	let message = '';
	switch (assertion.compareType) {
		case 'NOT_EQUAL':
			message = `Response Code != ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData !== assertion.value) };
		case 'SMALL':
			message = `Response Code < ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData < assertion.value) };
		case 'SMALL_EQUAL':
			message = `Response Code <= ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData <= assertion.value) };
		case 'BIG':
			message = `Response Code > ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData > assertion.value) };
		case 'BIG_EQUAL':
			message = `Response Code >= ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData >= assertion.value) };
		case 'EQUAL':
		default:
			message = `Response Code = ${assertion.value}`;
			return { message, isAssertionFailed: !(responseData === assertion.value) };
	}
};
const assertResponseHeader = ({ response, assertion }: AssertionFnOptions): DataType => {
	// Change the `=` sign in the msg to the assertion.compareType if we add more compareTypes
	const message = `Response Header ${assertion.key} = ${assertion.value}`;
	const responseData = String(get(response.headers, (assertion.key ?? '').toLowerCase()));
	return { message, isAssertionFailed: !(responseData === assertion.value) };
};
const assertSSLCertificate = ({ response, assertion, responseTime, url }: AssertionFnOptions): DataType => {
	// Change the `<` sign in the msg to the assertion.compareType if we add more compareTypes
	const message = `SSL Certificate Expiration < ${assertion.value}`;
	// Validate SSL certificate
	const certificate = response.tlsCert;
	let isAssertionFailed = false;
	if (certificate && certificate.valid_to) {
		const validTo = new Date(certificate.valid_to).getTime();
		const now = new Date().getTime();
		const diffTime = Math.abs(validTo - now);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays < parseInt(assertion.value)) {
			isAssertionFailed = true;
			console.error(`SSL Certificate will expire soon. It will expire in ${diffDays} day(s).`);
		}
	} else {
		isAssertionFailed = true;
		console.error(`SSL Certificate is not valid.`);
	}

	return { message, isAssertionFailed };
};

export type DataType = { message: string; isAssertionFailed: boolean };

export interface AssertionFnOptions {
	response: AxiosResponse & { tlsCert?: tls.PeerCertificate };
	assertion: Assertion;
	responseTime: number;
	url?: string;
}
export const getHttpAssertionFunc: {
	[key in AssertionType]: ({ response, assertion, responseTime, url }: AssertionFnOptions) => DataType;
} = {
	RESPONSE_TIME: assertResponseTime,
	RESPONSE_VALUE: assertResponseValue,
	RESPONSE_CODE: assertResponseCode,
	RESPONSE_HEADER: assertResponseHeader,
	RESPONSE_JSON: assertResponseJSON,
	SSL_CERTIFICATE_EXPIRES_IN: assertSSLCertificate
};
