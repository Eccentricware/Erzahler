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

export interface UserProfileResult {
  user_id: number,
  username: string,
  username_locked: boolean,
  user_status: string,
  classic_unit_render: boolean,
  city_render_size: string | number,
  label_render_size: string |number,
  unit_render_size: string |number,
  nmr_total: number,
  nmr_orders: number,
  nmr_retreats: number,
  nmr_adjustments: number,
  dropouts: number,
  color_theme: string | null,
  display_presence: false,
  real_name: string | null,
  display_real_name: boolean,
  time_zone: string,
  meridiem_time: boolean,
  uid: string,
  provider_type: string | number,
  email: string,
  email_verified: boolean,
  verification_deadline: Date | string | undefined
}