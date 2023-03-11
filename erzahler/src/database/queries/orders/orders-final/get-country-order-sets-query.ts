export const getCountryOrderSets = `
  SELECT
    ch.in_retreat,
    t.turn_type,
    t.turn_status,
    os.order_set_id,
    ch.adjustments
  FROM country_histories ch
  INNER JOIN countries c ON c.country_id = ch.country_id
  INNER JOIN order_sets os ON os.country_id = c.country_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE c.game_id = $1
    AND ch.turn_id = $2
    AND c.country_id = $3
    AND t.turn_status IN ('Pending', 'Preliminary')
  ORDER BY ch.turn_id DESC;
`;
