import {Assertion, AssertionType} from "../model/HealthCheck";
import {AxiosResponse} from 'axios';



const assertResponseTime = (response: AxiosResponse<any, any>, assertion: Assertion, responseTime: number): { responseTime: number, isResponseTimeFailed: boolean } => {
  const assertionValue = parseFloat(assertion.value)
  switch (assertion.compareType) {
    case "BIG":
      return {responseTime: responseTime, isResponseTimeFailed: responseTime > assertionValue}
    case "BIG_EQUAL":
      return {responseTime: responseTime, isResponseTimeFailed: responseTime >= assertionValue}
    case "SMALL":
      return {responseTime: responseTime, isResponseTimeFailed: responseTime < assertionValue}
    case "SMALL_EQUAL":
      return {responseTime: responseTime, isResponseTimeFailed: responseTime <= assertionValue}
  }
}
const assertResponseBody = (response: AxiosResponse<any, any>, assertion: Assertion): { responseBody: string } => {

}
const assertResponseJSON = (response: AxiosResponse<any, any>, assertion: Assertion): { responseJson: string } => {

}
const assertResponseCode = (response: AxiosResponse<any, any>, assertion: Assertion): { responseCode: number } => {

}
const assertResponseHeader = (response: AxiosResponse<any, any>, assertion: Assertion): { responseHeader: string } => {

}
const assertSSLCertificate = (response: AxiosResponse<any, any>, assertion: Assertion): { hasSSL: boolean } => {

}

export type DataType = ReturnType<typeof assertResponseTime> |
  ReturnType<typeof assertResponseBody> |
  ReturnType<typeof assertResponseJSON> |
  ReturnType<typeof assertResponseCode> |
  ReturnType<typeof assertResponseHeader> |
  ReturnType<typeof assertSSLCertificate>;


export const getAssertionFunc: { [key in AssertionType]: (response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number) => DataType } = {
  RESPONSE_TIME: assertResponseTime,
  RESPONSE_BODY: assertResponseBody,
  RESPONSE_CODE: assertResponseCode,
  RESPONSE_HEADER: assertResponseHeader,
  RESPONSE_JSON: assertResponseJSON,
  SSL_CERTIFICATE_EXPIRES_IN: assertSSLCertificate
}

