export const checkEmailExistsInDBQuery = `
  SELECT COUNT(email) as email_exists
  FROM players
  WHERE email = $1;
`;