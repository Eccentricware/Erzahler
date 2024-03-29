export const lockUsernameQuery = `
  UPDATE users
  SET username_locked = true,
    user_status = 'Active'
  FROM providers
  WHERE users.user_id = providers.user_id
    AND providers.uid = $1;
`;
