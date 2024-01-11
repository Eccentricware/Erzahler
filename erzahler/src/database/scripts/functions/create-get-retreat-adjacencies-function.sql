--sudo -u postgres psql < database/scripts/functions/create-get-hold-supports-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_hold_supports function'

CREATE OR REPLACE FUNCTION get_retreat_adjacencies(
	INTEGER,  --game_id
	INTEGER   --turn_number
)
RETURNS TABLE(node_id INTEGER, adjacencies json)
AS $$

  SELECT n.node_id,
    json_agg(CASE
      WHEN n.node_id = na.node_1_id
        THEN json_build_object(
          'node_id', na.node_2_id,
          'province_id', p2.province_id,
          'province_name', p2.province_name,
          'province_type', p2.province_type
        )
      WHEN n.node_id = na.node_2_id
        THEN json_build_object(
          'node_id', na.node_1_id,
          'province_id', p1.province_id,
          'province_name', p1.province_name,
          'province_type', p1.province_type
        )
    END) AS adjacencies
  FROM nodes n
  INNER JOIN provinces p ON p.province_id = n.province_id
  INNER JOIN games g ON g.game_id = p.game_id
  INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
  INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
  INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
  INNER JOIN provinces p1 ON p1.province_id = n1.province_id
  INNER JOIN provinces p2 ON p2.province_id = n2.province_id
  INNER JOIN get_last_province_history($1, $2) lph1 ON lph1.province_id = p1.province_id
  INNER JOIN get_last_province_history($1, $2) lph2 ON lph2.province_id = p2.province_id
  WHERE g.game_id = $1
    AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
	AND CASE
		WHEN n.node_id = na.node_1_id
			THEN lph2.valid_retreat = true
		WHEN n.node_id = na.node_2_id
			THEN lph1.valid_retreat = true
	END
  GROUP BY n.node_id;

$$ LANGUAGE SQL;