export const getRetreatingOrderOptionsQuery = `
  SELECT oo.unit_id,
    u.unit_type,
    u.country_id unit_country_id,
    c.country_name unit_country_name,
    c.rank unit_country_rank,
    c.flag_key unit_country_flag_key,
    p.province_name,
    p.province_type,
    n.node_id,
    n.loc unit_loc,
    json_agg(CASE WHEN dn.node_id IS NOT NULL
      THEN
      json_build_object(
        'node_id', dn.node_id,
        'node_name', dn.node_name,
        'node_display', dn.node_display,
        'loc', en.loc
      ) ELSE null END
    ) AS destinations
  FROM order_options oo
  INNER JOIN units u ON u.unit_id = oo.unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = uh.unit_id AND luh.turn_id = uh.turn_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN turns t ON t.turn_id = uh.turn_id
  LEFT JOIN nodes dn ON dn.node_id = any(oo.destinations)
  LEFT JOIN provinces pn ON pn.province_id = dn.province_id
  LEFT JOIN nodes en ON en.province_id = pn.province_id AND en.node_type = 'event'
  WHERE t.game_id = $1
    AND t.turn_number <= $2
    AND oo.turn_id = $3
    AND uh.unit_status = 'Retreat'
    AND CASE
      WHEN 0 != $4 THEN u.country_id = $4
      ELSE true
    END
  GROUP BY oo.unit_id,
    u.unit_type,
    u.country_id,
    c.country_name,
    c.rank,
    c.flag_key,
    p.province_name,
    n.node_id,
    uh.unit_status,
    n.loc,
    oo.order_type,
    t.turn_type,
    p.province_type
  ORDER BY c.rank,
    c.country_name,
    p.province_name
`;
