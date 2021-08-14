import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamo from '@aws-cdk/aws-dynamodb';
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs';
import * as apigw from '@aws-cdk/aws-apigateway';

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB
    const table = new dynamo.Table(this, 'AppDynamodb', {
      tableName: 'aws-cdk-app-dynamo-table',
      partitionKey: {
        name: 'userId',
        type: dynamo.AttributeType.STRING,
      },
    });

    // Lambda
    const handler = new nodeLambda.NodejsFunction(this, 'AppLambda', {
      entry: 'src/index.ts',
      runtime: lambda.Runtime.NODEJS_14_X,
      functionName: 'aws-cdk-app-handler',
      environment: {
        TABLE_NAME: table.tableName,
      },
      timeout: cdk.Duration.minutes(3),
    });

    // API Gateway
    const api = new apigw.LambdaRestApi(this, 'AppApiGw', {
      restApiName: 'aws-cdk-app-api',
      deployOptions: {
        stageName: 'v1',
      },
      handler: handler,
      proxy: true,
    });

    new cdk.CfnOutput(this, 'RestApiOutput', {
      value: api.url,
    });

    // Permission (Lambda -> DynamoDB)
    table.grantReadWriteData(handler);

    // TODO: OpenAPI からの import 方法について調査
    // const spec = new apigw.SpecRestApi(this, 'books-api', {
    //     apiDefinition: apigw.ApiDefinition.fromAsset('openapi/api.yml'),
    // });
  }
}
