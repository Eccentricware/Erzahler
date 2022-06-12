export const syncProviderEmailStateQuery = `
  UPDATE providers
  SET email = $1,
    email_verified = $2,
    last_sign_in_time = $3
  WHERE uid = $4;
`;