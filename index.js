import AmazonCognitoIdentity from 'amazon-cognito-identity-js'
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
import AWS from 'aws-sdk';
import request from 'request';
import jwkToPem from 'jwk-to-pem';
import jwt from 'jsonwebtoken';
import fetch from "node-fetch";
global.fetch = fetch;
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const poolData = {
    UserPoolId: process.env.AWS_COGNITO_USER_POOL_ID, // COGNITO POOL ID
    ClientId: process.env.AWS_COGNITO_CLIENT_ID // COGNITO CLIENT ID

};
const pool_region = process.env.AWS_COGNITO_REGION;

const USER_TEST_EMAIL = process.env.USER_TEST_EMAIL;
const USER_TEST_PHONE = process.env.USER_TEST_PHONE;
const USER_TEST_PASSWORD = process.env.USER_TEST_PASSWORD;
const USER_TEST_PASSWORD_CHANGED = process.env.USER_TEST_PASSWORD_CHANGED;

const USER_TEST_DATA = {
    name: 'Jhon Doe',
    preferred_username: 'jd',
    gender: 'male',
    birthdate: '1991-01-01',
    address: 'address name',
    phone_number: USER_TEST_PHONE,
    scope: 'editor'

}


//START USER POOL
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);


// REGISTER USER
const RegisterUser = (email, password, userData) => {
    var attributeList = [];
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: userData.name }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "preferred_username", Value: userData.preferred_username }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "gender", Value: userData.gender }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "birthdate", Value: userData.birthdate }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "address", Value: userData.address }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "phone_number", Value: userData.phone_number }));
    //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "custom:scope", Value: "admin" }));


    userPool.signUp(
        email, password, attributeList, null, (err, result) => {
            if (err) {
                console.error(err);
                return;
            }
            //let cognitoUser = new AmazonCognitoIdentity.CognitoUser(result.user);
            console.log('user name is ' + result.user.getUsername());
        });
}

const ConfirmRegistration = (confirmCode, username) => {

    const userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.confirmRegistration(confirmCode, true, (err, result) => {
        if (err) {
            console.error(err);
            return;
        }
        if (result == 'SUCCESS')
            console.log('user confirmed successfully!')
        else
            console.log('user confirmed error!', result);

    })

}
const Login = (username, password) => {
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
    });

    const userData = {
        Username: username,
        Pool: userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {

            let retObj = {
                "access_token": result.getAccessToken().getJwtToken(),
                "id_token": result.getIdToken().getJwtToken(),
                "refresh_token": result.getRefreshToken().getToken(),
            }
            console.log('Login success:');
            console.log(retObj);

        },
        onFailure: (err) => {
            console.error('Login error:', err);
        },

    });
}

const RefreshToken = (refresh_token, username) => {
    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refresh_token });

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    const userData = {
        Username: username,
        Pool: userPool
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.refreshSession(RefreshToken, (err, session) => {
        if (err) {
            console.error(err);
        } else {
            let retObj = {
                "access_token": session.accessToken.jwtToken,
                "id_token": session.idToken.jwtToken,
                "refresh_token": session.refreshToken.token,
            }
            console.log('token refresh success!');
            console.log(retObj);
        }
    })
}

const DeleteUser = (username, password) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
    });

    var userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            cognitoUser.deleteUser((err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully deleted the user.");
                    console.log(result == 'SUCCESS');
                }
            });
        },
        onFailure: (err) => {
            console.error(err);
        },
    });
}

const DeleteAttributes = (username, password) => {
    const attributeList = [];
    attributeList.push("custom:scope");
    attributeList.push("name");

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
    });

    const userData = {
        Username: username,
        Pool: userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);


    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            cognitoUser.deleteAttributes(attributeList, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(result);
                }
            });
        },
        onFailure: (err) => {
            console.error(err);
        },
    });



}

const ChangePassword = (username, password, newpassword) => {
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: username,
        Password: password,
    });

    var userData = {
        Username: username,
        Pool: userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            cognitoUser.changePassword(password, newpassword, (err, result) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Successfully changed password of the user.");
                    console.log(result);
                }
            });
        },
        onFailure: (err) => {
            console.error(err);
        },
    });
}

//RegisterUser(USER_TEST_EMAIL, USER_TEST_PASSWORD, USER_TEST_DATA);
//ConfirmRegistration('573450');
//Login(USER_TEST_EMAIL, USER_TEST_PASSWORD);
//RefreshToken('token');
// DeleteAttributes(USER_TEST_EMAIL, USER_TEST_PASSWORD);
//ChangePassword(USER_TEST_EMAIL, USER_TEST_PASSWORD, USER_TEST_PASSWORD_CHANGED);
//Login(USER_TEST_EMAIL, USER_TEST_PASSWORD_CHANGED);
DeleteUser(USER_TEST_EMAIL, USER_TEST_PASSWORD_CHANGED);
