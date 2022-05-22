"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const pg_1 = require("pg");
const get_user_email_query_1 = require("../../database/queries/accounts/get-user-email-query");
const get_user_username_query_1 = require("../../database/queries/accounts/get-user-username-query");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const auth_1 = require("firebase/auth");
const app_1 = require("firebase/app");
const firebase_1 = require("../../secrets/firebase");
const create_user_query_1 = require("../../database/queries/accounts/create-user-query");
const create_provider_query_1 = require("../../database/queries/accounts/create-provider-query");
class AccountService {
    createAccountWithUsernameAndEmail(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig, 'Erzahler');
            const auth = (0, auth_1.getAuth)(firebaseApp);
            return this.checkEmailUsernameAvailability(username, email)
                .then((checkResult) => {
                if (checkResult.credentialsAvailable === true) {
                    return (0, auth_1.createUserWithEmailAndPassword)(auth, email, password)
                        .then((newUser) => {
                        const authPool = new pg_1.Pool(dbCredentials_1.victorAuthCredentials);
                        const mainPool = new pg_1.Pool(dbCredentials_1.victorCredentials);
                        return Promise.all([
                            this.addUserToDatabase(authPool, newUser, username),
                            this.addUserToDatabase(mainPool, newUser, username)
                        ]).then((creationResult) => {
                            console.log('Auth Creation Result:', creationResult[0]);
                            console.log('Main Creation Result:', creationResult[1]);
                            const creationDetails = {
                                auth: true,
                                main: true,
                                endResult: true
                            };
                            if (creationResult[0] === false) {
                                creationDetails.auth = false;
                                creationDetails.endResult = false;
                            }
                            if (creationResult[1] === false) {
                                creationDetails.main = false;
                                creationDetails.endResult = false;
                            }
                            return creationDetails;
                        }).catch((error) => {
                            return error.message;
                        });
                    }).catch((error) => {
                        return error.message;
                    });
                }
                else {
                    return {
                        success: false,
                        credentialStatus: checkResult
                    };
                }
            });
        });
    }
    checkEmailUsernameAvailability(username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([this.checkUsernameInDB(username), this.checkEmailAvailability(email)])
                .then((availabilityResult) => {
                const credentialCheck = {
                    usernameAvailable: true,
                    emailAvailable: true,
                    credentialsAvailable: true
                };
                if (availabilityResult[0] === false) {
                    credentialCheck.usernameAvailable = false;
                    credentialCheck.credentialsAvailable = false;
                }
                if (availabilityResult[1] === false) {
                    credentialCheck.emailAvailable = false;
                    credentialCheck.credentialsAvailable = false;
                }
                if (credentialCheck.credentialsAvailable) {
                    return credentialCheck;
                }
                else {
                    return credentialCheck;
                }
            })
                .catch((error) => { return error.message; });
        });
    }
    checkEmailAvailability(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([this.checkEmailInDB(email), this.checkEmailInFB(email)])
                .then((emailsUsed) => {
                let emailAvailable = true;
                if (emailsUsed[0] === false) {
                    emailAvailable = false;
                }
                if (emailsUsed[1] === false) {
                    emailAvailable = false;
                }
                return emailAvailable;
            });
        });
    }
    checkEmailInDB(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            return pool.query(get_user_email_query_1.getUserEmailQuery, [email])
                .then((emailResponse) => {
                if (emailResponse.rows.length === 0) {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch((e) => console.error(e.message));
        });
    }
    checkEmailInFB(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
            const auth = (0, auth_1.getAuth)(firebaseApp);
            return (0, auth_1.fetchSignInMethodsForEmail)(auth, email)
                .then((signInMethods) => {
                if (signInMethods.length === 0) {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch((error) => {
                console.log(error);
                return error.message;
            });
        });
    }
    checkUsernameInDB(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            return pool.query(get_user_username_query_1.getUserUsernameQuery, [username])
                .then((usernameCountResponse) => {
                if (usernameCountResponse.rows.length === 0) {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch((e) => console.error(e.message));
        });
    }
    getUserId(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            return pool.query(get_user_username_query_1.getUserUsernameQuery, [username])
                .then((userResult) => {
                return userResult.rows[0].user_id;
            })
                .catch((e) => console.error(e.message));
        });
    }
    addUserToDatabase(pool, newUser, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return pool.query(create_user_query_1.createUserQuery, [
                username,
                newUser.user.uid,
                newUser.user.email,
                newUser.user.emailVerified,
                newUser.user.metadata.creationTime
            ]).then(() => {
                return this.getUserId(username).then((userId) => {
                    return pool.query(create_provider_query_1.createProviderQuery, [
                        userId,
                        newUser.user.providerData[0].providerId,
                        newUser.user.providerData[0].uid,
                        newUser.user.providerData[0].displayName,
                        newUser.user.providerData[0].email,
                        newUser.user.providerData[0].phoneNumber,
                        newUser.user.providerData[0].photoURL
                    ]).then(() => {
                        return true;
                    }).catch((error) => {
                        return error.message;
                    });
                });
            }).catch((error) => {
                return error.message;
            });
        });
    }
}
exports.AccountService = AccountService;
