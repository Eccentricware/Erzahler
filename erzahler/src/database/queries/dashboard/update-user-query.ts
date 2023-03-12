export const updateUserSettingsQuery = `
  UPDATE user_settings
  SET time_zone = $1,
    meridiem_time = $2
  WHERE user_id = $3;
`;
