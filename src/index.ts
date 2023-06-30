import {processTask} from './functions/processHealthMetric/processHealthMetric';
import {SQSEvent} from 'aws-lambda';

async function test() {
  const task: string = '{"id":1,"name":"task-1","method":"GET","timeout":1230,"enabled":true,"locations":"{IRELAND}","createdAt":"2023-06-28T10:57:58.267Z","updatedAt":"2023-06-28T10:57:58.268Z","inProgress":false,"lastChecked":"2023-06-28T10:57:54.002Z","url":"https://amjadorfali.com/","teamId":1,"type":"HTTP","assertionId":1,"port":null,"interval":300,"httpUserName":null,"httpPassword":null,"headers":{"type":"asd","value":"asd"},"assertions":[{"type":"RESPONSE_CODE","value":"200","compareType":"EQUAL"}],"requestBody":null,"verifySSL":false}'
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
