export interface DetailedBoolean {
  value: boolean;
  result?: any;
  message?: string;
  alert?: boolean;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}

export type Primitive = string | number | boolean | undefined | null;

export type SettingType = boolean | number | string | Date | undefined | null;
