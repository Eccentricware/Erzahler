import { UserRecord } from "firebase-admin/auth";
import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { UserProfile, UserProfileResult } from "../../models/objects/user-profile-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { clearVerficiationDeadlineQuery } from "../queries/accounts/clear-verification-deadline-query";
import { createProviderQuery } from "../queries/accounts/create-provider-query";
import { createUserQuery } from "../queries/accounts/create-user-query";
import { getExistingProviderQuery } from "../queries/accounts/get-existing-provider-query";
import { getUserIdQuery } from "../queries/accounts/get-user-id-query";
import { lockUsernameQuery } from "../queries/accounts/lock-username-query";
import { syncProviderEmailStateQuery } from "../queries/accounts/sync-provider-email-state-query";
import { getUserProfileQuery } from "../queries/dashboard/get-user-profile-query";
import { updatePlayerSettings } from "../queries/dashboard/update-user-query";

export class AccountsRepository {
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async checkUsernameAvailable(username: string): Promise<any> {
    const pool: Pool = new Pool(victorCredentials);

    return pool.query(getUserIdQuery, [username])
      .then((usernameCountResponse: any) => {
        return usernameCountResponse.rows.length === 0;
      })
      .catch((error: Error) => console.error(error.message));
  }

  async createUser(providerDependentArgs: any) {
    const pool = new Pool(victorCredentials);

    pool.query(createUserQuery, providerDependentArgs)
      .then((result: any) => { console.log(`Add user success:`, Boolean(result.rowCount)); })
      .catch((error: Error) => {
        console.log('Create User Query Error:', error.message);
      });
  }

  async createProvider(providerArgs: any) {
    const pool = new Pool(victorCredentials);

    pool.query(createProviderQuery, providerArgs)
      .then((result: any) => {
        console.log(`Provider added`, Boolean(result.rowCount));
      })
      .catch((error: Error) => {
        console.log('Create Provider Query Error:', error.message);
      });
  }

  async getUserProfile(uid: string): Promise<UserProfile | void> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUserProfileQuery, [uid])
      .then((result: QueryResult<UserProfileResult>) => {
        const user = result.rows[0];

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
        }
      } )
      .catch((error: Error) => {
        console.log('User Added Query Error', error.message);
      });
  }

  async getUserId(username: string): Promise<any> {
    const pool = new Pool(victorCredentials);

    return pool.query(getUserIdQuery, [username])
      .then((userResult: any) => {
        console.log('userResult.user_id:', userResult.rows[0].user_id);
        return userResult.rows[0].user_id;
      })
      .catch((error: Error) => console.error(error.message));
  }

  async checkProviderInDB(uid: string, username: string) {
    const pool = new Pool(victorCredentials);

    return pool.query(getExistingProviderQuery, [uid, username])
      .then((results: any) => Boolean(results.rowCount))
      .catch((error: Error) => { console.log(error.message); });
  }

  async syncProviderEmailState(firebaseUser: UserRecord) {
    const pool = new Pool(victorCredentials);

    await pool.query(syncProviderEmailStateQuery, [
      firebaseUser.email,
      firebaseUser.emailVerified,
      firebaseUser.metadata.lastSignInTime,
      firebaseUser.uid
    ]);
  }

  async lockUsername(uid: string) {
    const pool = new Pool(victorCredentials);

    return pool.query(lockUsernameQuery, [uid])
    .then((result: any) => { console.log('Username Locked'); })
    .catch((error: Error) => { console.log(error.message); });
  }

  async clearVerificationDeadline(uid: string) {
    const pool = new Pool(victorCredentials);

    pool.query(clearVerficiationDeadlineQuery, [uid])
      .then((result: any) => { console.log('Timer disabled'); })
      .catch((error: Error) => { console.log(error.message); });
  }

  updatePlayerSettings(timeZone: string, meridiemTime: boolean, userId: number) {
    const pool = new Pool(victorCredentials);

    return pool.query(updatePlayerSettings, [timeZone, meridiemTime, userId])
      .then(() => { success: true})
      .catch((error: Error) => {
        return {
          success: false,
          error: 'Update Profile Query Error: ' + error.message
        }
      });
  }
}