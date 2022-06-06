export const validateProviderEmailQuery = `
  UPDATE firebase_providers
  SET email_verified = true
  WHERE uid = $1;
`;