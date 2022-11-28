--sudo -u postgres psql < database/scripts/create-get-node-adjacencies-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_node_adjacencies funnction'

CREATE OR REPLACE FUNCTION get_node_adjacencies(INTEGER, BOOLEAN) --game_id, air_nodes_only
RETURNS TABLE(node_id INTEGER, adjacencies JSON)
AS $$
  SELECT n.node_id,
    json_agg(CASE
      WHEN n.node_id = na.node_1_id
        THEN json_build_object('node_id', na.node_2_id, 'province_id', p2.province_id)
      WHEN n.node_id = na.node_2_id
        THEN json_build_object('node_id', na.node_1_id, 'province_id', p1.province_id)
    END) AS adjacencies
  FROM nodes n
  INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
  INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
  INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
  INNER JOIN provinces p1 ON p1.province_id = n1.province_id
  INNER JOIN provinces p2 ON p2.province_id = n2.province_id
  INNER JOIN games g ON g.game_id = p1.game_id
  WHERE g.game_id = $1
    AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
    AND CASE WHEN $2 = true THEN n.node_type = 'air' ELSE true END
  GROUP BY n.node_id;
$$ LANGUAGE SQL;