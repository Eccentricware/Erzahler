export const getTransferValidationDataQuery = `
  SELECT ch.country_id,
    c.country_name,
    ch.banked_builds,
    ch.nuke_range
  FROM country_histories ch
  INNER JOIN get_last_country_history($1, $2) lch
    ON lch.country_id = ch.country_id AND lch.turn_id = ch.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE ch.country_status IN ('Active', 'Civil Disorder')
    AND c.rank != 'n';
`;
