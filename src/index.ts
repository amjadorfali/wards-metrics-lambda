import { processTask } from './functions/processHealthMetric/processHealthMetric';
import { SQSEvent } from 'aws-lambda';

const testObj = {
	id: 9,
	name: 'task-5',
	method: 'GET',
	timeout: 123000,
	enabled: true,
	locations: '{IRELAND}',
	createdAt: '2023-06-30T11:11:30.046Z',
	updatedAt: '2023-06-30T11:11:30.047Z',
	inProgress: false,
	lastChecked: '2023-06-30T11:11:30.043Z',
	// None-SSL URL
	// url: 'http://www.flexboxdefense.com',
	// url: 'https://amjadorfali.com',
	url: 'http://localhost:8700/api/health-check',
	// /	url: 'https://amjadorfali.com',
	teamId: 1,
	type: 'HTTP',
	assertionId: 9,
	port: null,
	interval: 300,
	httpUserName: null,
	httpPassword: null,
	headers: { type: 'asd', value: 'asd' },
	assertions: [
		{ value: 200, type: 'RESPONSE_CODE', compareType: 'EQUAL' },
		{ value: 1000, type: 'RESPONSE_TIME', compareType: 'SMALL_EQUAL' },
		// { value: 123, type: 'RESPONSE_JSON', compareType: 'EQUAL', key: 'arrTest[0].childArr' },
		{ value: 5, type: 'SSL_CERTIFICATE_EXPIRES_IN' }
	],

	requestBody: null,
	verifySSL: true
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
