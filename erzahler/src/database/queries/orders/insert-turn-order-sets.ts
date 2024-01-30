/**
 * $1 = turn_id,
 * $2 = game_id,
 * $3 = turn_number,
 * $4 = turn_type
 */
export const insertTurnOrderSetsQuery = `
  INSERT INTO order_sets (
    country_id,
    turn_id,
    submission_time,
    order_set_type,
    increase_range
  )
  SELECT c.country_id,
    $1,
    NOW() AT TIME ZONE 'utc',
    'Orders',
    0
  FROM countries c
  INNER JOIN country_histories ch ON ch.country_id = c.country_id
  INNER JOIN get_last_country_history($2, $3) lch
    ON lch.country_id = ch.country_id AND lch.turn_id = ch.turn_id
  WHERE ch.country_status IN ('Active', 'Civil Disorder')
    AND ch.in_retreat = CASE
      WHEN $4 IN ('Spring Retreats', 'Fall Retreats') THEN true
      ELSE false
    END
  RETURNING order_set_id,
    country_id;
`;
