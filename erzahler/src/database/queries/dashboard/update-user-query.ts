export const updateUserSettingsQuery = `
  UPDATE user_settings
  SET time_zone = $1,
    meridiem_time = $2,
    preferred_contact_method = $3,
    contact_email = $4,
    contact_discord = $5,
    contact_slack = $6,
    contact_in_game = $7,
    other_contact_method = $8,
    other_contact_handle = $9
  WHERE user_id = $10;
`;
