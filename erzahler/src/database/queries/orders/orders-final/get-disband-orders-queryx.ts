export const getDisbandOrdersQueryx = `
  SELECT
    c.country_id,
    c.country_name,
    lch.banked_builds,
    lch.adjustments disbands,
    json_agg(
      CASE WHEN n.node_id = any(os.nuke_locs)
        THEN
          json_build_object(
            'node_id', n.node_id,
            'node_name', n.node_name,
            'province_name', p.province_name,
            'loc', n.loc
          )
        ELSE
          json_build_object(
            'node_id', 0,
            'node_name', '---',
            'province_name', '---',
            'loc', ARRAY[0, 0]
          )
    END
    ) AS nuke_loc_details,
    os.nuke_locs,
    lch.nuke_range,
    os.increase_range,
    os.units_disbanding
  FROM order_sets os
  LEFT JOIN nodes n ON n.node_id = any(os.nuke_locs)
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
    os.nuke_locs,
    os.increase_range,
    os.units_disbanding;
`;
