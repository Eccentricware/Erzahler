export const getPlayerIsCountryQuery = `
  SELECT CASE WHEN COUNT(*) = 1 THEN true ELSE false END assigned,
    pe_os.order_set_id AS pending_order_set_id,
    pr_os.order_set_id AS preliminary_order_set_id
  FROM assignments a
  INNER JOIN games g ON a.game_id = g.game_id
  INNER JOIN turns t ON g.game_id = t.game_id
  LEFT JOIN order_sets pe_os ON pe_os.country_id = a.country_id AND pe_os.turn_id = t.turn_id AND t.turn_status = 'Pending'
  LEFT JOIN order_sets pr_os ON pr_os.country_id = a.country_id AND pr_os.turn_id = t.turn_id AND t.turn_status = 'Preliminary'
  WHERE a.game_id = $1
    AND a.user_id = $2
    AND a.country_id = $3
    AND a.assignment_type = 'Player'
    AND a.assignment_end IS NULL
  GROUP BY pe_os.order_set_id,
    pr_os.order_set_id;
`;
