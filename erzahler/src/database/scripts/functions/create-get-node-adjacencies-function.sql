--sudo -u postgres psql < database/scripts/functions/create-get-node-adjacencies-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_node_adjacencies function'

CREATE OR REPLACE FUNCTION get_node_adjacencies(
  INTEGER -- game_id
)
RETURNS TABLE(node_id INTEGER, adjacencies JSON)
AS $$

  SELECT n.node_id,
    json_agg(
		json_build_object(
          'node_id', an.node_id,
          'province_id', ap.province_id,
          'province_name', ap.province_name,
          'province_type', ap.province_type
        )
	) AS adjacencies
  FROM nodes n
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
  INNER JOIN nodes an ON (n.node_id = na.node_1_id AND an.node_id = na.node_2_id)
  	OR (n.node_id = na.node_2_id AND an.node_id = na.node_1_id)
  INNER JOIN provinces ap ON ap.province_id = an.province_id
  WHERE p.game_id = $1
  GROUP BY n.node_id;

$$ LANGUAGE SQL;