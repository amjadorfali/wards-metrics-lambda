import { run } from './functions/processHealthMetric';
import { SQSEvent } from 'aws-lambda';
import { HealthCheck } from './model/HealthCheck';
const testObj2= {
	"id": "1ad04106-5426-486c-8e56-706b91586bf1",
	"name": "toFail",
	"method": "GET",
	"timeout": 10000,
	"enabled": true,
	"type": "HTTP",
	"interval": 180,
	"url": "https://amochan",
	"locations": [
		"FRANKFURT",
		"IRELAND",
		"DUBAI",
		"SYDNEY",
		"CALIFORNIA"
	],
	"createdAt": "2023-08-31T11:03:09.818Z",
	"updatedAt": "2023-08-31T11:03:09.819Z",
	"teamId": 4,
	"insightsId": "c2318541-73b9-416f-ab03-0a66e3b81803",
	"metadataId": 19,
	"httpUserName": "",
	"httpPassword": "",
	"headers": [],
	"assertions": [],
	"requestBody": "",
	"verifySSL": true,
	"issuedUserEmail": "turkyilmazah+1@gmail.com"
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
