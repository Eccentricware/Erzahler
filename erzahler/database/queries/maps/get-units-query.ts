export const getUnitsQuery = `
  SELECT u.unit_name,
    u.unit_type,
    n.loc,
    c.flag_key
  FROM units u
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  WHERE g.game_id = $1
    AND uh.turn_id = $2;
`;