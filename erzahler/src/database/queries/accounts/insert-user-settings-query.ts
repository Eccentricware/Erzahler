export const insertUserSettingsQuery = `
  INSERT INTO user_settings (
    user_id
  ) VALUES (
    $1
  );
`;

export const insertUserContactPreferencesQuery = `
  INSERT INTO user_contact_preferences (
    user_id
  ) VALUES (
    $1
  );
`;