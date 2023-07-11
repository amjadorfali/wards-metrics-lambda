import {processTask} from './functions/processHealthMetric/processHealthMetric';
import {SQSEvent} from 'aws-lambda';

async function test() {
  const task: string = '{"id":9,"name":"task-5","method":"GET","timeout":123000,"enabled":true,"locations":"{IRELAND}","createdAt":"2023-06-30T11:11:30.046Z","updatedAt":"2023-06-30T11:11:30.047Z","inProgress":false,"lastChecked":"2023-06-30T11:11:30.043Z","url":"http://localhost:8700/api/health-check","teamId":1,"type":"HTTP","assertionId":9,"port":null,"interval":300,"httpUserName":null,"httpPassword":null,"headers":{"type":"asd","value":"asd"},"assertions":[{"value":[200,300,100],"type":"RESPONSE_CODE"},{"value":"2000","type":"RESPONSE_TIME"},{"value":123,"key":"arrTest[0].childArr","type":"RESPONSE_JSON"}],"requestBody":null,"verifySSL":false}'
  const sqsRecord: SQSEvent = {
    Records: [{
      body: task,
      messageId: `1`,
      attributes: {ApproximateFirstReceiveTimestamp: '', ApproximateReceiveCount: '', SenderId: '', SentTimestamp: ''},
      awsRegion: '',
      eventSource: '',
      eventSourceARN: '',
      md5OfBody: '',
      messageAttributes: {},
      receiptHandle: ''

    }
    ]
  }
  await processTask(sqsRecord)

}

test()
