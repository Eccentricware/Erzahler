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
      'countryId', c.country_id,
      'countryName', c.country_name,
      'rank', c.rank,
      'cityCount', lch.city_count,
      'voteCount', lch.vote_count,
      'bankedBuilds', lch.banked_builds,
      'nukeRange', lch.nuke_range,
      'adjustments', lch.adjustments,
      'techPartnerName', tpc.country_name,
      'votes', os.votes,
      'increaseRange', os.increase_range
    )) as surviving_countries
  FROM turns t
  INNER JOIN games g ON g.game_id = t.game_id
  INNER JOIN countries c ON c.game_id = g.game_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.country_id = c.country_id
  LEFT JOIN order_sets os ON os.turn_id = t.turn_id AND os.country_id = c.country_id
  LEFT JOIN countries tpc ON tpc.country_id = os.tech_partner_id
  WHERE t.game_id = $1
    AND t.turn_number = $2
    AND t.turn_status IN ('Resolved', 'Final')
    AND lch.country_status IN ('Active', 'Civil Disorder')
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