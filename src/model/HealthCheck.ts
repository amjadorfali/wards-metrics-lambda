/**
 * Model User
 *
 */
export type User = {
	id: number;
	subId: string;
	phoneNumber: string;
	email: string;
};

/**
 * Model Team
 *
 */
export type Team = {
	id: number;
	name: string;
};

/**
 * Model Incident
 *
 */
export type Incident = {
	id: number;
	status: IncidentStatus;
	startedAt: Date;
	cause: string;
	userId: number | null;
	teamId: number;
	healthCheckId: string;
};

/**
 * Model HealthCheck
 *
 */
export type HealthCheck = {
	id: string;
	name: string;
	method: Method;
	timeout: number | null;
	enabled: boolean;
	type: HealthCheckType;
	inProgress: boolean;
	interval: number;
	lastChecked: Date;
	url: string;
	locations: Location[];
	port: number | null;
	createdAt: Date;
	updatedAt: Date;
	teamId: number;
	assertionId: number | null;
	metadata: HealthTaskMetadata;
	httpUserName: string | null;
	httpPassword: string | null;
	headers: { key: string; value: string } | null;
	assertions: Assertion[] | null;
	requestBody: Object | null;
	verifySSL: boolean;
};

/**
 * Model HealthTaskMetadata
 *
 */
export type HealthTaskMetadata = {
	id: number;
	httpUserName: string | null;
	httpPassword: string | null;
	headers: Object | null;
	assertions: Object | null;
	requestBody: Object | null;
	verifySSL: boolean;
};

/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export let HealthCheckType: {
	SWITCH: 'SWITCH';
	HTTP: 'HTTP';
	SMTP: 'SMTP';
	POP3: 'POP3';
	IMAP: 'IMAP';
	TCP: 'TCP';
	UDP: 'UDP';
};

export type HealthCheckType = (typeof HealthCheckType)[keyof typeof HealthCheckType];

export let IncidentStatus: {
	ONGOING: 'ONGOING';
	RESOLVED: 'RESOLVED';
	ACKNOWLEDGED: 'ACKNOWLEDGED';
};

export type IncidentStatus = (typeof IncidentStatus)[keyof typeof IncidentStatus];

export let Location: {
	FRANKFURT: 'FRANKFURT';
	IRELAND: 'IRELAND';
	CALIFORNIA: 'CALIFORNIA';
	DUBAI: 'DUBAI';
	OHIO: 'OHIO';
	STOCKHOLM: 'STOCKHOLM';
	SINGAPORE: 'SINGAPORE';
	SYDNEY: 'SYDNEY';
	SAO_PAULO: 'SAO_PAULO';
};

export type Location = (typeof Location)[keyof typeof Location];

export let Method: {
	GET: 'GET';
	POST: 'POST';
	PUT: 'PUT';
	PATCH: 'PATCH';
	HEAD: 'HEAD';
};

export type Method = (typeof Method)[keyof typeof Method];
export type Assertion = {
	id: number;
	type: AssertionType;
	value: any;
	compareType: CompareType;
	key: string;
	healthCheckId: string | null;
};

export type Header = {
	id: number;
	type: string;
	value: string;
	healthCheckId: string | null;
};
export let CompareType: {
	SMALL: 'SMALL';
	BIG: 'BIG';
	SMALL_EQUAL: 'SMALL_EQUAL';
	BIG_EQUAL: 'BIG_EQUAL';
	EQUAL: 'EQUAL';
	DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN';
	NOT_EQUAL: 'NOT_EQUAL';
	CONTAINS: 'CONTAINS';
};

export type CompareType = (typeof CompareType)[keyof typeof CompareType];

export let AssertionType: {
	RESPONSE_TIME: 'RESPONSE_TIME';
	RESPONSE_CODE: 'RESPONSE_CODE';
	RESPONSE_BODY: 'RESPONSE_BODY';
	RESPONSE_JSON: 'RESPONSE_JSON';
	RESPONSE_HEADER: 'RESPONSE_HEADER';
	SSL_CERTIFICATE_EXPIRES_IN: 'SSL_CERTIFICATE_EXPIRES_IN';
};

export type AssertionType = (typeof AssertionType)[keyof typeof AssertionType];
export const Status = {
	ASSERTION_FAILED: 0,
	SUCCESS: 1,
	ERROR: 2
};
