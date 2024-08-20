export const getAdjResolutionDataQuery = `
  WITH unit_presence AS (
      SELECT u.unit_id,
        p.province_id
      FROM units u
      INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
      INNER JOIN nodes n ON n.node_id = luh.node_id
      INNER JOIN provinces p ON p.province_id = n.province_id
      WHERE luh.unit_status = 'Active'
    ),
  country_builds AS (
    SELECT os.country_id,
      json_agg(
        json_build_object(
          'build_order_id', oa.build_order_id,
          'order_set_id', oa.order_set_id,
          'country_id', os.country_id,
          'build_type', oa.build_type,
          'build_node', oa.node_id,
          'destination_controller_id', lph.controller_id,
          'province_name', p.province_name,
          'existing_unit_id', up.unit_id
        )
      ) builds
    FROM orders_adjustments oa
    INNER JOIN order_sets os ON os.order_set_id = oa.order_set_id
    INNER JOIN nodes n ON n.node_id = oa.node_id
    INNER JOIN provinces p ON p.province_id = n.province_id
    INNER JOIN get_last_province_history($1, $2) lph ON lph.province_id = p.province_id
    LEFT JOIN unit_presence up ON up.province_id = p.province_id
    WHERE os.turn_id = $3
    GROUP BY os.country_id
  ), country_disbands AS (
    SELECT c.country_id,
      json_agg(
        json_build_object(
          'unit_id', ud.unit_id,
          'country_id', ud.country_id,
          'province_name', p.province_name,
          'node_id', udh.node_id
        )
      ) AS disbands
    FROM order_sets os
    INNER JOIN countries c ON c.country_id = os.country_id
    INNER JOIN units ud ON ud.unit_id = any(os.units_disbanding)
    INNER JOIN get_last_unit_history($1, $2) udh ON udh.unit_id = ud.unit_id
    INNER JOIN nodes n ON n.node_id = udh.node_id
    INNER JOIN provinces p ON p.province_id = n.province_id
    WHERE c.game_id = $1
      AND os.turn_id = $3
    GROUP BY c.country_id
  ), available_nodes AS (
    SELECT lph.controller_id,
      json_agg(
        json_build_object(
          'province_id', p.province_id,
          'province_name', p.province_name,
          'node_id', bn.node_id,
          'node_name', bn.node_name
        )
      ) AS valid_provinces
    FROM get_last_province_history($1, $2) lph
    INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = lph.controller_id
    INNER JOIN provinces p ON p.province_id = lph.province_id
    INNER JOIN nodes bn ON bn.province_id = p.province_id
    LEFT JOIN unit_presence up ON up.province_id = p.province_id
    WHERE lph.province_status = 'active'
      AND up.unit_id IS NULL
      AND bn.node_type = 'land'
    GROUP BY lph.controller_id
  )
  SELECT os.order_set_id,
    os.country_id,
    c.country_name,
    lch.adjustments,
    lch.banked_builds,
    lch.nukes_in_production,
    lch.nuke_range,
	  cb.builds,
    cd.disbands,
    ap.valid_provinces,
    os.increase_range,
    os.nomination,
    os.increase_range_success,
    os.nomination_success
  FROM order_sets os
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = os.country_id
  INNER JOIN countries c ON c.country_id = os.country_id
	LEFT JOIN country_builds cb ON cb.country_id = os.country_id
  LEFT JOIN country_disbands cd ON cd.country_id = os.country_id
  LEFT JOIN available_nodes ap ON ap.controller_id = os.country_id
  WHERE os.turn_id = $3
    AND order_set_type = 'Orders';
`;
