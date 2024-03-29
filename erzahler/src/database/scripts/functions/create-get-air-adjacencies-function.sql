--sudo -u postgres psql < database/scripts/functions/create-get-air-adjacencies-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_air_adjacencies function'

CREATE OR REPLACE FUNCTION get_air_adjacencies(INTEGER) --game_id
RETURNS TABLE(node_id INTEGER, province_name VARCHAR(15), adjacencies JSON)
AS $$

  SELECT n.node_id,
    p.province_name,
    json_agg(CASE
      WHEN n.node_id = na.node_1_id
        THEN json_build_object('node_id', na.node_2_id, 'province_id', p2.province_id, 'province_name', p2.province_name)
      WHEN n.node_id = na.node_2_id
        THEN json_build_object('node_id', na.node_1_id, 'province_id', p1.province_id, 'province_name', p1.province_name)
    END) AS adjacencies
  FROM nodes n
  INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
  INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
  INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN provinces p1 ON p1.province_id = n1.province_id
  INNER JOIN provinces p2 ON p2.province_id = n2.province_id
  INNER JOIN games g ON g.game_id = p1.game_id
  WHERE g.game_id = $1
    AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
    AND n.node_type = 'air'
  GROUP BY n.node_id,
    p.province_name
  ORDER BY p.province_name;

$$ LANGUAGE SQL;