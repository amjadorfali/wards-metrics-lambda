import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";

class QueueService {
  client
  url

  constructor(client: SQSClient, url: string) {
    this.client = client;
    this.url = url;
  }

  async sendMessage() {
    const command = new SendMessageCommand({
      QueueUrl: this.url,
      DelaySeconds: 10,
      MessageAttributes: {
        Title: {
          DataType: "String",
          StringValue: "The Whistler",
        },
        Author: {
          DataType: "String",
          StringValue: "John Grisham",
        },
        WeeksOn: {
          DataType: "Number",
          StringValue: "6",
        },
      },
      MessageBody:
        "Information about current NY Times fiction bestseller for week of 12/11/2016.",
    });

    const response = await this.client.send(command);
    console.log(response);
    return response;
  }
}
