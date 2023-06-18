export const getAccountsUserRowQuery = `
  SELECT
    u.user_id,
    u.username,
    u.username_locked,
    u.signup_time
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE p.user_id = u.user_id
  AND p.uid = $1
`;
