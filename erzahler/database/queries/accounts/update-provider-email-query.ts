export const updateProviderEmailQuery = `
  UPDATE firebase_providers
  SET email = $1,
    email_verified = false
  WHERE uid = $2;
`;