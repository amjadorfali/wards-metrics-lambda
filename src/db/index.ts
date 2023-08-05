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

//TODO: Add error reason as well
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
	const res = await client.query('SELECT * FROM HealthMetric WHERE taskId = $1', [healthMetric.id]);
	console.log('existing rows', res.rows);
	return client.query(
		`INSERT INTO HealthMetric (taskId, region, status, responseCode, assertions, responseTime, method, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		[healthMetric.id, location, status, responseCode, JSON.stringify(assertions), Math.floor(responseTime), healthMetric.method, date]
	);
};

export async function postMetricError(
	healthMetric: HealthCheck,
	date: Date,
	status: number,
	responseCode: number,
	errReason: string,
	location: string,
	responseTime: number
) {
	const client = getTimeSeriesClient();
	await client.connect();
	const res = await client.query('SELECT * FROM HealthMetric WHERE taskId = $1', [healthMetric.id]);
	console.log('existing rows', res.rows);
	return client.query(
		`INSERT INTO HealthMetric (taskId, timestamp, status, responseCode, errReason, region, responseTime) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		[healthMetric.id, date, status, responseCode, errReason, location, responseTime]
	);
}

export const updateInProgress = async (id: string, date: Date) => {
	const client = getTaskServiceClient();
	await client.connect();
	return client.query(`UPDATE "HealthCheck" SET "inProgress" = false WHERE id = $1 AND "lastChecked" = $2`, [id, date]);
};
