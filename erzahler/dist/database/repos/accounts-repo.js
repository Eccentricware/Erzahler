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
exports.AccountsRepository = void 0;
const pg_1 = require("pg");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const clear_verification_deadline_query_1 = require("../queries/accounts/clear-verification-deadline-query");
const create_provider_query_1 = require("../queries/accounts/create-provider-query");
const create_environment_user_query_1 = require("../queries/accounts/create-environment-user-query");
const get_existing_provider_query_1 = require("../queries/accounts/get-existing-provider-query");
const get_user_id_query_1 = require("../queries/accounts/get-user-id-query");
const lock_username_query_1 = require("../queries/accounts/lock-username-query");
const sync_provider_email_state_query_1 = require("../queries/accounts/sync-provider-email-state-query");
const get_user_profile_query_1 = require("../queries/dashboard/get-user-profile-query");
const update_user_query_1 = require("../queries/dashboard/update-user-query");
const create_account_user_query_1 = require("../queries/accounts/create-account-user-query");
const get_accounts_user_row_query_1 = require("../queries/dashboard/get-accounts-user-row-query");
const get_accounts_provider_row_query_1 = require("../queries/dashboard/get-accounts-provider-row-query");
const insert_user_from_accounts_query_1 = require("../queries/accounts/insert-user-from-accounts-query");
const insert_provider_from_accounts_query_1 = require("../queries/accounts/insert-provider-from-accounts-query");
class AccountsRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
        this.accountPool = new pg_1.Pool(dbCredentials_1.accountCredentials);
    }
    // Legacy queries
    checkUsernameAvailable(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.accountPool
                .query(get_user_id_query_1.getUserIdQuery, [username])
                .then((usernameCountResponse) => {
                return usernameCountResponse.rows.length === 0;
            })
                .catch((error) => console.error(error.message));
        });
    }
    createAccountUser(providerDependentArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            const ceId = yield this.accountPool
                .query(create_account_user_query_1.createAccountUserQuery, providerDependentArgs)
                .then((result) => {
                console.log(`Add user success:`, Boolean(result.rowCount));
                return result.rows[0].ce_id;
            })
                .catch((error) => {
                console.log('Create User Query Error:', error.message);
                return 0;
            });
            return ceId;
        });
    }
    createEnvironmentUser(providerDependentArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            this.accountPool
                .query(create_environment_user_query_1.createEnvironmentUserQuery, providerDependentArgs)
                .then((result) => {
                console.log(`Add user success:`, Boolean(result.rowCount));
            })
                .catch((error) => {
                console.log('Create User Query Error:', error.message);
            });
        });
    }
    createProvider(providerArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            this.pool
                .query(create_provider_query_1.createProviderQuery, providerArgs)
                .then((result) => {
                console.log(`Provider added`, Boolean(result.rowCount));
            })
                .catch((error) => {
                console.log('Create Provider Query Error:', error.message);
            });
        });
    }
    getUserProfile(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool
                .query(get_user_profile_query_1.getUserProfileQuery, [uid])
                .then((result) => {
                const user = result.rows[0];
                if (result.rows.length > 0) {
                    return {
                        userId: user.user_id,
                        username: user.username,
                        usernameLocked: user.username_locked,
                        userStatus: user.user_status,
                        classicUnitRender: user.classic_unit_render,
                        cityRenderSize: user.city_render_size,
                        labelRenderSize: user.label_render_size,
                        unitRenderSize: user.unit_render_size,
                        nmrTotal: user.nmr_total,
                        nmrOrders: user.nmr_orders,
                        nmrRetreats: user.nmr_retreats,
                        nmrAdjustments: user.nmr_adjustments,
                        dropouts: user.dropouts,
                        colorTheme: user.color_theme,
                        displayPresence: user.display_presence,
                        realName: user.real_name,
                        displayRealName: user.display_real_name,
                        uid: user.uid,
                        providerType: user.provider_type,
                        email: user.email,
                        emailVerified: user.email_verified,
                        verificationDeadline: user.verification_deadline,
                        timeZone: user.time_zone,
                        meridiemTime: user.meridiem_time
                    };
                }
            })
                .catch((error) => {
                console.log('Get User Profile Error:', error.message);
            });
        });
    }
    getUserRowFromAccounts(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.accountPool
                .query(get_accounts_user_row_query_1.getAccountsUserRowQuery, [uid])
                .then((result) => result.rows.map((user) => {
                return {
                    userId: user.user_id,
                    username: user.username,
                    usernameLocked: user.username_locked,
                    userStatus: user.user_status,
                    signupTime: user.signup_time,
                    timeZone: user.time_zone,
                    meridiemTime: user.meridiem_time,
                    lastSignInTime: user.last_sign_in_time,
                    classicUnitRender: user.classic_unit_render,
                    cityRenderSize: user.city_render_size,
                    labelRenderSize: user.label_render_size,
                    unitRenderSize: user.unit_render_size,
                    wins: user.wins,
                    nmrTotal: user.nmr_total,
                    nmrOrders: user.nmr_orders,
                    nmrRetreats: user.nmr_retreats,
                    nmrAdjustments: user.nmr_adjustments,
                    dropouts: user.dropouts,
                    saves: user.saves,
                    colorTheme: user.color_theme,
                    loggedIn: user.logged_in,
                    displayPresence: user.display_presence,
                    siteAdmin: user.site_admin,
                    realName: user.real_name,
                    displayRealName: user.display_real_name
                };
            }))
                .catch((error) => {
                console.log('Get Accounts User Rows Error:', error.message);
                return [];
            });
        });
    }
    getProviderRowFromAccountsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.accountPool
                .query(get_accounts_provider_row_query_1.getAccountsProviderRowQuery, [userId])
                .then((result) => result.rows.map((provider) => {
                return {
                    providerId: provider.provider_id,
                    userId: provider.user_id,
                    uid: provider.uid,
                    providerType: provider.provider_type,
                    displayName: provider.display_name,
                    email: provider.email,
                    emailVerified: provider.email_verified,
                    verificationDeadline: provider.verification_deadline,
                    creationTime: provider.creation_time,
                    lastSignInTime: provider.last_sign_in_time,
                    photoUrl: provider.photo_url
                };
            }))
                .catch((error) => {
                console.log('Get Accounts Provider Rows Error:', error.message);
                return [];
            });
        });
    }
    getUserId(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool
                .query(get_user_id_query_1.getUserIdQuery, [username])
                .then((userResult) => {
                console.log('userResult.user_id:', userResult.rows[0].user_id);
                return userResult.rows[0].user_id;
            })
                .catch((error) => console.error(error.message));
        });
    }
    checkProviderInDB(uid, username) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool
                .query(get_existing_provider_query_1.getExistingProviderQuery, [uid, username])
                .then((results) => Boolean(results.rowCount))
                .catch((error) => {
                console.log(error.message);
            });
        });
    }
    syncProviderEmailState(firebaseUser) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(sync_provider_email_state_query_1.syncProviderEmailStateQuery, [
                firebaseUser.email,
                firebaseUser.emailVerified,
                firebaseUser.metadata.lastSignInTime,
                firebaseUser.uid
            ]);
        });
    }
    lockUsername(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(lock_username_query_1.lockUsernameQuery, [uid])
                .then((result) => {
                console.log('Username Locked');
            })
                .catch((error) => {
                console.log(error.message);
            });
        });
    }
    clearVerificationDeadline(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool
                .query(clear_verification_deadline_query_1.clearVerficiationDeadlineQuery, [uid])
                .then((result) => {
                console.log('Timer disabled');
            })
                .catch((error) => {
                console.log(error.message);
            });
        });
    }
    updatePlayerSettings(timeZone, meridiemTime, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool
                .query(update_user_query_1.updatePlayerSettings, [timeZone, meridiemTime, userId])
                .then(() => {
                true;
            })
                .catch((error) => {
                return {
                    success: false,
                    error: 'Update Profile Query Error: ' + error.message
                };
            });
        });
    }
    insertUserFromBackup(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(insert_user_from_accounts_query_1.insertUserFromAccountsQuery, [
                user.userId,
                user.username,
                user.usernameLocked,
                user.userStatus,
                user.signupTime,
                user.timeZone,
                user.meridiemTime,
                user.lastSignInTime,
                user.classicUnitRender,
                user.cityRenderSize,
                user.labelRenderSize,
                user.unitRenderSize,
                user.wins,
                user.nmrTotal,
                user.nmrOrders,
                user.nmrRetreats,
                user.nmrAdjustments,
                user.dropouts,
                user.saves,
                user.colorTheme,
                user.loggedIn,
                user.displayPresence,
                user.siteAdmin,
                user.realName,
                user.displayRealName
            ])
                .then((result) => result.rows[0].user_id)
                .catch((error) => {
                console.log('Insert User From Backup Error: ' + error.message);
                return 0;
            });
        });
    }
    insertProvidersFromBackup(providers) {
        return __awaiter(this, void 0, void 0, function* () {
            providers.forEach((provider) => __awaiter(this, void 0, void 0, function* () {
                yield this.pool.query(insert_provider_from_accounts_query_1.insertProviderFromAccountsQuery, [
                    provider.providerId,
                    provider.userId,
                    provider.uid,
                    provider.providerType,
                    provider.displayName,
                    provider.email,
                    provider.emailVerified,
                    provider.verificationDeadline,
                    provider.creationTime,
                    provider.lastSignInTime,
                    provider.photoUrl
                ]);
            }));
        });
    }
}
exports.AccountsRepository = AccountsRepository;
//# sourceMappingURL=accounts-repo.js.map