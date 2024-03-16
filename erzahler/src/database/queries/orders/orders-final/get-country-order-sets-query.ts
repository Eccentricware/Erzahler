export const getCountryOrderSets = `
  SELECT
    lch.in_retreat,
    t.turn_type,
    t.turn_status,
    os.order_set_id,
    lch.adjustments
  FROM get_last_country_history($1, $2) lch
  INNER JOIN countries c ON c.country_id = lch.country_id
  INNER JOIN order_sets os ON os.country_id = c.country_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE CASE WHEN $3 = 0 THEN true ELSE c.country_id = $3 END
    AND t.turn_status IN ('Pending', 'Preliminary')
  ORDER BY lch.turn_id DESC;
`;
