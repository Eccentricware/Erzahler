export const getOrderOptionsQuery = `
  SELECT oo.unit_id,
    u.unit_type,
    p.province_name,
    CASE
      WHEN t.turn_type in ('Fall Orders', 'Fall Retreats')
        AND u.unit_type = 'Fleet'
        AND p.province_type = 'pole'
      THEN false
      ELSE true
    END as can_hold,
    oo.order_type,
    oo.secondary_unit_id,
    su.unit_type,
    sup.province_name,
    oo.secondary_order_type,
    json_agg(CASE WHEN dn.node_id IS NOT NULL
      THEN
      json_build_object(
        'node_id', dn.node_id,
        'node_name', dn.node_name,
        'province_id', dn.province_id,
        'destination_loc', en.loc,
        'en_id', en.node_id,
        'en_name', en.node_name
      ) ELSE null END
    ) AS destinations
  FROM order_options oo
  INNER JOIN units u ON u.unit_id = oo.unit_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN turns t ON t.turn_id = uh.turn_id
  LEFT JOIN units su ON su.unit_id = oo.secondary_unit_id
  LEFT JOIN unit_histories suh ON suh.unit_id = oo.secondary_unit_id
  LEFT JOIN nodes sun ON sun.node_id = suh.node_id
  LEFT JOIN provinces sup ON sup.province_id = sun.province_id
  LEFT JOIN nodes dn ON dn.node_id = any(oo.destinations)
  LEFT JOIN provinces pn ON pn.province_id = dn.province_id
  LEFT JOIN nodes en ON en.province_id = p.province_id AND en.node_type = 'event'
  WHERE t.turn_id = 59
    AND CASE WHEN false = true
      THEN u.country_id = 2 ELSE true END
  GROUP BY oo.unit_id,
    u.unit_type,
    p.province_name,
    oo.order_type,
    oo.secondary_unit_id,
    oo.secondary_order_type,
    su.unit_type,
    sup.province_name,
    t.turn_type,
    p.province_type
  ORDER BY u.unit_type,
    p.province_name,
    oo.order_type,
    su.unit_type
`;