import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { listUsers } from './data/list-users/resource';

import * as iam from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  listUsers
});

const lambdaFunction = backend.listUsers.resources.lambda;
lambdaFunction.role?.attachInlinePolicy(
  new iam.Policy(backend.auth.resources.userPool, "AllowListUsers", {
    statements: [
      new iam.PolicyStatement({
        actions: ["cognito-idp:ListUsers"],
        resources: [backend.auth.resources.userPool.userPoolArn],
      }),
    ],
  })
);
