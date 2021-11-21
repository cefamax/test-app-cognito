# NodeJS AWS Cognito function test
Nodejs application for cognito authentication functionality
</br>
## 1. Prerequisites
- NodeJs 12+
- Aws Accont

## 2. COGNITO: Create user group
In Cognito service, create a new User Group Pool.
Do not use the client secret as it is not supported in the JS SDK.

## 3. Install components
```
npm install
```

## 4. Compile Env
Rename .env.template to .env and compile with Cognito sample data.

## 5. Use application
Thi application is an example to test Cognito function to nodejs. Contains the following functions:
- Register user
- Confirm user with email or sms code
- Login user
- Refresh token
- Change password
- Delete attributes
- Delete user