export const getDisbandOrdersQuery = `
  SELECT
    c.country_id,
    c.country_name,
    ch.banked_builds,
    ABS(ch.adjustments) disbands,
    json_agg(
          json_build_object(
            'unit_id', u.unit_id,
            'unit_type', u.unit_type,
            'province_name', p.province_name,
            'loc', n.loc
          )
    ) AS unit_disbanding_detailed,
    os.nuke_locs,
    ch.nuke_range,
    os.increase_range,
    os.units_disbanding
  FROM order_sets os
  INNER JOIN units u ON u.unit_id = any(os.units_disbanding)
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  LEFT JOIN nodes n ON n.node_id = uh.node_id
  LEFT JOIN provinces p ON p.province_id = n.province_id
  LEFT JOIN countries c ON c.country_id = os.country_id
  LEFT JOIN country_histories ch ON ch.country_id = c.country_id
  WHERE ch.turn_id = $1
    AND os.turn_id = $2
    AND order_set_type = 'Orders'
    AND CASE WHEN 0 = $3 THEN true ELSE os.country_id = $3 END
  GROUP BY
    c.country_id,
    c.country_name,
    ch.banked_builds,
    ch.adjustments,
    ch.nuke_range,
    os.nuke_locs,
    os.increase_range,
    os.units_disbanding;
`;
