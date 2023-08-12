import { SQSEvent } from 'aws-lambda';
import { HealthCheck } from '../model/HealthCheck';
import { checkHTTP } from '../helpers/checks/checkHTTP';
import { checkTCPPort } from '../helpers/checks/checkTCPPort';

export const run = async (event: SQSEvent) => {
	console.log('Processing event:', event);
	for (const record of event.Records) {
		try {
			const task: HealthCheck = JSON.parse(record.body);
			const location = event.Records[0].awsRegion;
			console.log('Processing Record', task);
			if (task.type === 'HTTP') {
				await checkHTTP(task, location);
			}
		} catch (e) {
			console.error(e);
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
