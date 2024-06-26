export const getBuildOrdersQuery = `
  SELECT
    c.country_id,
    c.country_name,
    lch.banked_builds,
    lch.adjustments adjustments,
    CASE
      WHEN lch.adjustments > 0 THEN
        json_agg(
          json_build_object(
            'build_number', bo.build_number,
            'build_type', bo.build_type,
            'node_id', n.node_id,
            'node_name', n.node_name,
            'node_display', n.node_display,
            'province_name', p.province_name,
            'loc', n.loc
          )
        )
      ELSE NULL
    END AS builds,
    lch.nuke_range,
    os.increase_range
  FROM order_sets os
  LEFT JOIN orders_adjustments bo ON bo.order_set_id = os.order_set_id
  LEFT JOIN nodes n ON n.node_id = bo.node_id
  LEFT JOIN provinces p ON p.province_id = n.province_id
  LEFT JOIN countries c ON c.country_id = os.country_id
  LEFT JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  WHERE os.turn_id = $3
    AND order_set_type = 'Orders'
    AND CASE WHEN 0 = $4 THEN true ELSE os.country_id = $4 END
  GROUP BY
    c.country_id,
    c.country_name,
    lch.banked_builds,
    lch.adjustments,
    lch.nuke_range,
    os.increase_range;
`;
