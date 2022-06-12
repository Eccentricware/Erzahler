export const syncProviderEmailStateQuery = `
  UPDATE firebase_providers
  SET email = $1,
    email_verified = $2
  WHERE uid = $3;
`;