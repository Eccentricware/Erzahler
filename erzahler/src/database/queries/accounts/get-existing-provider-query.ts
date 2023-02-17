export const getExistingProviderQuery = `
  SELECT u.username,
    p.uid,
    p.provider_type
  FROM users u
  INNER JOIN providers p
  ON u.user_id = p.user_id
  WHERE uid = $1;
`;
