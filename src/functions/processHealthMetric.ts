import {SQSEvent} from "aws-lambda";
import {HealthCheck} from "../model/HealthCheck";
import {checkHTTP} from "../helpers/checks/checkHTTP";
import {checkTCPPort} from "../helpers/checks/checkTCPPort";

export const run = async (event: SQSEvent) => {
  console.log(event)
  const task: HealthCheck = JSON.parse(event.Records[0].body)
  const location = event.Records[0].awsRegion
  if (task.type === "HTTP") {
    await checkHTTP(task, location)
  }
}

const getRequest = async (task: HealthCheck) => {
  let response: { response: string; responseTime: number } | undefined
  switch (task.type) {
    case "POP3":
      response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5)
      break;
    case "SMTP":
      response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5)
      break;
    case "IMAP":
      response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5)
      break;
    case "TCP":
      response = await checkTCPPort(task.port || 80, task.url, task.timeout || 5)
      break;
    case "UDP":
      break;
  }
  return response
}
