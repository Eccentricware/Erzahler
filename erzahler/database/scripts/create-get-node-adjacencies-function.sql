--sudo -u postgres psql < database/scripts/create-get-node-adjacencies-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_node_adjacencies funnction'

CREATE OR REPLACE FUNCTION get_node_adjacencies(
  INTEGER, -- game_id
  INTEGER  -- turn_id
)
RETURNS TABLE(node_id INTEGER, adjacencies JSON)
AS $$
  SELECT n.node_id,
    json_agg(CASE
      WHEN n.node_id = na.node_1_id
        THEN json_build_object('node_id', na.node_2_id, 'province_id', p2.province_id, 'province_name', p2.province_name)
      WHEN n.node_id = na.node_2_id
        THEN json_build_object('node_id', na.node_1_id, 'province_id', p1.province_id, 'province_name', p1.province_name)
    END) AS adjacencies
  FROM nodes n
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  INNER JOIN turns t ON t.game_id = g.game_id
  INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
  INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
  INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
  LEFT JOIN provinces p1 ON p1.province_id = n1.province_id
    AND CASE
      WHEN t.turn_type IN ('Spring Retreats', 'Fall Orders')
        AND n.node_id = na.node_2_id
        AND n2.node_type = 'sea'
      THEN p1.province_type != 'pole'
      ELSE true
    END
  LEFT JOIN provinces p2 ON p2.province_id = n2.province_id
    AND CASE
      WHEN t.turn_type IN ('Spring Retreats', 'Fall Orders')
        AND n.node_id = na.node_1_id
        AND n1.node_type = 'sea'
      THEN p2.province_type != 'pole'
      ELSE true
    END
  INNER JOIN province_histories ph1 ON ph1.province_id = p1.province_id AND ph1.valid_retreat = true
  INNER JOIN province_histories ph2 ON ph2.province_id = p2.province_id AND ph2.valid_retreat = true
  WHERE g.game_id = $1
    AND t.turn_id = $2
    AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
  GROUP BY n.node_id;
$$ LANGUAGE SQL;