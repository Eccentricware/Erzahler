export interface AccountsUserRowResult {
  user_id: number;
  username: string;
  username_locked: boolean;
  user_status: string;
  signup_time: Date | string;
  time_zone: string;
  meridiem_time: boolean;
  last_sign_in_time: Date | string;
  classic_unit_render: boolean;
  city_render_size: number;
  label_render_size: number;
  unit_render_size: number;
  wins: number;
  nmr_total: number;
  nmr_orders: number;
  nmr_retreats: number;
  nmr_adjustments: number;
  dropouts: number;
  saves: number;
  color_theme: string;
  logged_in: boolean;
  display_presence: boolean;
  site_admin: boolean;
  real_name: string;
  display_real_name: boolean;
}

export interface AccountsUserRow {
  userId: number;
  username: string;
  usernameLocked: boolean;
  userStatus: string;
  signupTime: Date | string;
  timeZone: string;
  meridiemTime: boolean;
  lastSignInTime: Date | string;
  classicUnitRender: boolean;
  cityRenderSize: number;
  labelRenderSize: number;
  unitRenderSize: number;
  wins: number;
  nmrTotal: number;
  nmrOrders: number;
  nmrRetreats: number;
  nmrAdjustments: number;
  dropouts: number;
  saves: number;
  colorTheme: string;
  loggedIn: boolean;
  displayPresence: boolean;
  siteAdmin: boolean;
  realName: string;
  displayRealName: boolean;
}

export interface AccountsProviderRowResult {
  provider_id: number;
  user_id: number;
  uid: string;
  provider_type: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  verification_deadline: Date | string;
  creation_time: Date | string;
  last_sign_in_time: Date | string;
  photo_url: string;
}

export interface AccountsProviderRow {
  providerId: number;
  userId: number;
  uid: string;
  providerType: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  verificationDeadline: Date | string;
  creationTime: Date | string;
  lastSignInTime: Date | string;
  photoUrl: string;
}

export interface UserProfileResult {
  user_id: number;
  username: string;
  username_locked: boolean;
  user_status: string;
  classic_unit_render: boolean;
  city_render_size: string | number;
  label_render_size: string | number;
  unit_render_size: string | number;
  nmr_total: number;
  nmr_orders: number;
  nmr_retreats: number;
  nmr_adjustments: number;
  dropouts: number;
  color_theme: string | null;
  display_presence: false;
  real_name: string | null;
  display_real_name: boolean;
  time_zone: string;
  meridiem_time: boolean;
  uid: string;
  provider_type: string | number;
  email: string;
  email_verified: boolean;
  verification_deadline: Date | string | undefined;
}

export interface UserProfile {
  userId: number;
  username: string;
  usernameLocked: boolean;
  userStatus: string;
  classicUnitRender: boolean;
  cityRenderSize: string | number;
  labelRenderSize: string | number;
  unitRenderSize: string | number;
  nmrTotal: number;
  nmrOrders: number;
  nmrRetreats: number;
  nmrAdjustments: number;
  dropouts: number;
  colorTheme: string;
  displayPresence: boolean;
  realName: string;
  displayRealName: boolean;
  uid: string;
  providerType: string | number;
  email: string;
  emailVerified: boolean;
  verificationDeadline: Date | string | undefined;
  timeZone: string;
  meridiemTime: boolean;
}
