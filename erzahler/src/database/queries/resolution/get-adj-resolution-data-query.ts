export const getAdjResolutionDataQuery = `
  WITH unit_presence AS (
    SELECT p.province_id,
      luh.unit_id
    FROM provinces p
    INNER JOIN nodes n ON n.province_id = p.province_id
    INNER JOIN get_last_unit_history($1, $2) luh ON luh.node_id = n.node_id
    WHERE p.game_id = $1
  ), units_disbanding AS (
    SELECT c.country_id,
      json_agg(
        json_build_object(
          'unit_id', ud.unit_id,
          'country_id', ud.country_id
        )
      ) AS units_disbanding
    FROM order_sets os
    INNER JOIN countries c ON c.country_id = os.country_id
    INNER JOIN units ud ON ud.unit_id = any(os.units_disbanding)
    WHERE c.game_id = $1
    GROUP BY c.country_id
  )
  SELECT os.order_set_id,
    os.country_id,
    c.country_name,
    lch.adjustments,
    lch.banked_builds,
    lch.nukes_in_production,
    lch.nuke_range,
    ud.units_disbanding,
    os.increase_range,
    os.nomination,
    os.increase_range_success,
    os.nomination_success,
    oa.build_order_id,
    oa.node_id,
    oa.build_type,
    oa.success,
    p.province_name,
    lph.controller_id,
    lph.province_status,
    up.unit_id
  FROM order_sets os
  INNER JOIN get_last_country_history(77, 4) lch ON lch.country_id = os.country_id
  INNER JOIN countries c ON c.country_id = os.country_id
  LEFT JOIN orders_adjustments oa ON oa.order_set_id = os.order_set_id
  LEFT JOIN nodes n ON n.node_id = oa.node_id
  LEFT JOIN provinces p ON p.province_id = n.province_id
  LEFT JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
  LEFT JOIN unit_presence up ON up.province_id = p.province_id
  LEFT JOIN units_disbanding ud ON ud.country_id = os.country_id
  WHERE os.turn_id = $3
    AND order_set_type = 'Orders'
  ORDER BY p.province_name;
`;