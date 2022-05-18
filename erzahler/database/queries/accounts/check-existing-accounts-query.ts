export const checkExistingAccountsQuery = `
  SELECT *
  FROM players
  WHERE username = $1
  OR email = $2;
`;