import { UserRecord } from 'firebase-admin/auth';
import { Pool, QueryResult } from 'pg';
import { IDatabase, IMain } from 'pg-promise';
import {
  AccountsProviderRow,
  AccountsProviderRowResult,
  AccountsUserRow,
  AccountsUserRowResult,
  AddUserArgs,
  ContactPreferences,
  UserProfile,
  UserProfileResult
} from '../../models/objects/user-profile-object';
import { accountCredentials, envCredentials } from '../../secrets/dbCredentials';
import { clearVerficiationDeadlineQuery } from '../queries/accounts/clear-verification-deadline-query';
import { createAccountProviderQuery } from '../queries/accounts/create-account-provider-query';
import { createEnvironmentUserQuery } from '../queries/accounts/create-environment-user-query';
import { getExistingProviderQuery } from '../queries/accounts/get-existing-provider-query';
import { getUserIdQuery } from '../queries/accounts/get-user-id-query';
import { lockUsernameQuery } from '../queries/accounts/lock-username-query';
import { syncProviderEmailStateQuery } from '../queries/accounts/sync-provider-email-state-query';
import { getUserProfileQuery } from '../queries/dashboard/get-user-profile-query';
import { createAccountUserQuery } from '../queries/accounts/create-account-user-query';
import { getAccountsUserRowQuery } from '../queries/dashboard/get-accounts-user-row-query';
import { getAccountsProviderRowQuery } from '../queries/dashboard/get-accounts-provider-row-query';
import { insertProviderFromAccountsQuery } from '../queries/accounts/insert-provider-from-accounts-query';
import { NewUser, NewUserResult } from '../../models/objects/new-user-objects';
import { createEnvironmentProviderQuery } from '../queries/accounts/create-environment-provider-query';
import { insertUserContactPreferencesQuery, insertUserSettingsQuery } from '../queries/accounts/insert-user-settings-query';
import { insertUserDetailsQuery } from '../queries/accounts/insert-user-details-query';
import { updateUserSettingsQuery } from '../queries/dashboard/update-user-query';
import { CustomException } from '../../models/objects/exception-objects';
import { terminalLog } from '../../server/utils/general';

export class AccountsRepository {
  pool = new Pool(envCredentials);
  accountPool = new Pool(accountCredentials);

  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  // Legacy queries

  async checkUsernameAvailable(username: string): Promise<boolean> {
    return await this.accountPool
      .query(getUserIdQuery, [username])
      .then((usernameCountResponse: any) => {
        return usernameCountResponse.rows.length === 0;
      })
      .catch((error: Error) => {
        console.error(error.message);
        return false;
      });
  }

  async createAccountUser(userArgs: AddUserArgs): Promise<NewUser> {
    const newUser: NewUser[] = await this.accountPool
      .query(createAccountUserQuery, [userArgs.username, userArgs.usernameLocked, userArgs.signupTime])
      .then((result: QueryResult) =>
        result.rows.map((user: NewUserResult) => {
          return <NewUser>{
            userId: user.user_id,
            username: user.username,
            usernameLocked: user.username_locked,
            signupTime: user.signup_time
          };
        })
      )
      .catch((error: Error) => {
        console.log('Create Account User Error: ' + error.message);
        return [
          {
            userId: 0,
            username: 'Failboat',
            usernameLocked: false,
            signupTime: 'Failtime'
          }
        ];
      });

    return newUser[0];
  }

  async createEnvironmentUser(newUser: NewUser): Promise<boolean> {
    return await this.pool
      .query(createEnvironmentUserQuery, [newUser.userId, newUser.username, newUser.usernameLocked, newUser.signupTime])
      .then((result: any) => {
        console.log(`Add user success:`, Boolean(result.rowCount));
        return true;
      })
      .catch((error: Error) => {
        console.log('Create Environment User Query Error:', error.message);
        return false;
      });
  }

  async createUserDetails(newUser: NewUser, userStatus: string): Promise<void> {
    await this.pool
      .query(insertUserDetailsQuery, [newUser.userId, userStatus])
      .then((result: any) => {
        console.log(`Add user details success:`, Boolean(result.rowCount));
      })
      .catch((error: Error) => {
        console.log('Create Environment User Details Query Error:', error.message);
      });
  }

