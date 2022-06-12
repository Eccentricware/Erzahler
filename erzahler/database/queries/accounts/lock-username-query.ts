export const lockUsernameQuery = `
  UPDATE users
  SET username_locked = true,
    user_status = 'active'
  FROM providers
  WHERE users.user_id = providers.user_id
    AND providers.uid = $1;
`;