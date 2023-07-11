import {Assertion, AssertionType} from "../model/HealthCheck";
import {AxiosResponse} from 'axios';
import * as tls from "tls";


const assertResponseTime = ({
                              assertion,
                              responseTime
                            }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }): { responseTime: number, isAssertionFailed: boolean } => {
  const assertionObj = {responseTime: responseTime || 0}
  if (responseTime) {
    return {...assertionObj, isAssertionFailed: responseTime <= +assertion.value}
  } else {
    throw new Error("AssertionValInvalid")
  }

}
const assertResponseBody = ({
                              response,
                              assertion,
                            }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }): { responseBody: string, isAssertionFailed: boolean } => {
  const assertionObj = {responseBody: response.data}
  const responseData = JSON.stringify(response.data)

  if (typeof assertion.value === 'string') {
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
        return {...assertionObj, isAssertionFailed: assertion.value === responseData}
    }
  } else {
    throw new Error("AssertionValInvalid")
  }
}
const assertResponseJSON = ({
                              response,
                              assertion,
                            }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }): { responseJson: string, isAssertionFailed: boolean } => {
  return {responseJson: response.data, isAssertionFailed: response.data[assertion.key] === assertion.value}
}

const assertResponseCode = ({
                              response,
                              assertion,
                            }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }): { responseCode: number, isAssertionFailed: boolean } => {
  const assertionObj = {responseCode: response.status}

  if (typeof assertion.value === "object") {
    return {
      ...assertionObj, isAssertionFailed: !assertion.value.includes(response.status)
    }
  } else {
    throw new Error("AssertionValInvalid")
  }
}
const assertResponseHeader = ({
                                response,
                                assertion,
                              }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }): { responseHeader: string, isAssertionFailed: boolean } => {
  return {responseHeader: response.data, isAssertionFailed: response.headers[assertion.key] === assertion.value}
  // if (typeof assertion.value === "string") {
   // switch (assertion.compareType) {
    //   case "EQUAL":
    //     return {...assertionObj, isAssertionFailed: assertion.value === responseData}
    //   case "NOT_EQUAL":
    //     return {...assertionObj, isAssertionFailed: assertion.value !== responseData}
    //   case "DOES_NOT_CONTAIN":
    //     return {...assertionObj, isAssertionFailed: !responseData.includes(assertion.value)}
    //   case "CONTAINS":
    //     return {...assertionObj, isAssertionFailed: responseData.includes(assertion.value)}
    //   case "SMALL":
    //     return {...assertionObj, isAssertionFailed: headerVal < assertion.value}
    //   case "SMALL_EQUAL":
    //     return {...assertionObj, isAssertionFailed: headerVal <= assertion.value}
    //   case "BIG":
    //     return {...assertionObj, isAssertionFailed: headerVal > assertion.value}
    //   case "BIG_EQUAL":
    //     return {...assertionObj, isAssertionFailed: headerVal >= assertion.value}
    //   default:
    //     return {...assertionObj, isAssertionFailed: responseData.includes(assertion.value)}
    // }
  // } else {
  //   throw new Error("AssertionValInvalid")
  // }
}
const assertSSLCertificate = ({
                                response,
                                assertion,
                                responseTime,
                                url
                              }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }): { hasSSL: boolean, isAssertionFailed: boolean } => {
  // Validate SSL certificate
  const socket: tls.TLSSocket = response.request.socket as tls.TLSSocket;
  let isAssertionFailed = false
  if (socket.getPeerCertificate) {
    const certificate = socket.getPeerCertificate();
    if (certificate.valid_to) {
      const validTo = new Date(certificate.valid_to).getTime();
      const now = new Date().getTime();
      const diffTime = Math.abs(validTo - now);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < parseInt(assertion.value)) {
        isAssertionFailed = true
        console.error(`SSL Certificate will expire soon. It will expire in ${diffDays} day(s).`);
      }
    }
  }

  return {hasSSL: true, isAssertionFailed}
}

export type DataType = ReturnType<typeof assertResponseTime> |
  ReturnType<typeof assertResponseBody> |
  ReturnType<typeof assertResponseJSON> |
  ReturnType<typeof assertResponseCode> |
  ReturnType<typeof assertResponseHeader> |
  ReturnType<typeof assertSSLCertificate>;


export const getHttpAssertionFunc: {
  [key in AssertionType]: ({
                             response,
                             assertion,
                             responseTime,
                             url
                           }: { response: AxiosResponse<any, any>, assertion: Assertion, responseTime?: number, url?: string }) => DataType
} = {
  RESPONSE_TIME: assertResponseTime,
  RESPONSE_BODY: assertResponseBody,
  RESPONSE_CODE: assertResponseCode,
  RESPONSE_HEADER: assertResponseHeader,
  RESPONSE_JSON: assertResponseJSON,
  SSL_CERTIFICATE_EXPIRES_IN: assertSSLCertificate
}

