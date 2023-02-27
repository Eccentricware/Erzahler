export const getTransferValidationDataQuery = `
  SELECT ch.country_id,
    c.country_name,
    ch.banked_builds,
    ch.nuke_range
  FROM country_histories ch
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE ch.turn_id = $1;
`;