/// !cdk-integ *
import { AttributeType } from '@aws-cdk/aws-dynamodb';
import { App, RemovalPolicy } from '@aws-cdk/core';
import { GlobalTable } from '../lib';

const app = new App();
new GlobalTable(app, 'globdynamodbinteg', {
  partitionKey: { name: 'hashKey', type: AttributeType.STRING },
  tableName: 'integrationtest',
  regions: ["us-east-1", "us-east-2", "us-west-2"],
  removalPolicy: RemovalPolicy.DESTROY,
});
app.synth();
