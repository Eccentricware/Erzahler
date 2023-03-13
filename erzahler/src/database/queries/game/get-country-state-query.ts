export const getCountryStateQuery = `
  WITH last_country_history_id AS (
    SELECT ch.country_id,
      ch.turn_id,
      MAX(t.turn_number) as turn_number
    FROM country_histories ch
    INNER JOIN turns t ON t.turn_id = ch.turn_id
    INNER JOIN games g ON g.game_id = t.game_id
    WHERE g.game_id = $1
      AND t.turn_number <= $2
    GROUP BY ch.country_id,
      ch.turn_id
  )
  SELECT c.country_id,
    c.country_name,
    ch.city_count,
    ch.unit_count,
    ch.in_retreat,
    ch.banked_builds,
    ch.nuke_range,
    ch.adjustments,
    ch.country_status,
    ch.nukes_in_production
  FROM last_country_history_id lchi
  INNER JOIN country_histories ch ON ch.country_id = lchi.country_id AND ch.turn_id = lchi.turn_id
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE c.game_id = $1
    AND CASE WHEN $3 = 0 THEN true ELSE c.country_id = $3 END
`;
