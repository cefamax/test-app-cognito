# NodeJS AWS Cognito function test
Nodejs application for [AWS Cognito](https://aws.amazon.com/en/cognito/) authentication functionality
</br>
## 1. Prerequisites
- NodeJs 12+
- Aws Accont

## 2. COGNITO: Create user group
In Cognito service, create a new User Group Pool.</br>
**Do not use the client secret as it is not supported in the JS SDK.**

## 3. Install components
```
npm install
```

## 4. Compile Env
Rename .env.template to .env and compile with Cognito sample data.

## 5. Use application
Thi application is an example to test Cognito function to nodejs. 
</br>
Contains the following functions:
- Register user
- Confirm user with email or sms code
- Login user
- Refresh token
- Change password
- Delete attributes
- Delete user

## Licensing
[MIT](./../LICENSE)