export const updateUserEmailQuery = `
  UPDATE users
  SET user_status = 'changingEmail',
    email_verified = false,
    verification_deadline = $1
  WHERE user_id = $2;
`;