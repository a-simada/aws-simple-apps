import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

interface User {
  userId: string;
  name: string;
}

const dynamo = new AWS.DynamoDB();

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log(event);

  let user: User;
  switch (event.httpMethod) {
    case 'GET': {
      const userId = event.path.split('/').pop();
      user = await get(userId!);
      break;
    }
    case 'POST': {
      user = JSON.parse(event.body!) as User;
      await post(user);
      break;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      user: user!,
    }),
  };
}

async function get(userId: string): Promise<User> {
  console.log(userId);
  const ret = await dynamo
    .getItem({
      TableName: process.env.TABLE_NAME as string,
      Key: marshall({ userId }),
    })
    .promise();
  return unmarshall(ret.Item!) as User;
}

async function post(user: User): Promise<void> {
  console.log(user);
  await dynamo
    .putItem({
      TableName: process.env.TABLE_NAME as string,
      Item: marshall(user),
    })
    .promise();
  return;
}
