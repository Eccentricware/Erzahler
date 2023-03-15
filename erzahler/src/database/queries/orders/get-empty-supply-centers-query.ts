export const getEmptySupplyCentersQuery = `
  WITH last_province_history_id AS (
    SELECT ph.province_id,
      ph.turn_id,
      MAX(t.turn_number) AS turn_number
    FROM province_histories ph
    INNER JOIN turns t ON t.turn_id = ph.turn_id
    WHERE t.turn_number <= $1
    GROUP BY ph.province_id,
      ph.turn_id
  )
  SELECT
      c.country_id,
      c.country_name,
      p.province_name,
      ln.node_id AS land_node_id,
      ln.loc AS land_node_loc,
      sn.node_id AS sea_node_id,
      sn.loc AS sea_node_loc,
      sn.node_name as sea_node_name,
      an.node_id AS air_node_id,
      an.loc AS air_node_loc
  FROM last_province_history_id lphi
  INNER JOIN provinces p ON p.province_id = lphi.province_id
    INNER JOIN province_histories ph ON ph.province_id = lphi.province_id AND ph.turn_id = lphi.turn_id
    INNER JOIN countries c ON c.country_id = ph.controller_id
    INNER JOIN country_histories ch ON ch.country_id = c.country_id
    LEFT JOIN nodes ln ON ln.province_id = p.province_id AND ln.node_type = 'land'
    LEFT JOIN nodes sn ON sn.province_id = p.province_id AND sn.node_type = 'sea'
    LEFT JOIN nodes an ON an.province_id = p.province_id AND an.node_type = 'air'
    LEFT JOIN unit_histories uh ON uh.node_id IN (ln.node_id, sn.node_id, an.node_id)
    WHERE p.game_id = $2
      AND ph.province_status = 'active'
      AND uh.unit_id IS NULL
      AND CASE WHEN $3 != 0 THEN c.country_id = $3 END
    ORDER BY
      c.country_name,
      p.province_name
`;
