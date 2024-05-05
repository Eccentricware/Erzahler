export const getHistoricTurnQuery = `
  SELECT t.game_id,
    t.turn_id,
    g.game_name,
    t.turn_name,
    t.turn_number,
    t.turn_type,
    t.turn_status,
    t.year_number,
    0 as year_stylized,
    t.deadline,
    json_agg(json_build_object(
      'country_id', c.country_id,
      'country_name', c.country_name,
      'rank', c.rank,
      'username', u.username,
      'city_count_start', lchs.city_count,
      'city_count_result', lchr.city_count,
      'unit_count_start', lchs.unit_count,
      'unit_count_result', lchr.unit_count,
      'vote_count_start', lchs.vote_count,
      'vote_count_result', lchr.vote_count,
      'banked_builds_start', lchs.banked_builds,
      'banked_builds_result', lchr.banked_builds,
      'nuke_range_start', lchs.nuke_range,
      'nuke_range_result', lchr.nuke_range,
      'adjustments_start', lchs.adjustments,
      'adjustments_result', lchr.adjustments,
      'tech_partner_id', os.tech_partner_id,
      'tech_partner_name', tpc.country_name,
      'vote_orders', os.votes,
      'increase_range_orders', os.increase_range
    )) as historic_countries
  FROM turns t
  INNER JOIN games g ON g.game_id = t.game_id
  INNER JOIN countries c ON c.game_id = g.game_id
  INNER JOIN get_last_country_history($1, $2) lchr ON lchr.country_id = c.country_id
  INNER JOIN get_last_country_history($1, $3) lchs ON lchs.country_id = c.country_id
  LEFT JOIN order_sets os ON os.turn_id = t.turn_id AND os.country_id = c.country_id
  LEFT JOIN countries tpc ON tpc.country_id = os.tech_partner_id
  LEFT JOIN assignments a ON a.country_id = c.country_id AND (
    a.assignment_start <= t.deadline
    AND (a.assignment_end IS NULL OR a.assignment_end >= t.deadline)
  )
  LEFT JOIN users u ON u.user_id = a.user_id
  WHERE t.game_id = $1
    AND t.turn_number = $2
    AND t.turn_status IN ('Resolved', 'Final')
    AND c.rank != 'n'
  GROUP BY t.game_id,
    t.turn_id,
    g.game_name,
    t.turn_name,
    t.turn_number,
    t.turn_type,
    t.turn_status,
    t.year_number,
    t.deadline;
`;
