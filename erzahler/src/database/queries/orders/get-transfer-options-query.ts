export const getTransferOptionsQuery = `
  WITH can_give_tech AS (
    SELECT
      g.game_id,
      json_agg(json_build_object('country_id', c.country_id, 'country_name', c.country_name)) as give_tech
    FROM games g
    INNER JOIN turns t ON t.game_id = g.game_id
    INNER JOIN get_last_country_history($1, $2) lch ON lch.turn_id = t.turn_id
    INNER JOIN countries c ON c.country_id = lch.country_id
    WHERE g.game_id = $1
      AND t.turn_number <= $2
      AND lch.country_status IN ('Active', 'Civil Disorder')
      AND lch.nuke_range IS NULL
    GROUP BY g.game_id
  ),
  can_receive_tech AS (
    SELECT
      g.game_id,
      json_agg(json_build_object('country_id', c.country_id, 'country_name', c.country_name)) as receive_tech
    FROM games g
    INNER JOIN turns t ON t.game_id = g.game_id
    INNER JOIN get_last_country_history($1, $2) lch ON lch.turn_id = t.turn_id
    INNER JOIN countries c ON c.country_id = lch.country_id
    WHERE g.game_id = $1
      AND t.turn_number <= $2
      AND lch.country_status IN ('Active', 'Civil Disorder')
      AND lch.nuke_range IS NOT NULL
    GROUP BY g.game_id
  ),
  can_receive_builds AS (
    SELECT
      g.game_id,
      json_agg(json_build_object('country_id', c.country_id, 'country_name', c.country_name)) as receive_builds
    FROM games g
    INNER JOIN turns t ON t.game_id = g.game_id
    INNER JOIN get_last_country_history($1, $2) lch ON lch.turn_id = t.turn_id
    INNER JOIN countries c ON c.country_id = lch.country_id
    WHERE g.game_id = $1
      AND t.turn_number <= $2
      AND lch.country_status IN ('Active', 'Civil Disorder')
    GROUP BY g.game_id
  )
  SELECT
    g.game_id,
    gt.give_tech,
    rt.receive_tech,
    rb.receive_builds
  FROM games g
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN get_last_country_history($1, $2) lch ON lch.turn_id = t.turn_id
  INNER JOIN countries c ON c.country_id = lch.country_id
  INNER JOIN can_give_tech gt ON gt.game_id = g.game_id
  INNER JOIN can_receive_tech rt ON rt.game_id = g.game_id
  INNER JOIN can_receive_builds rb ON rb.game_id = g.game_id
  WHERE g.game_id = $1
    AND t.turn_number <= $2
    AND lch.country_status IN ('Active', 'Civil Disorder')
  LIMIT 1;
`;
