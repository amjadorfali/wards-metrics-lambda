import {Assertion, AssertionType} from "../model/HealthCheck";
import {AxiosResponse} from 'axios';


const assertResponseTime = (response: AxiosResponse<any, any>, assertion: Assertion, responseTime: number = 0): { responseTime: number, isAssertionFailed: boolean } => {
  const assertionObj = {responseTime: responseTime}
  const assertionValue = parseFloat(assertion.value)
  switch (assertion.compareType) {
    case "BIG":
      return {...assertionObj, isAssertionFailed: responseTime > assertionValue}
    case "BIG_EQUAL":
      return {...assertionObj, isAssertionFailed: responseTime >= assertionValue}
    case "SMALL":
      return {...assertionObj, isAssertionFailed: responseTime < assertionValue}
    case "SMALL_EQUAL":
      return {...assertionObj, isAssertionFailed: responseTime <= assertionValue}
    default:
      return {...assertionObj, isAssertionFailed: false}

  }
}
const assertResponseBody = (response: AxiosResponse<any, any>, assertion: Assertion): { responseBody: string, isAssertionFailed: boolean } => {
  const assertionObj = {responseBody: response.data}
  const responseData = JSON.stringify(response.data)
  switch (assertion.compareType) {
    case "EQUAL":
      return {...assertionObj, isAssertionFailed: assertion.value === responseData}
    case "NOT_EQUAL":
      return {...assertionObj, isAssertionFailed: assertion.value !== responseData}
    case "DOES_NOT_CONTAIN":
      return {...assertionObj, isAssertionFailed: !responseData.includes(assertion.value)}
    case "CONTAINS":
      return {...assertionObj, isAssertionFailed: responseData.includes(assertion.value)}
    default:
      return {...assertionObj, isAssertionFailed: false}

  }
}
const assertResponseJSON = (response: AxiosResponse<any, any>, assertion: Assertion): { responseJson: string, isAssertionFailed: boolean } => {
  return {responseJson: "", isAssertionFailed: false}
}

const assertResponseCode = (response: AxiosResponse<any, any>, assertion: Assertion): { responseCode: number, isAssertionFailed: boolean } => {
  const assertionObj = {responseCode: response.status}
  const assertionValue = parseFloat(assertion.value)

  switch (assertion.compareType) {
    case "EQUAL":
      return {...assertionObj, isAssertionFailed: response.status === assertionValue}
    default:
      return {...assertionObj, isAssertionFailed: false}

  }
}
const assertResponseHeader = (response: AxiosResponse<any, any>, assertion: Assertion): { responseHeader: string, isAssertionFailed: boolean } => {
  const headerVal = response.headers[assertion.type]
  const assertionObj = {responseHeader: response.headers[assertion.type]}
  const responseData = JSON.stringify(response.data)
  switch (assertion.compareType) {
    case "EQUAL":
      return {...assertionObj, isAssertionFailed: assertion.value === responseData}
    case "NOT_EQUAL":
      return {...assertionObj, isAssertionFailed: assertion.value !== responseData}
    case "DOES_NOT_CONTAIN":
      return {...assertionObj, isAssertionFailed: !responseData.includes(assertion.value)}
    case "CONTAINS":
      return {...assertionObj, isAssertionFailed: responseData.includes(assertion.value)}
    case "SMALL":
      return {...assertionObj, isAssertionFailed: headerVal < assertion.value}
    case "SMALL_EQUAL":
      return {...assertionObj, isAssertionFailed: headerVal <= assertion.value}
    case "BIG":
      return {...assertionObj, isAssertionFailed: headerVal > assertion.value}
    case "BIG_EQUAL":
      return {...assertionObj, isAssertionFailed: headerVal >= assertion.value}
    default:
      return {...assertionObj, isAssertionFailed: responseData.includes(assertion.value)}

  }
}
const assertSSLCertificate = (response: AxiosResponse<any, any>, assertion: Assertion): { hasSSL: boolean, isAssertionFailed: boolean } => {
  return {hasSSL: false, isAssertionFailed: false}
}

export type DataType = ReturnType<typeof assertResponseTime> |
  ReturnType<typeof assertResponseBody> |
  ReturnType<typeof assertResponseJSON> |
  ReturnType<typeof assertResponseCode> |
  ReturnType<typeof assertResponseHeader> |
  ReturnType<typeof assertSSLCertificate>;


export const getHttpAssertionFunc: { [key in AssertionType]: (response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number) => DataType } = {
  RESPONSE_TIME: assertResponseTime,
  RESPONSE_BODY: assertResponseBody,
  RESPONSE_CODE: assertResponseCode,
  RESPONSE_HEADER: assertResponseHeader,
  RESPONSE_JSON: assertResponseJSON,
  SSL_CERTIFICATE_EXPIRES_IN: assertSSLCertificate
}