  async createUserSettings(newUser: NewUser): Promise<void> {
    await this.pool
      .query(insertUserSettingsQuery, [newUser.userId])
      .then((result: any) => {
        console.log(`Add user details success:`, Boolean(result.rowCount));
      })
      .catch((error: Error) => {
        console.log('Create Environment User Settings Query Error:', error.message);
      });
  }

  /**
   * Deprecated Immediately. May still be used in the future.
   * @param newUser
   */
  async createUserContactPreferences(newUser: NewUser): Promise<void> {
    await this.pool
      .query(insertUserContactPreferencesQuery, [newUser.userId])
      .then((result: any) => {
        console.log(`Add user contact preferences success:`, Boolean(result.rowCount));
      })
      .catch((error: Error) => {
        console.log('Create Environment User Contact Preferences Query Error:', error.message);
      });
  }

  async createAccountProvider(providerArgs: any): Promise<number> {
    return await this.accountPool
      .query(createAccountProviderQuery, providerArgs)
      .then((result: QueryResult) => {
        console.log(`Provider added`, Boolean(result.rowCount));
        return result.rows[0].provider_id;
      })
      .catch((error: Error) => {
        console.log('Create Account Provider Query Error:', error.message);
        return 0;
      });
  }

  async createEnvironmentProvider(providerArgs: any) {
    await this.pool
      .query(createEnvironmentProviderQuery, providerArgs)
      .then((result: any) => {
        console.log(`Provider added`, Boolean(result.rowCount));
      })
      .catch((error: Error) => {
        console.log('Create Environment Provider Query Error:', error.message);
      });
  }

  async getUserProfile(uid: string): Promise<UserProfile | undefined> {
    const userProfiles: UserProfile[] | undefined[] = await this.pool
      .query(getUserProfileQuery, [uid])
      .then((result: QueryResult<UserProfileResult>) => {
        return result.rows.map((userProfileResult: UserProfileResult) => {
          return <UserProfile>{
            userId: userProfileResult.user_id,
            username: userProfileResult.username,
            usernameLocked: userProfileResult.username_locked,
            userStatus: userProfileResult.user_status,
            classicUnitRender: userProfileResult.classic_unit_render,
            cityRenderSize: userProfileResult.city_render_size,
            labelRenderSize: userProfileResult.label_render_size,
            unitRenderSize: userProfileResult.unit_render_size,
            nmrTotal: userProfileResult.nmr_total,
            nmrOrders: userProfileResult.nmr_orders,
            nmrRetreats: userProfileResult.nmr_retreats,
            nmrAdjustments: userProfileResult.nmr_adjustments,
            dropouts: userProfileResult.dropouts,
            colorTheme: userProfileResult.color_theme,
            displayPresence: userProfileResult.display_presence,
            realName: userProfileResult.real_name,
            displayRealName: userProfileResult.display_real_name,
            uid: userProfileResult.uid,
            providerType: userProfileResult.provider_type,
            email: userProfileResult.email,
            emailVerified: userProfileResult.email_verified,
            verificationDeadline: userProfileResult.verification_deadline,
            timeZone: userProfileResult.time_zone,
            meridiemTime: userProfileResult.meridiem_time,
            contactPreferences: {
              preferredMethod: userProfileResult.preferred_contact_method,
              email: userProfileResult.contact_email,
              discord: userProfileResult.contact_discord,
              slack: userProfileResult.contact_slack,
              inGame: userProfileResult.contact_in_game,
              otherMethod: userProfileResult.other_contact_method,
              otherHandle: userProfileResult.other_contact_handle
            }
          };
        });
      })
      .catch((error: Error) => {
        terminalLog('Get User Profile Error:', error.message);
        return [undefined];
      });

      if (userProfiles.length > 1) {
        terminalLog('Accounts', `Multiple User Profiles for uid (${uid})`);
        return undefined;
      }

      if (userProfiles.length === 0) {
        terminalLog('Accounts', `No User Profile for uid (${uid})`);
        return undefined;
      }

      return userProfiles[0];
  }

