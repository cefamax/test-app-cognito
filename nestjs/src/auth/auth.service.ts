import { RefreshRequestDto } from './dto/refresh.request.dto';
import { ConfirmRequestDto } from './dto/confirm.request.dto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import { AuthenticateRequestDto } from './dto/authenticate.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';

@Injectable()
export class AuthService {
  private userPool: CognitoUserPool;
  private sessionUserAttributes: {};
  constructor(private configService: ConfigService) {
    this.userPool = new CognitoUserPool({
      UserPoolId: this.configService.get<string>('userPoolId'),
      ClientId: this.configService.get<string>('clientId'),
    });
  }

  registerUser(registerRequest: RegisterRequestDto) {
    const { email, password } = registerRequest;
    return new Promise((resolve, reject) => {
      console.log(registerRequest);
      return this.userPool.signUp(
        email,
        password,
        [
          new CognitoUserAttribute({ Name: 'email', Value: email }),
          new CognitoUserAttribute({ Name: "gender", Value: registerRequest.gender }),
          new CognitoUserAttribute({ Name: "birthdate", Value: registerRequest.birthdate }),
          new CognitoUserAttribute({ Name: "phone_number", Value: registerRequest.phone_number }),
          //new CognitoUserAttribute({ Name: "custom:scope", Value: registerRequest.scope })
        ],
        null,
        (err, result) => {
          if (!result) {
            console.error(err);
            reject(err);
          } else {
            resolve(result.user);
          }
        },
      );
    });
  }

  confirmUser(confirm: ConfirmRequestDto) {
    const { email, code } = confirm;
    const userData = {
      Username: email,
      Pool: this.userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      })

    })

  }

  authenticateUser(user: AuthenticateRequestDto) {
    const { email, password } = user;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {
          resolve(result);
        },
        onFailure: err => {
          reject(err);
        },
      });
    });
  }

  refreshToken(refreshData: RefreshRequestDto) {

    const { email, refreshToken } = refreshData;

    const RefreshToken = new CognitoRefreshToken({ RefreshToken: refreshToken });

    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return cognitoUser.refreshSession(RefreshToken, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  deleteUser(user: AuthenticateRequestDto) {
    const { email, password } = user;

    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    const userData = {
      Username: email,
      Pool: this.userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
      return cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: result => {

          cognitoUser.deleteUser((err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
              console.log("Successfully deleted the user.");
              console.log(result == 'SUCCESS');
            }
          });

        },
        onFailure: err => {
          reject(err);
        },
      });
    });
  }
}
