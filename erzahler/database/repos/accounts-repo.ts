import { UserRecord } from "firebase-admin/auth";
import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { AccountsProviderRow, AccountsProviderRowResult, AccountsUserRow, AccountsUserRowResult, UserProfile, UserProfileResult } from "../../models/objects/user-profile-object";
import { accountCredentials, devCredentials, victorCredentials, } from "../../secrets/dbCredentials";
import { clearVerficiationDeadlineQuery } from "../queries/accounts/clear-verification-deadline-query";
import { createProviderQuery } from "../queries/accounts/create-provider-query";
import { createEnvironmentUserQuery } from "../queries/accounts/create-environment-user-query";
import { getExistingProviderQuery } from "../queries/accounts/get-existing-provider-query";
import { getUserIdQuery } from "../queries/accounts/get-user-id-query";
import { lockUsernameQuery } from "../queries/accounts/lock-username-query";
import { syncProviderEmailStateQuery } from "../queries/accounts/sync-provider-email-state-query";
import { getUserProfileQuery } from "../queries/dashboard/get-user-profile-query";
import { updatePlayerSettings } from "../queries/dashboard/update-user-query";
import { createAccountUserQuery } from "../queries/accounts/create-account-user-query";
import { getAccountsUserRowQuery } from "../queries/dashboard/get-accounts-user-row-query";
import { getAccountsProviderRowQuery } from "../queries/dashboard/get-accounts-provider-row-query";
import { insertUserFromAccountsQuery } from "../queries/accounts/insert-user-from-accounts-query";
import { insertProviderFromAccountsQuery } from "../queries/accounts/insert-provider-from-accounts-query";

export class AccountsRepository {
  pool = new Pool(victorCredentials);
  accountPool = new Pool(accountCredentials);

  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  // Legacy queries

  async checkUsernameAvailable(username: string): Promise<any> {
    return this.accountPool.query(getUserIdQuery, [username])
      .then((usernameCountResponse: any) => {
        return usernameCountResponse.rows.length === 0;
      })
      .catch((error: Error) => console.error(error.message));
  }

  async createAccountUser(providerDependentArgs: any): Promise<number> {
    const ceId: number = await this.accountPool.query(createAccountUserQuery, providerDependentArgs)
      .then((result: any) => {
        console.log(`Add user success:`, Boolean(result.rowCount));
        return result.rows[0].ce_id;
      })
      .catch((error: Error) => {
        console.log('Create User Query Error:', error.message);
        return 0;
      });

    return ceId;
  }

  async createEnvironmentUser(providerDependentArgs: any) {
    this.accountPool.query(createEnvironmentUserQuery, providerDependentArgs)
      .then((result: any) => {
        console.log(`Add user success:`, Boolean(result.rowCount));

      })
      .catch((error: Error) => {
        console.log('Create User Query Error:', error.message);
      });
  }

  async createProvider(providerArgs: any) {
    this.pool.query(createProviderQuery, providerArgs)
      .then((result: any) => {
        console.log(`Provider added`, Boolean(result.rowCount));
      })
      .catch((error: Error) => {
        console.log('Create Provider Query Error:', error.message);
      });
  }

  async getUserProfile(uid: string): Promise<UserProfile | void> {
    return this.pool.query(getUserProfileQuery, [uid])
      .then((result: QueryResult<UserProfileResult>) => {
        const user = result.rows[0];

        if (result.rows.length > 0) {
          return <UserProfile | void> {
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
      .catch((error: Error) => {
        console.log('Get User Profile Error:', error.message);
      });
  }

  async getUserRowFromAccounts(uid: string): Promise<AccountsUserRow[]> {
    return this.accountPool.query(getAccountsUserRowQuery, [uid])
      .then((result: QueryResult<AccountsUserRowResult>) =>
        result.rows.map((user: AccountsUserRowResult) => {
          return <AccountsUserRow> {
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
        })
      )
      .catch((error: Error) => {
        console.log('Get Accounts User Rows Error:', error.message);
        return [];
      });
  }

  async getProviderRowFromAccountsByUserId(userId: number): Promise<AccountsProviderRow[]> {
    return this.accountPool.query(getAccountsProviderRowQuery, [userId])
      .then((result: QueryResult<AccountsProviderRowResult>) =>
        result.rows.map((provider: AccountsProviderRowResult) => {
          return <AccountsProviderRow> {
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
        })
      )
      .catch((error: Error) => {
        console.log('Get Accounts Provider Rows Error:', error.message);
        return [];
      });
  }

  async getUserId(username: string): Promise<any> {
    return this.pool.query(getUserIdQuery, [username])
      .then((userResult: any) => {
        console.log('userResult.user_id:', userResult.rows[0].user_id);
        return userResult.rows[0].user_id;
      })
      .catch((error: Error) => console.error(error.message));
  }

  async checkProviderInDB(uid: string, username: string) {
    return this.pool.query(getExistingProviderQuery, [uid, username])
      .then((results: any) => Boolean(results.rowCount))
      .catch((error: Error) => { console.log(error.message); });
  }

  async syncProviderEmailState(firebaseUser: UserRecord) {
    await this.pool.query(syncProviderEmailStateQuery, [
      firebaseUser.email,
      firebaseUser.emailVerified,
      firebaseUser.metadata.lastSignInTime,
      firebaseUser.uid
    ]);
  }

  async lockUsername(uid: string) {
    return await this.pool.query(lockUsernameQuery, [uid])
      .then((result: any) => { console.log('Username Locked'); })
      .catch((error: Error) => { console.log(error.message); });
  }

  async clearVerificationDeadline(uid: string) {
    await this.pool.query(clearVerficiationDeadlineQuery, [uid])
      .then((result: any) => { console.log('Timer disabled'); })
      .catch((error: Error) => { console.log(error.message); });
  }

  async updatePlayerSettings(timeZone: string, meridiemTime: boolean, userId: number) {
    return this.pool.query(updatePlayerSettings, [timeZone, meridiemTime, userId])
      .then(() => { success: true})
      .catch((error: Error) => {
        return {
          success: false,
          error: 'Update Profile Query Error: ' + error.message
        }
      });
  }

  async insertUserFromBackup(user: AccountsUserRow): Promise<number> {
    return await this.pool.query(insertUserFromAccountsQuery, [
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
    .then((result: QueryResult) => result.rows[0].user_id)
    .catch((error: Error) => {
      console.log('Insert User From Backup Error: ' + error.message);
      return 0;
    });
  }

  async insertProvidersFromBackup(providers: AccountsProviderRow[]): Promise<void> {
    providers.forEach(async (provider: AccountsProviderRow) => {
      await this.pool.query(insertProviderFromAccountsQuery, [
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
    });
  }
}