import { run } from './functions/processHealthMetric';
import { SQSEvent } from 'aws-lambda';
import { HealthCheck } from './model/HealthCheck';
const testObj2= {
	"id": "fb8647a9-56fb-466e-a159-1ce4c91a842b",
	"name": "1231231",
	"method": "GET",
	"timeout": 10000,
	"enabled": true,
	"type": "HTTP",
	"interval": 180,
	"url": "https://amjadorfali.com",
	"locations": [
		"FRANKFURT",
		"IRELAND",
		"DUBAI",
		"SYDNEY",
		"CALIFORNIA"
	],
	"createdAt": "2023-08-16T21:45:30.571Z",
	"updatedAt": "2023-08-16T21:45:30.572Z",
	"teamId": 3,
	"insightsId": "fb8647a9-56fb-466e-a159-1ce4c91a842b",
	"metadataId": 9,
	"httpUserName": "",
	"httpPassword": "",
	"headers": [],
	"assertions": [],
	"requestBody": "",
	"verifySSL": true,
	"sslIssuedBy": null,
	"sslExpiresOn": null,
	"status": null
}
let environment = process.env.ACTIVE_PROFILE;

if (!environment || environment === 'development') {
	require('dotenv').config();
	environment = process.env.ACTIVE_PROFILE;
}
async function test() {
	const task: string = JSON.stringify(testObj2);
	const sqsRecord: SQSEvent = {
		Records: [
			{
				body: task,
				messageId: `1`,
				attributes: { ApproximateFirstReceiveTimestamp: '', ApproximateReceiveCount: '', SenderId: '', SentTimestamp: '' },
				awsRegion: 'IRELAND',
				// 			FRANKFURT
				// IRELAND
				// CALIFORNIA
				eventSource: '',
				eventSourceARN: '',
				md5OfBody: '',
				messageAttributes: {},
				receiptHandle: ''
			}
		]
	};
	await run(sqsRecord);
}

test();
