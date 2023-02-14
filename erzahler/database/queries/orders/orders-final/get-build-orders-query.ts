export const getBuildOrdersQuery = `
  SELECT
    c.country_id,
    c.country_name,
    ch.banked_builds,
    ch.adjustments builds,
    json_agg(
      json_build_object(
        'node_id', n.node_id,
        'node_name', n.node_name,
        'province_name', p.province_name,
        'loc', n.loc
      )
    ) AS build_locs,
    os.build_tuples,
    ch.nuke_range,
    os.increase_range
  FROM order_sets os
  LEFT JOIN nodes n ON n.node_id = any(os.build_locs)
  LEFT JOIN provinces p ON p.province_id = n.province_id
  LEFT JOIN countries c ON c.country_id = os.country_id
  LEFT JOIN country_histories ch ON ch.country_id = c.country_id
  --LEFT JOIN nodes nn ON nn.node_id = any(os.nuke_locs)
  --LEFT JOIN provinces np ON np.province_id = nn.province_id
  WHERE os.turn_id = $1
    AND ch.turn_id = $2
    AND order_set_type = 'Orders'
    AND CASE WHEN 0 = $3 THEN true ELSE os.country_id = $3 END
  GROUP BY
    c.country_id,
    c.country_name,
    ch.banked_builds,
    ch.adjustments,
    os.build_tuples,
    ch.nuke_range,
    os.increase_range
`;