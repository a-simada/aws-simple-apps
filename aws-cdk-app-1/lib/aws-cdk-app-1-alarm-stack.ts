import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as cw from '@aws-cdk/aws-cloudwatch';

export class AlarmStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 既存 DynamoDB
    const table = dynamo.Table.fromTableName(
      this,
      'AppDynamoDB',
      'aws-cdk-app-dynamo-table'
    );

    // 既存 Lambda
    const handler = lambda.Function.fromFunctionArn(
      this,
      'AppHandler',
      `arn:aws:lambda:${props?.env?.region}:${props?.env?.account}:function:aws-cdk-app-handler`
    );

    // Alarm
    new cw.Alarm(this, 'LambdaErrorAlarm', {
      alarmName: 'aws-cdk-app-handler-error-alarm',
      metric: handler.metricErrors(),
      threshold: 1,
      comparisonOperator:
        cw.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
    });
    new cw.Alarm(this, 'DynamoRCUAlarm', {
      alarmName: 'aws-cdk-app-dynamo-table-rcu-alarm',
      metric: table.metricConsumedReadCapacityUnits(),
      threshold: 0,
      comparisonOperator:
        cw.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 1,
    });
  }
}
