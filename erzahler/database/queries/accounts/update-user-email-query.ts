export const updateUserEmailQuery = `
  UPDATE users
  SET email_verified = false
  WHERE user_id = $1;
`;