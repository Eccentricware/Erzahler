"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderOptionsQuery = void 0;
exports.getOrderOptionsQuery = `
  SELECT oo.unit_id,
    u.unit_type,
    u.country_id unit_country_id,
    c.country_name unit_country_name,
    c.rank unit_country_rank,
    c.flag_key unit_country_flag_key,
    p.province_name,
    n.node_id,
    n.loc unit_loc,
    CASE
      WHEN t.turn_type in ('Fall Orders', 'Fall Retreats')
        AND u.unit_type = 'Fleet'
        AND p.province_type = 'pole'
      THEN false
      WHEN uh.unit_status = 'Retreat' THEN false
      ELSE true
    END as can_hold,
    oo.order_type,
    oo.secondary_unit_id,
    su.unit_type secondary_unit_type,
    sc.country_name secondary_unit_country_name,
    sc.flag_key secondary_unit_flag_key,
    sup.province_name secondary_province_name,
    sun.loc secondary_unit_loc,
    oo.secondary_order_type,
    json_agg(CASE WHEN dn.node_id IS NOT NULL
      THEN
      json_build_object(
        'node_id', dn.node_id,
        'node_name', dn.node_name,
        'loc', en.loc
      ) ELSE null END
    ) AS destinations
  FROM order_options oo
  INNER JOIN units u ON u.unit_id = oo.unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  INNER JOIN unit_histories uh ON uh.unit_id = u.unit_id
  INNER JOIN nodes n ON n.node_id = uh.node_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN turns t ON t.turn_id = uh.turn_id
  LEFT JOIN units su ON su.unit_id = oo.secondary_unit_id
  LEFT JOIN countries sc ON sc.country_id = su.country_id
  LEFT JOIN unit_histories suh ON suh.unit_id = oo.secondary_unit_id
  LEFT JOIN nodes sun ON sun.node_id = suh.node_id
  LEFT JOIN provinces sup ON sup.province_id = sun.province_id
  LEFT JOIN nodes dn ON dn.node_id = any(oo.destinations)
  LEFT JOIN provinces pn ON pn.province_id = dn.province_id
  LEFT JOIN nodes en ON en.province_id = pn.province_id AND en.node_type = 'event'
  WHERE t.turn_id = $1
    AND oo.turn_id = $2
    AND CASE
      WHEN 0 != $3 THEN u.country_id = $3
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
    oo.secondary_unit_id,
    sc.country_name,
    sc.flag_key,
    oo.secondary_order_type,
    su.unit_type,
    sup.province_name,
    sun.loc,
    t.turn_type,
    p.province_type
  ORDER BY c.rank,
    c.country_name,
    p.province_name,
    sup.province_name

`;
//# sourceMappingURL=get-order-options-query.js.map