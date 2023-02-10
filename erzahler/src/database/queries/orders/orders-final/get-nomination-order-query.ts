export const getNominationOrderQuery = `
  Select
    c.country_id,
    c.country_name,
    c.rank
  FROM order_sets os
  LEFT JOIN countries c ON c.country_id = any(os.nomination)
  WHERE os.turn_id = $1
    AND os.country_id = $2
  ORDER BY c.rank,
    c.country_name;
`;
