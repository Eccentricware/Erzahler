export const getCountryStateQuery = `
  SELECT c.country_id,
    c.country_name,
    ch.city_count,
    ch.unit_count,
    ch.in_retreat,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments,
    ch.country_status,
    ch.nukes_in_production,
    os1.order_set_id AS pending_order_set_id,
    os2.order_set_id AS preliminary_order_set_id
  FROM get_last_country_history($1, $2) lch
  INNER JOIN country_histories ch ON ch.country_id = lch.country_id AND ch.turn_id = lch.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  LEFT JOIN order_sets os1 ON os1.country_id = c.country_id
  LEFT JOIN turns pt1 ON pt1.turn_id = os1.turn_id AND pt1.turn_status = 'Pending'
  LEFT JOIN order_sets os2 ON os2.country_id = c.country_id
  LEFT JOIN turns pt2 ON pt2.turn_id = os2.turn_id AND pt2.turn_status = 'Preliminary'
  WHERE CASE WHEN $3 = 0 THEN true ELSE c.country_id = $3 END;
`;
