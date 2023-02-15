export interface NewUserResult {
  user_id: number;
  username: string;
  username_locked: boolean;
  user_status: string;
  signup_time: string;
  time_zone: string;
  meridiem_time: boolean;
  last_sign_in_time: string;
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

export interface NewUser {
  userId: number;
  username: string;
  usernameLocked: boolean;
  userStatus: string;
  signupTime: string;
  timeZone: string;
  meridiemTime: boolean;
  lastSignInTime: string;
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