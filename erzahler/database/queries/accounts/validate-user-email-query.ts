export const validateUserEmailQuery = `
  UPDATE users
  SET username_locked = true,
    user_status = 'active',
    email = p.email,
    email_verified = true
  FROM users u, firebase_providers p
  WHERE u.user_id = p.user_id
    AND p.uid = $1;
`;