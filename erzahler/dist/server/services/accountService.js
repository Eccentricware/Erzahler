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
const auth_1 = require("firebase-admin/auth");
const formattingService_1 = require("./formattingService");
const connection_1 = require("../../database/connection");
class AccountService {
    validateToken(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, auth_1.getAuth)()
                .verifyIdToken(idToken, true)
                .then((decodedIdToken) => {
                return {
                    uid: decodedIdToken.uid,
                    valid: true
                };
            })
                .catch((error) => {
                console.log(error.message);
                return {
                    uid: 0,
                    valid: false
                };
            });
        });
    }
    attemptAddUserToDatabase(idToken, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.validateToken(idToken);
            const usernameAvailable = yield connection_1.db.accountsRepo.checkUsernameAvailable(username);
            if (token.uid && usernameAvailable) {
                const firebaseUser = yield this.getFirebaseUser(token.uid);
                const addUserResult = yield this.addUserToDatabase(firebaseUser, username);
                console.log('Add User Result', addUserResult);
                return addUserResult;
            }
        });
    }
    addUserToDatabase(firebaseUser, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const addUserArgs = this.createAddUserArgs(firebaseUser, username);
            if (firebaseUser.providerData[0].providerId === 'password') {
                yield (0, auth_1.getAuth)()
                    .updateUser(firebaseUser.uid, {
                    displayName: username
                })
                    .then((user) => {
                    return { success: true };
                })
                    .catch((error) => {
                    return {
                        success: false,
                        error: error.message
                    };
                });
            }
            return yield this.addUser(firebaseUser, username, addUserArgs);
        });
    }
    addUser(firebaseUser, username, providerDependentArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            const ceId = yield connection_1.db.accountsRepo.createAccountUser(providerDependentArgs);
            providerDependentArgs.push(ceId);
            yield connection_1.db.accountsRepo.createEnvironmentUser(providerDependentArgs);
            const userId = yield connection_1.db.accountsRepo.getUserId(username);
            const providerArgs = this.createProviderArgs(userId, firebaseUser);
            yield connection_1.db.accountsRepo.createProvider(providerArgs);
            const userAdded = yield connection_1.db.accountsRepo.getUserProfile(firebaseUser.uid);
            if (userAdded) {
                return { success: true };
            }
            else {
                return { success: false };
            }
        });
    }
    createAddUserArgs(firebaseUser, username) {
        const emailSignup = firebaseUser.providerData[0].providerId === 'password';
        return [
            username,
            emailSignup ? false : true,
            emailSignup ? 'unverified' : 'active',
            firebaseUser.metadata.creationTime,
            firebaseUser.metadata.lastSignInTime,
            'America/Los_Angeles'
        ];
    }
    createProviderArgs(userId, firebaseUser) {
        const emailSignup = firebaseUser.providerData[0].providerId === 'password';
        const verificationDeadline = new Date(Date.now() + 3600000);
        return [
            userId,
            firebaseUser.uid,
            firebaseUser.providerData[0].providerId,
            firebaseUser.displayName,
            firebaseUser.email,
            firebaseUser.emailVerified,
            emailSignup ? verificationDeadline : null,
            firebaseUser.metadata.creationTime,
            firebaseUser.metadata.lastSignInTime,
            firebaseUser.photoURL
        ];
    }
    getFirebaseUser(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, auth_1.getAuth)()
                .getUser(uid)
                .then((user) => {
                return user;
            })
                .catch((error) => {
                return error.message;
            });
        });
    }
    /**
     * Returns the User profile given an unforgable idToken
     * @param idToken
     * @returns Promise<UserProfile | any>
     */
    getUserProfile(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const formattingService = new formattingService_1.FormattingService();
            const token = yield this.validateToken(idToken);
            if (token.uid) {
                const firebaseUser = yield this.getFirebaseUser(token.uid);
                yield connection_1.db.accountsRepo.syncProviderEmailState(firebaseUser);
                const blitzkarteUser = yield connection_1.db.accountsRepo.getUserProfile(token.uid);
                if (blitzkarteUser) {
                    if (blitzkarteUser.usernameLocked === false && firebaseUser.emailVerified === true) {
                        yield connection_1.db.accountsRepo.lockUsername(firebaseUser.uid);
                        yield connection_1.db.accountsRepo.clearVerificationDeadline(firebaseUser.uid);
                    }
                }
                else {
                    yield this.restoreAccount(token.uid);
                    const blitzkarteUser = yield connection_1.db.accountsRepo.getUserProfile(token.uid);
                    return blitzkarteUser;
                }
                return blitzkarteUser;
            }
            else {
                return { error: 'idToken is not valid' };
            }
        });
    }
    restoreAccount(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield connection_1.db.accountsRepo.getUserRowFromAccounts(uid);
            if (users.length > 0) {
                const user = users[0];
                const providers = yield connection_1.db.accountsRepo.getProviderRowFromAccountsByUserId(user.userId);
                const userId = yield connection_1.db.accountsRepo.insertUserFromBackup(user);
                if (userId > 0) {
                    yield connection_1.db.accountsRepo.insertProvidersFromBackup(providers);
                }
            }
            else {
                console.log('Firebase UID does not exist in accounts DB. How did you pull that off?');
            }
        });
    }
    addAdditionalProvider(idToken, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.validateToken(idToken);
            if (token.uid) {
                const firebaseUser = yield this.getFirebaseUser(token.uid);
                const providerInDB = yield connection_1.db.accountsRepo.checkProviderInDB(token.uid, username);
                if (!providerInDB) {
                    const userId = yield connection_1.db.accountsRepo.getUserId(username);
                    const providerArgs = this.createProviderArgs(userId, firebaseUser);
                    yield connection_1.db.accountsRepo.createProvider(providerArgs);
                }
                else {
                    console.log('Provider in Database');
                }
            }
        });
    }
    updateUserSettings(idToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.validateToken(idToken);
            if (token.uid) {
                const blitzkarteUser = yield this.getUserProfile(idToken);
                return connection_1.db.accountsRepo.updatePlayerSettings(data.timeZone, data.meridiemTime, blitzkarteUser.userId);
            }
        });
    }
    getUserIdFromToken(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield this.validateToken(idToken);
            let userId = 0;
            if (token.uid) {
                const user = yield connection_1.db.accountsRepo.getUserProfile(token.uid);
                userId = user ? user.userId : 0;
            }
            return userId;
        });
    }
}
exports.AccountService = AccountService;
//# sourceMappingURL=accountService.js.map