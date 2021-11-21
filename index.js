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

const ConfirmRegistration = (confirmCode) => {

    const userData = {
        Username: USER_TEST_EMAIL,
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

const RefreshToken = (refresh_token) => {
    const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({ RefreshToken: refresh_token });

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    const userData = {
        Username: USER_TEST_EMAIL,
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
//RefreshToken('eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.LAlIlJoU0I6f6pPkXGF2Vwl-J_WSXtNuqCOQCCuQjLViAmG_R3wOvhkcYDGLjVBKfsWX0x7Kj7lzlNKramnD0rZSuqdeq2YlxTg1ZX7LMFCQhSEhKyMzrDAGHjhzDL9hbYnoQpiNXH8bQ4EiFSRrfRV1vUrOgeHff3I9qxhlViVPnuUG00ncpmGrRircIC1XsVfki3lAnnFMp94OlOybUvF2b-E2poF4Had7jCr-bZuZLBXtECq9yGk5dejRPfP3pHYVdTEuX0LuQ6HdRMUUJ81yso_lSDKv9SDnwTMO-Iq9BfCTe2OnRUcsTjmQ5tZR5hwJioIK8VB5ge69cirJxw.SsQWPAQemoFImRha.ng6WuhGI7oopKobh_0zpv4VZb8fqU7n-UI-j4c8d4Q6AcA-bANlfM_DotgQPrClgWD-101FweyaSdibTJJBkdURmeIsyHmuneIncjmRp5qMUBv9_bI-nu08gHw21rfjXCj88gJwHfFhvrJUZ80emvWWlXLpuNusgQGx0AtDkjnEK2uoMuOvh4SDtcTWRrWtvsFWzNRnuhTPaIj-kFPPHTZdqS-3mWjeoF9t0Y9LYD1MaSvkDKjogEXZAtaZQPdLgFnB7CNtC65RoiV0AYR_TuqlkRozkCSP7e7Mq2GfKCGEps_VMGdZyIk2bKSq-CpBJVhpVhd9FYBQGZ537Jv9sTpyp7qQpj6TbSSwPPLTj4msdYvqKRxn4paN8txWrJKcogcp2CIhlJxCGHXn4Z6uyOCvm1zGkGZot-WXC1VSs65nDGhCwJ0FULgbe-otwCQ1iNRqiY5FnzTx0X801hU3vXvM3IXTXkbxq-jU88v-k1mt-obvM059DoP4xlgV1Ssy5DnfirqW4PxfsY2ZeQWSrvXmIPY9i2Y2YtgF-MVqRnPwxPsiNND9EqEelJiu34TOyK8UDTDOgFK21Zq8UP1_Jned4O-S75n2AWGE6QBK4Wr_cr6k-6exP0bwwXMiS-6jlEnQxL4X99mPKfZTQY05v4_GiJVl9Za1vYkuirYt0yZ-fu3E92Uf0jCMNT5ixj0IKn7wUv-sysB0U6aZi2qAHvqC21QMhkXXrewyKLT8XFKO4P1sAbCIS7XvcaRI8MnNGVMY9xpxt5Ydk3XC2lyi28w66KpMfrRzrqVpzCWFVMRLJz31uXar8s14gfousLx3RXoSSJW9im62fDxC-_5VmrJfOyFvlSvWL3bkQA43-PdsqLkFcFw4O49svGhGMxJxmQPVpIlYyQAGA7GViI6TLWQ1xh-qrRnN_bjoKOBr5dGXKk66TYzV8jENgc-NlzVeR_FSXol1e70LQvdCNcy7yWFehqaeWkvH1QOgvfX6fl3rFz_SyivCJSn5X5YKXfrJ2FFbmld3BdokP7AXnWSoY5t7b7nQxUDlBlXLKirTG9V8A1jmRNspEb-YThYXGvGYTAhrQnwFO4cLhuz5j0j8Rv1Vg7_680bSuHPplZQRmHwc2Ddq_UA_-xcHK887gRh7mMnfamNrSVDMxBKXRHmyMqh3M6cKoMbuZqu6VCfiHkJpLmAEkua0awrWaEkwg5KiUnuSVhXrSX6SV6V35p6XFp7v-f0JVQvCkXZW90eWNNAJe7xGpHM-zkkqlZh1Pr2M85u9FfnuKUM_mVd_CwwN7I1tL-7S0XLsIWs5NzRca3Y5e9sLpPsHtBBswWk9LVg.2IAKvqa8RToU-Gwj2gUaSA');
// DeleteAttributes(USER_TEST_EMAIL, USER_TEST_PASSWORD);
//ChangePassword(USER_TEST_EMAIL, USER_TEST_PASSWORD, USER_TEST_PASSWORD_CHANGED);
//Login(USER_TEST_EMAIL, USER_TEST_PASSWORD_CHANGED);
DeleteUser(USER_TEST_EMAIL, USER_TEST_PASSWORD_CHANGED);
