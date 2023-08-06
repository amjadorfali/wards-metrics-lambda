import { processTask } from './functions/processHealthMetric/processHealthMetric';
import { SQSEvent } from 'aws-lambda';
import { HealthCheck } from './model/HealthCheck';
import axios from 'axios';

const testObj: HealthCheck = {
	id: '9',
	name: 'task-5',
	method: 'GET',
	timeout: 123000,
	httpUserName: 'Sako',
	httpPassword: 'is gay',
	headers: [{ key: 'asd', value: 'asd' }],
	assertions: [
		{ value: 199, type: 'RESPONSE_CODE', compareType: 'SMALL_EQUAL' },
		{ value: 200, type: 'RESPONSE_CODE', compareType: 'EQUAL' },
		{ value: 201, type: 'RESPONSE_CODE', compareType: 'BIG_EQUAL' },
		{ value: 3000, type: 'RESPONSE_TIME', compareType: 'SMALL_EQUAL' },
		{ value: 1000, type: 'RESPONSE_TIME', compareType: 'BIG_EQUAL' },

		{ value: 'hello', type: 'RESPONSE_VALUE', compareType: 'EQUAL' },
		{ value: 'hello', type: 'RESPONSE_VALUE', compareType: 'NOT_EQUAL' },
		{ value: 'hello', type: 'RESPONSE_VALUE', compareType: 'CONTAINS' },
		{ value: 'hello', type: 'RESPONSE_VALUE', compareType: 'DOES_NOT_CONTAIN' },
		{ value: 'Ayre fek', key: 'samir.sako.string', type: 'RESPONSE_JSON', compareType: 'EQUAL' },
		{ value: '2423', key: 'samir.sako.number', type: 'RESPONSE_JSON', compareType: 'EQUAL' },
		{ value: 'false', key: 'samir.sako.boolean', type: 'RESPONSE_JSON', compareType: 'EQUAL' },
		{ value: 'ayre', key: 'samir.sako.array[0]', type: 'RESPONSE_JSON', compareType: 'EQUAL' },
		{ value: 'Fik', key: 'ZebiFeek', type: 'RESPONSE_HEADER', compareType: 'EQUAL' },

		{ value: 1000, type: 'RESPONSE_TIME', compareType: 'SMALL_EQUAL' },
		{ value: 46, type: 'SSL_CERTIFICATE_EXPIRES_IN', compareType: 'BIG' }
	],
	requestBody: null,
	verifySSL: true,
	enabled: true,
	locations: ['FRANKFURT'],
	createdAt: new Date('2023-06-30T11:11:30.046Z'),
	updatedAt: new Date('2023-06-30T11:11:30.047Z'),
	inProgress: false,
	lastChecked: new Date('2023-06-30T11:11:30.043Z'),
	// None-SSL URL
	// url: 'http://www.flexboxdefense.com',
	// url: 'https://amjadorfali.com',
	url: 'http://localhost:8700/api/health-check',
	// /	url: 'https://amjadorfali.com',
	teamId: 1,
	type: 'HTTP',
	assertionId: 9,
	port: null,
	interval: 300
};
async function test() {
	const task: string = JSON.stringify(testObj);
	const sqsRecord: SQSEvent = {
		Records: [
			{
				body: task,
				messageId: `1`,
				attributes: { ApproximateFirstReceiveTimestamp: '', ApproximateReceiveCount: '', SenderId: '', SentTimestamp: '' },
				awsRegion: 'US',
				eventSource: '',
				eventSourceARN: '',
				md5OfBody: '',
				messageAttributes: {},
				receiptHandle: ''
			}
		]
	};
	await processTask(sqsRecord);
}

test();
