export const getUnitsQuery = `
  SELECT u.unit_name,
    u.unit_type,
    n.loc,
    c.flag_key,
    uh.unit_status,
    en.loc AS event_loc
  FROM get_last_unit_history($1, $2) luh
  INNER JOIN units u ON u.unit_id = luh.unit_id
  INNER JOIN unit_histories uh ON uh.unit_id = luh.unit_id AND uh.turn_id = luh.turn_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  INNER JOIN nodes en ON en.province_id = p.province_id AND en.node_type = 'event'
  WHERE uh.unit_status IN ('Active', 'Retreat');
`;
