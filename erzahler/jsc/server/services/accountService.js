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
const check_email_exists_in_db_query_1 = require("../../database/queries/accounts/check-email-exists-in-db-query");
const check_username_in_db_query_1 = require("../../database/queries/accounts/check-username-in-db-query");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const auth_1 = require("firebase/auth");
const app_1 = require("firebase/app");
const firebase_1 = require("../../secrets/firebase");
class AccountService {
    createAccountWithUsernameAndEmail(username, email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig, 'Erzahler');
            const auth = (0, auth_1.getAuth)(firebaseApp);
            this.checkEmailUsernameAvailability(username, email)
                .then((usernameEmailAvailableResult) => {
                if (usernameEmailAvailableResult) {
                    const newUser = (0, auth_1.createUserWithEmailAndPassword)(auth, email, password)
                        .then((newUser) => {
                        return newUser;
                    })
                        .catch((error) => {
                        return error.message;
                    });
                    return newUser;
                }
                else {
                    return 'Username or email is unavailable';
                }
            });
        });
    }
    checkEmailUsernameAvailability(username, email) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([this.checkUsernameInDB(username), this.checkEmailAvailability(email)])
                .then((availabilityResult) => {
                if (availabilityResult[0] && availabilityResult[1]) {
                    return true;
                }
                else {
                    return false;
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
                if (emailsUsed[0] === true) {
                    console.log("Email already in Database");
                    emailAvailable = false;
                }
                if (emailsUsed[1] === true) {
                    console.log("Email already in Firebase");
                    emailAvailable = false;
                }
                return emailAvailable;
            });
        });
    }
    checkEmailInDB(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            return pool.query(check_email_exists_in_db_query_1.checkEmailExistsInDBQuery, [email])
                .then((emailCountResponse) => {
                const { email_exists } = emailCountResponse.rows[0];
                console.log(emailCountResponse.rows[0]);
                if ((email_exists) === '1') {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch((e) => console.error(e.stack));
        });
    }
    checkEmailInFB(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
            const auth = (0, auth_1.getAuth)(firebaseApp);
            return (0, auth_1.fetchSignInMethodsForEmail)(auth, email)
                .then((signInMethods) => {
                if (signInMethods.length > 0) {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch((error) => {
                console.log(error);
            });
        });
    }
    checkUsernameInDB(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            return pool.query(check_username_in_db_query_1.checkUsernameInDBQuery, [username])
                .then((usernameCountResponse) => {
                const { username_exists } = usernameCountResponse.rows[0];
                console.log(username_exists.rows);
                if (username_exists === '1') {
                    return true;
                }
                else {
                    return false;
                }
            })
                .catch((e) => console.error(e.stack));
        });
    }
}
exports.AccountService = AccountService;