  async getUserRowFromAccounts(uid: string): Promise<AccountsUserRow[]> {
    return await this.accountPool
      .query(getAccountsUserRowQuery, [uid])
      .then((result: QueryResult<AccountsUserRowResult>) =>
        result.rows.map((user: AccountsUserRowResult) => {
          return <AccountsUserRow>{
            userId: user.user_id,
            username: user.username,
            usernameLocked: user.username_locked,
            signupTime: user.signup_time
          };
        })
      )
      .catch((error: Error) => {
        console.log('Get Accounts User Rows Error:', error.message);
        return [];
      });
  }

  async getProviderRowFromAccountsByUserId(userId: number): Promise<AccountsProviderRow[]> {
    return await this.accountPool
      .query(getAccountsProviderRowQuery, [userId])
      .then((result: QueryResult<AccountsProviderRowResult>) =>
        result.rows.map((provider: AccountsProviderRowResult) => {
          return <AccountsProviderRow>{
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

  async getProviderRowFromEnvironmentByUserId(userId: number): Promise<number[]> {
    return await this.pool
      .query(getAccountsProviderRowQuery, [userId])
      .then((result: QueryResult<AccountsProviderRowResult>) =>
        result.rows.map((provider: AccountsProviderRowResult) => provider.provider_id)
      )
      .catch((error: Error) => {
        console.log('Get Accounts Provider Rows Error:', error.message);
        return [];
      });
  }

  async getUserId(username: string): Promise<any> {
    return await this.pool
      .query(getUserIdQuery, [username])
      .then((userResult: any) => {
        console.log('userResult.user_id:', userResult.rows[0].user_id);
        return userResult.rows[0].user_id;
      })
      .catch((error: Error) => console.error(error.message));
  }

  async checkProviderInDB(uid: string) {
    return await this.pool
      .query(getExistingProviderQuery, [uid])
      .then((results: any) => Boolean(results.rowCount))
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async syncAccountProviderEmailState(firebaseUser: UserRecord) {
    await this.accountPool.query(syncProviderEmailStateQuery, [
      firebaseUser.email,
      firebaseUser.emailVerified,
      firebaseUser.metadata.lastSignInTime,
      firebaseUser.uid
    ]);
  }

  async syncEnvironmentProviderEmailState(firebaseUser: UserRecord) {
    await this.pool.query(syncProviderEmailStateQuery, [
      firebaseUser.email,
      firebaseUser.emailVerified,
      firebaseUser.metadata.lastSignInTime,
      firebaseUser.uid
    ]);
  }

  async lockAccountUsername(uid: string) {
    return await this.accountPool
      .query(lockUsernameQuery, [uid])
      .then((result: any) => {
        console.log('Username Locked');
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async lockEnvironmentUsername(uid: string) {
    return await this.pool
      .query(lockUsernameQuery, [uid])
      .then((result: any) => {
        console.log('Username Locked');
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async clearAccountVerificationDeadline(uid: string) {
    await this.accountPool
      .query(clearVerficiationDeadlineQuery, [uid])
      .then((result: any) => {
        console.log('Timer disabled');
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async clearEnvironmentVerificationDeadline(uid: string) {
    await this.pool
      .query(clearVerficiationDeadlineQuery, [uid])
      .then((result: any) => {
        console.log('Timer disabled');
      })
      .catch((error: Error) => {
        console.log(error.message);
      });
  }

  async updatePlayerSettings(
    timeZone: string,
    meridiemTime: boolean,
    userId: number,
    username: string,
    contactPreferences: ContactPreferences
  ) {
    return await this.pool
      .query(updateUserSettingsQuery, [
        timeZone,
        meridiemTime,
        contactPreferences.preferredMethod,
        contactPreferences.email,
        contactPreferences.discord,
        contactPreferences.slack,
        contactPreferences.inGame,
        contactPreferences.otherMethod,
        contactPreferences.otherHandle,
        userId
      ])
      .then(() => {
        return {
          username: username,
          success: true
        };
      })
      .catch((error: Error) => {
        return {
          username: username,
          success: false,
          error: 'Update Profile Query Error: ' + error.message
        };
      });
  }

  async insertUserFromBackup(user: AccountsUserRow): Promise<number> {
    return await this.pool
      .query(createEnvironmentUserQuery, [user.userId, user.username, user.usernameLocked, user.signupTime])
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
