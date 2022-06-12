export const syncUserEmailStateQuery = `
  UPDATE users
  SET email = $1,
    email_verified = $2
  WHERE user_id = $3
`;