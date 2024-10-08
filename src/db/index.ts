import PG, { Client } from 'pg';
import { HealthCheck } from '../model/HealthCheck';
import { DataType } from '../service/AssertionService';

const Pool = PG.Client;

export const getTaskServiceClient = async () => {
	const client = new Client({
		user: process.env.POSTGRES_USER,
		host: process.env.POSTGRES_HOST,
		database: process.env.POSTGRES_DB,
		password: process.env.POSTGRES_PASSWORD,
		port: 5432
	});
	await client.connect();
	return client;
};

export const getTimeSeriesClient = async () => {
	const client = new Client({
		user: process.env.TIMESCALE_USER,
		host: process.env.TIMESCALE_HOST,
		database: process.env.TIMESCALE_DB,
		password: process.env.TIMESCALE_PASSWORD,
		port: 5432
	});
	await client.connect();
	return client;
};

export const postMetric = async (
	healthMetric: HealthCheck,
	location: string,
	date: Date,
	assertions: DataType[],
	status: number,
	responseCode: number,
	responseTime: number,
	errReason: string,
	client: PG.Client
) => {
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
	return;
};

export const updateInsights = async (id: string, status: number, sslIssuedBy: string, sslExpiresOn: string, client: PG.Client) => {
	return client.query(`UPDATE task_insight SET "sslIssuedBy" = $2, "sslExpiresOn" = $3, status = $4 WHERE id=$1`, [
		id,
		sslIssuedBy,
		sslExpiresOn,
		status
	]);
};
