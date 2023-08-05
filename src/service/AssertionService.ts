import { Assertion, AssertionType } from '../model/HealthCheck';
import { AxiosResponse } from 'axios';
import * as tls from 'tls';
import get from 'lodash/get';
const assertResponseTime = ({ assertion, responseTime }: AssertionFnOptions): { responseTime: number; isAssertionFailed: boolean } => {
	const assertionObj = { responseTime: responseTime || 0 };
	if (responseTime) {
		return { ...assertionObj, isAssertionFailed: !(responseTime <= +assertion.value) };
	} else {
		throw new Error('AssertionValInvalid');
	}
};
const assertResponseBody = ({ response, assertion }: AssertionFnOptions): { responseBody: string; isAssertionFailed: boolean } => {
	const assertionObj = { responseBody: response.data };
	const responseData = JSON.stringify(response.data);

	if (typeof assertion.value === 'string') {
		switch (assertion.compareType) {
			case 'EQUAL':
				return { ...assertionObj, isAssertionFailed: !(assertion.value === responseData) };
			case 'NOT_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(assertion.value !== responseData) };
			case 'DOES_NOT_CONTAIN':
				return { ...assertionObj, isAssertionFailed: !!responseData.includes(assertion.value) };
			case 'CONTAINS':
				return { ...assertionObj, isAssertionFailed: !responseData.includes(assertion.value) };
			default:
				return { ...assertionObj, isAssertionFailed: !(assertion.value === responseData) };
		}
	} else {
		throw new Error('AssertionValInvalid');
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
}): { responseJson: string; isAssertionFailed: boolean } => {
	const responseValue = get(response.data, assertion.key);
	return { responseJson: response.data, isAssertionFailed: !(responseValue === assertion.value) };
};

const assertResponseCode = ({ response, assertion }: AssertionFnOptions): { responseCode: number; isAssertionFailed: boolean } => {
	const assertionObj = { responseCode: response.status };
	const responseData = response.status;

	if (typeof assertion.value === 'number') {
		switch (assertion.compareType) {
			case 'EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData === assertion.value) };
			case 'NOT_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData !== assertion.value) };
			case 'SMALL':
				return { ...assertionObj, isAssertionFailed: !(responseData < assertion.value) };
			case 'SMALL_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData <= assertion.value) };
			case 'BIG':
				return { ...assertionObj, isAssertionFailed: !(responseData > assertion.value) };
			case 'BIG_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData >= assertion.value) };
			default:
				return { ...assertionObj, isAssertionFailed: !(responseData === assertion.value) };
		}
	} else {
		throw new Error('AssertionValInvalid');
	}
};
const assertResponseHeader = ({ response, assertion }: AssertionFnOptions): { responseHeader: Object; isAssertionFailed: boolean } => {
	const assertionObj = { responseHeader: response.headers };
	const responseData = response.headers[assertion.key];
	if (typeof assertion.value === 'string') {
		switch (assertion.compareType) {
			case 'EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData === assertion.value) };
			case 'NOT_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData !== assertion.value) };
			case 'DOES_NOT_CONTAIN':
				return { ...assertionObj, isAssertionFailed: !!responseData.includes(assertion.value) };
			case 'CONTAINS':
				return { ...assertionObj, isAssertionFailed: !responseData.includes(assertion.value) };
			case 'SMALL':
				return { ...assertionObj, isAssertionFailed: !(responseData < assertion.value) };
			case 'SMALL_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData <= assertion.value) };
			case 'BIG':
				return { ...assertionObj, isAssertionFailed: !(responseData > assertion.value) };
			case 'BIG_EQUAL':
				return { ...assertionObj, isAssertionFailed: !(responseData >= assertion.value) };
			default:
				return { ...assertionObj, isAssertionFailed: !responseData.includes(assertion.value) };
		}
	} else {
		throw new Error('AssertionValInvalid');
	}
};
const assertSSLCertificate = ({
	response,
	assertion,
	responseTime,
	url
}: AssertionFnOptions): { SSLWillExpire: boolean; isAssertionFailed: boolean } => {
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

	return { SSLWillExpire: isAssertionFailed, isAssertionFailed };
};

export type DataType =
	| ReturnType<typeof assertResponseTime>
	| ReturnType<typeof assertResponseBody>
	| ReturnType<typeof assertResponseJSON>
	| ReturnType<typeof assertResponseCode>
	| ReturnType<typeof assertResponseHeader>
	| ReturnType<typeof assertSSLCertificate>
	| { noSLL: boolean; isAssertionFailed: boolean };

export interface AssertionFnOptions {
	response: AxiosResponse & { tlsCert?: tls.PeerCertificate };
	assertion: Assertion;
	responseTime?: number;
	url?: string;
}
export const getHttpAssertionFunc: {
	[key in AssertionType]: ({ response, assertion, responseTime, url }: AssertionFnOptions) => DataType;
} = {
	RESPONSE_TIME: assertResponseTime,
	RESPONSE_BODY: assertResponseBody,
	RESPONSE_CODE: assertResponseCode,
	RESPONSE_HEADER: assertResponseHeader,
	RESPONSE_JSON: assertResponseJSON,
	SSL_CERTIFICATE_EXPIRES_IN: assertSSLCertificate
};
