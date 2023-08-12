import { SQSEvent } from 'aws-lambda';
import { HealthCheck } from '../model/HealthCheck';
import { checkHTTP } from '../helpers/checks/checkHTTP';
import { checkTCPPort } from '../helpers/checks/checkTCPPort';

export const run = async (event: SQSEvent) => {
	console.log(`Processing records: ${JSON.stringify(event.Records)}`);
	for (const record of event.Records) {
		try {
			var task: HealthCheck = JSON.parse(record.body);
			const location = record.awsRegion;

			const { receiptHandle, body, ...toLog } = record;
			console.log(JSON.stringify({ ...toLog, task }));

			if (task.type === 'HTTP') {
				await checkHTTP(task, location);
			}

			console.log(`- Processing Ended for SQS msg ID: ${record.messageId}, Task ID: ${task.id} -`);
		} catch (e) {
			// @ts-ignore - Need to fix TS issue with declaring Vars
			console.error(`- Error occured for SQS msg ID: ${record.messageId}, Task ID: ${task.id} -\n`, 'Error: ', e);
		}
	}
};

const getRequest = async (task: HealthCheck) => {
	let response: { response: string; responseTime: number } | undefined;
	switch (task.type) {
		case 'POP3':
			response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5);
			break;
		case 'SMTP':
			response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5);
			break;
		case 'IMAP':
			response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5);
			break;
		case 'TCP':
			response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5);
			break;
		case 'UDP':
			break;
	}
	return response;
};
