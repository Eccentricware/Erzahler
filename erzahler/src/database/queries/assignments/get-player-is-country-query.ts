export const getPlayerIsCountryQuery = `
  WITH pending_order_set AS (
    SELECT os.order_set_id,
      os.turn_id,
      os.country_id
    FROM order_sets os
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.turn_status = 'Pending'
      AND game_id = $1
      AND os.country_id = $3
  ), preliminary_order_set AS (
    SELECT os.order_set_id,
      os.turn_id,
      os.country_id
    FROM order_sets os
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.turn_status = 'Preliminary'
      AND game_id = $1
      AND os.country_id = $3
  )
  SELECT
    pe_os.order_set_id AS pending_order_set_id,
    pr_os.order_set_id AS preliminary_order_set_id
  FROM assignments a
  INNER JOIN games g ON a.game_id = g.game_id
  INNER JOIN turns t ON g.game_id = t.game_id
  LEFT JOIN pending_order_set pe_os ON pe_os.country_id = a.country_id
  LEFT JOIN preliminary_order_set pr_os ON pr_os.country_id = a.country_id
  WHERE a.game_id = $1
    AND a.user_id = $2
    AND a.country_id = $3
    AND a.assignment_type = 'Player'
    AND a.assignment_end IS NULL
  GROUP BY pe_os.order_set_id,
    pr_os.order_set_id;
`;
