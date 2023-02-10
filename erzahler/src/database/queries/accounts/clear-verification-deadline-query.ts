export const clearVerficiationDeadlineQuery = `
  UPDATE providers
  SET verification_deadline = null
  WHERE uid = $1;
`;
