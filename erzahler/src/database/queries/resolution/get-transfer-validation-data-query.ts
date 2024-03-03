export const getTransferValidationDataQuery = `
  SELECT lch.country_id,
    c.country_name,
    lch.banked_builds,
    lch.nuke_range
  FROM get_last_country_history($1, $2) lch
  INNER JOIN countries c ON c.country_id = lch.country_id
  WHERE lch.country_status IN ('Active', 'Civil Disorder')
    AND c.rank != 'n';
`;
