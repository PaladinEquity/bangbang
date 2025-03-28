import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource';
import { payment } from './function/payment/resource';
import { Stack } from 'aws-cdk-lib';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import {
  HttpIamAuthorizer,
  HttpUserPoolAuthorizer,
} from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const backend = defineBackend({
  auth,
  data,
  storage,
  payment
});

// Create a new API stack
const apiStack = backend.createStack('payment-api-stack');

// Create an IAM authorizer
const iamAuthorizer = new HttpIamAuthorizer();

// Create a User Pool authorizer
const userPoolAuthorizer = new HttpUserPoolAuthorizer(
  'userPoolAuth',
  backend.auth.resources.userPool,
  {
    userPoolClients: [backend.auth.resources.userPoolClient],
  }
);

// Create a new HTTP Lambda integration
const paymentLambdaIntegration = new HttpLambdaIntegration(
  'PaymentLambdaIntegration',
  backend.payment.resources.lambda
);

// Create a new HTTP API with IAM as default authorizer
const httpApi = new HttpApi(apiStack, 'PaymentHttpApi', {
  apiName: 'paymentApi',
  corsPreflight: {
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.OPTIONS,
    ],
    allowOrigins: ['*'],
    allowHeaders: ['*'],
  },
  createDefaultStage: true,
});

// Add payment route with IAM authorizer
httpApi.addRoutes({
  path: '/payment',
  methods: [HttpMethod.POST],
  integration: paymentLambdaIntegration,
  authorizer: iamAuthorizer,
});

// Add options method to the payment route for CORS
httpApi.addRoutes({
  path: '/payment',
  methods: [HttpMethod.OPTIONS],
  integration: paymentLambdaIntegration,
});

// Create a new IAM policy to allow Invoke access to the API
const apiPolicy = new Policy(apiStack, 'PaymentApiPolicy', {
  statements: [
    new PolicyStatement({
      actions: ['execute-api:Invoke'],
      resources: [
        `${httpApi.arnForExecuteApi('*', '/payment')}`,
      ],
    }),
  ],
});

// Attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiPolicy);

// Add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [httpApi.httpApiName!]: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: httpApi.httpApiName,
      },
    },
  },
});

