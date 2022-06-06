export const validateUserEmailQuery = `
  UPDATE users
  SET username_locked = true,
    user_status = 'active',
    email = firebase_providers.email,
    email_verified = true
  FROM firebase_providers
  WHERE users.user_id = firebase_providers.user_id
    AND firebase_providers.uid = $1;
`;