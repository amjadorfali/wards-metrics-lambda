import {ProcessHealthMetricService} from "../../service/ProcessHealthMetricService";
import {SQSEvent} from "aws-lambda";
import {HealthCheck} from "../../model/HealthCheck";
import {DataType, getAssertionFunc} from "../../service/AssertionService";
import {sendRequest} from "../../api/axios";


export const processTask = async (event: SQSEvent) => {
  const task: HealthCheck = JSON.parse(event.Records[0].body)
  const response = await sendRequest(task)
  let data: DataType = {
    hasSSL: false,
    responseBody: "",
    responseCode: 0,
    responseHeader: "",
    responseJson: "",
    responseTime: 0
  }
  for (let i = 0; i < task.assertions.length; i++) {
    const assertionFunc = getAssertionFunc[task.assertions[i].type]
    data = {
      ...data,
      ...assertionFunc(response, task.assertions[i])
    }
  }

  console.log(data)

}
const postMetric = () => {

}
