#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AppStack } from '../lib/aws-cdk-app-1-stack';

const app = new cdk.App();
new AppStack(app, 'AppStack', {
    stackName: 'aws-cdk-app-stack',
});
