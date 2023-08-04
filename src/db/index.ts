import PG from 'pg';
import { HealthCheck } from '../model/HealthCheck';
import { DataType } from '../service/AssertionService';

const Pool = PG.Client;

export const getTaskServiceClient = () => {
	return new Pool({
		user: 'wardsprod',
		host: 'wards-prod.c1kcykenvknf.eu-central-1.rds.amazonaws.com',
		database: 'master',
		password: '02hkM2EpHYFeBvZCkvea',
		port: 5432
	});
};

export const getTimeSeriesClient = () => {
	return new Pool({
		user: 'remoteops-master',
		host: 'localhost',
		database: 'postgres',
		password: 'metric123',
		port: 5432
	});
};

export const postMetric = async (
	healthMetric: HealthCheck,
	location: string,
	date: Date,
	assertions: DataType[],
	status: number,
	responseCode: number,
	responseTime: number
) => {
	const client = getTimeSeriesClient();
	await client.connect();
	return client.query(`INSERT INTO userevents_mock (home_id, timestamp, responsetime, status, location) VALUES ($1, $2, $3, $4, $5)`, [
		healthMetric.id,
		date,
		Math.floor(responseTime),
		1, // Status success
		'US' //location
	]);
};

export async function postMetricError(task: HealthCheck, date: Date, status: number, responseCode: number, errReason: string) {
	const client = getTimeSeriesClient();
	await client.connect();
	return client.query(`INSERT INTO HealthMetric (taskId, time, status, responseCode, result) VALUES ($1, $2, $3, $4, $5)`, [
		task.id,
		date,
		status,
		responseCode,
		errReason
	]);
}

export const updateInProgress = async (id: string, date: Date) => {
	const client = getTaskServiceClient();
	await client.connect();
	return client.query(`UPDATE "HealthCheck" SET "inProgress" = false WHERE id = $1 AND "lastChecked" = $2`, [id, date]);
};
