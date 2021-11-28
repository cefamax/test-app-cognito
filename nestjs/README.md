<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# AWS Cognito NestJS integration 
[NestJS](https://nestjs.com/) application with [AWS Cognito](https://aws.amazon.com/en/cognito/) authentication functionality
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
Rename .env.template to .env and compile with Cognito auth data.

## 5. Build & Run
```
npm run build
npm run start
```

## 6. Use application
This is a Nestjs application to test Cognito authentication. 
</br>
Contains the following route:
- auth/register --> Register user
- auth/confirm --> Confirm user with email or sms code
- auth/login --> Login user
- auth/refresh --> Refresh token
- auth/user --> Delete user
- / --> test jwt guard with Cognito token

## 7. Documentation
The file ./postman/cognito.postman_collection.json can be imported in Postman application to test this api.

## Licensing
[MIT](./../LICENSE)