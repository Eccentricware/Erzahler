export const getAccountsProviderRowQuery = `
  SELECT
    p.provider_id,
    p.user_id,
    p.uid,
    p.provider_type,
    p.display_name,
    p.email,
    p.email_verified,
    p.verification_deadline,
    p.creation_time,
    p.last_sign_in_time,
    p.photo_url
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE p.user_id = u.user_id
  AND u.user_id = $1
`;
