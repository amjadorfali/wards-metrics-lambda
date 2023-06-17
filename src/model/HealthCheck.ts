export type HealthCheck = {
  id: string
  userId: string
  name: string
  method: Method
  timeout: number | null
  verifySSL: boolean
  enabled: boolean
  type: HealtCheckType
  inProgress: boolean
  interval: number | null
  lastChecked: Date
  url: string
  locations: Location[]
  createdAt: Date
  updatedAt: Date
  headers: Header[]
  assertions: Assertion[]

}

/**
 * Model Assertion
 *
 */
export type Assertion = {
  id: number
  type: AssertionType
  key: string
  value: string
  compareType: CompareType
  healthCheckId: string | null
}

/**
 * Model Header
 *
 */
export type Header = {
  id: number
  type: string
  value: string
  healthCheckId: string | null
}


/**
 * Enums
 */

// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

export let AssertionType: {
  RESPONSE_TIME: 'RESPONSE_TIME',
  RESPONSE_CODE: 'RESPONSE_CODE',
  RESPONSE_BODY: 'RESPONSE_BODY',
  RESPONSE_JSON: 'RESPONSE_JSON',
  RESPONSE_HEADER: 'RESPONSE_HEADER',
  SSL_CERTIFICATE_EXPIRES_IN: 'SSL_CERTIFICATE_EXPIRES_IN'
};

export type AssertionType = (typeof AssertionType)[keyof typeof AssertionType]


export let CompareType: {
  SMALL: 'SMALL',
  BIG: 'BIG',
  SMALL_EQUAL: 'SMALL_EQUAL',
  BIG_EQUAL: 'BIG_EQUAL',
  DOES_NOT_CONTAIN: 'DOES_NOT_CONTAIN',
  EQUAL: 'EQUAL',
  NOT_EQUAL: 'NOT_EQUAL'
};

export type CompareType = (typeof CompareType)[keyof typeof CompareType]


export let HealtCheckType: {
  SWITCH: 'SWITCH',
  HTTP: 'HTTP',
  BROWSER: 'BROWSER',
  TCP: 'TCP',
  UDP: 'UDP'
};

export type HealtCheckType = (typeof HealtCheckType)[keyof typeof HealtCheckType]


export let Location: {
  FRANKFURT: 'FRANKFURT',
  IRELAND: 'IRELAND',
  CALIFORNIA: 'CALIFORNIA',
  DUBAI: 'DUBAI',
  OHIO: 'OHIO',
  STOCKHOLM: 'STOCKHOLM',
  SINGAPORE: 'SINGAPORE',
  SYDNEY: 'SYDNEY',
  SAO_PAULO: 'SAO_PAULO'
};

export type Location = (typeof Location)[keyof typeof Location]


export let Method: {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  HEAD: 'HEAD'
};

export type Method = (typeof Method)[keyof typeof Method]
