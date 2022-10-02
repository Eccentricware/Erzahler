export interface UserProfileObject {
  userId: number;
  username: string;
  usernameLocked: boolean;
  userStatus: string;
  classicUnitRender: boolean;
  cityRenderSize: string;
  labelRenderSize: number;
  unitRenderSize: number;
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
  providerType: string;
  email: string;
  emailVerified: boolean;
  verificationDeadline: Date;
}