export interface AwsEventRequestContextIdentity {
  cognitoIdentityPoolId?: string;
  accountId?: string;
  cognitoIdentityId?: string;
  caller?: string;
  apiKey?: string;
  sourceIp: string;
  cognitoAuthenticationType?: string;
  cognitoAuthenticationProvider?: string;
  userArn?: string;
  userAgent: string;
  user?: string;
}
