// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class AuthConfig {
//   public userPoolId: string = process.env.AWS_COGNITO_USER_POOL_ID;
//   public clientId: string = process.env.AWS_COGNITO_CLIENT_ID;
//   public region: string = process.env.AWS_COGNITO_REGION;
//   public authority = `https://cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`;
// }


export default () => ({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  region: process.env.AWS_COGNITO_REGION,
  authority: `https://cognito-idp.${process.env.AWS_COGNITO_REGION}.amazonaws.com/${process.env.AWS_COGNITO_USER_POOL_ID}`
});