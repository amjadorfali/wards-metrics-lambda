import { SQSEvent } from 'aws-lambda';
import { HealthCheck, Locations } from '../model/HealthCheck';
import { checkHTTP } from '../helpers/checks/checkHTTP';
import { checkTCPPort } from '../helpers/checks/checkTCPPort';

const RegionKeyToLabel: { [key: string]: keyof typeof Locations } = {
	'eu-central-1': Locations.FRANKFURT,
	'eu-west-1': Locations.IRELAND,
	'ap-southeast-2': Locations.SYDNEY,
	'us-west-1': Locations.CALIFORNIA,
	'me-central-1': Locations.DUBAI
};
export const run = async (event: SQSEvent) => {
	console.log(`Processing records: ${JSON.stringify(event.Records)}`);
	const promises: Promise<any>[] = [];
	for (const record of event.Records) {
		try {
			var task: HealthCheck = JSON.parse(record.body);
			const location = RegionKeyToLabel[record.awsRegion] || record.awsRegion;

			const { receiptHandle, body, ...toLog } = record;
			console.log(JSON.stringify({ ...toLog, task }));

			if (task.type === 'HTTP') {
				promises.push(
					checkHTTP(task, location)
						.then(() => console.log(`- Processing Ended for SQS msg ID: ${record.messageId}, Task ID: ${task.id} -`))
						.catch((e) => console.error(`- Error occured for SQS msg ID: ${record.messageId}, Task ID: ${task.id} -\n`, 'Error: ', e))
				);
			}
		} catch (e) {
			// @ts-ignore - Need to fix TS issue with declaring Vars
			console.error(`- Error occured for SQS msg ID: ${record.messageId}, Task ID: ${task.id} -\n`, 'Error: ', e);
		}
	}

	await Promise.all(promises);
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
