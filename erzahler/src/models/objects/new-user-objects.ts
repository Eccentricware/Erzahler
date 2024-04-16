export interface NewUserResult {
  user_id: number;
  username: string;
  username_locked: boolean;
  signup_time: string;
}

export interface NewUser {
  userId: number;
  username: string;
  usernameLocked: boolean;
  signupTime: string;
}

export type ProviderArgs = string | number | boolean | undefined | null | Date;
