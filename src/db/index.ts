import PG, { Client } from 'pg';
import { HealthCheck } from '../model/HealthCheck';
import { DataType } from '../service/AssertionService';

const Pool = PG.Client;

export const getTaskServiceClient = () => {
	return new Client({
		user: process.env.POSTGRES_USER,
		host: process.env.POSTGRES_HOST,
		database: process.env.POSTGRES_DB,
		password: process.env.POSTGRES_PASSWORD,
		port: 5432
	});
};

export const getTimeSeriesClient = () => {
	return new Client({
		user: process.env.TIMESCALE_USER,
		host: process.env.TIMESCALE_HOST,
		database: process.env.TIMESCALE_DB,
		password: process.env.TIMESCALE_PASSWORD,
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
	responseTime: number,
	errReason: string
) => {
	const client = getTimeSeriesClient();
	await client.connect();

	await client.query(
		`INSERT INTO HealthMetric (taskId, region, status, responseCode, assertions, responseTime, method, timestamp, errReason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		[
			healthMetric.id,
			location,
			status,
			responseCode,
			JSON.stringify(assertions),
			Math.floor(responseTime),
			healthMetric.method,
			date,
			errReason
		]
	);
	await client.end();
	return;
};

export const updateInProgress = async (id: string, date: Date) => {
	const client = getTaskServiceClient();
	await client.connect();
	return client.query(`UPDATE "HealthCheck" SET "inProgress" = false WHERE id = $1 AND "lastChecked" = $2`, [id, date]);
};
