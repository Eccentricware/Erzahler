export const getNominationOrderQuery = `
  Select
    os.country_id as nominator_id,
    c.country_id,
    c.country_name,
    c.rank,
    lch.country_status
  FROM order_sets os
  LEFT JOIN countries c ON c.country_id = any(os.nomination)
  LEFT JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  WHERE os.turn_id = $3
    AND lch.country_status IN ('Active', 'Civil Disorder')
    AND CASE
      WHEN $4 = 0 THEN TRUE
      ELSE os.country_id = $4
    END
  ORDER BY os.country_id,
    c.rank,
    c.country_name;
`;
