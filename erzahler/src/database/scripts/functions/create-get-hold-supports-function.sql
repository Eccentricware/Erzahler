--sudo -u postgres psql < database/scripts/functions/create-get-hold-supports-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_hold_supports function'

CREATE OR REPLACE FUNCTION get_hold_supports(
	INTEGER,  --game_id
	INTEGER   --turn_number
)
RETURNS TABLE(unit_id INTEGER, hold_supports json)
AS $$

  SELECT u.unit_id,
  	json_agg(CASE
			WHEN n.node_id = na.node_1_id
				THEN json_build_object(
					'unit_id', u2.unit_id,
					'unit_name', u2.unit_name,
					'province_id', p2.province_id
				)
			WHEN n.node_id = na.node_2_id
				THEN json_build_object(
					'unit_id', u1.unit_id,
					'unit_name', u1.unit_name,
					'province_id', p1.province_id
				)
		END) AS hold_supports
	FROM unit_histories uh
	INNER JOIN get_last_unit_history($1, $2) luh
		ON uh.unit_id = luh.unit_id AND uh.turn_id = luh.turn_id
	INNER JOIN units u ON u.unit_id = uh.unit_id
	INNER JOIN nodes n ON n.node_id = uh.node_id
	INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
	INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
	INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
	INNER JOIN provinces p ON p.province_id = n.province_id
	INNER JOIN provinces p1 ON p1.province_id = n1.province_id
	INNER JOIN provinces p2 ON p2.province_id = n2.province_id
	INNER JOIN nodes tn1 ON tn1.province_id = p1.province_id
	INNER JOIN nodes tn2 ON tn2.province_id = p2.province_id
	INNER JOIN unit_histories uh1 ON uh1.node_id = tn1.node_id
	INNER JOIN get_last_unit_history($1, $2) luh1 ON luh1.unit_id = uh1.unit_id AND luh1.turn_id = uh1.turn_id
	INNER JOIN unit_histories uh2 ON uh2.node_id = tn2.node_id
	INNER JOIN get_last_unit_history($1, $2) luh2 ON luh2.unit_id = uh2.unit_id AND luh2.turn_id = uh2.turn_id
	INNER JOIN units u1 ON u1.unit_id = uh1.unit_id
	INNER JOIN units u2 ON u2.unit_id = uh2.unit_id
	INNER JOIN turns t ON t.turn_id = uh.turn_id
	WHERE t.game_id = $1
		AND t.turn_number <= $2
		AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
		AND CASE
			WHEN n.node_id = na.node_1_id THEN u2.unit_type != 'Nuke'
			WHEN n.node_id = na.node_2_id THEN u1.unit_type != 'Nuke'
		END
		AND uh.unit_status = 'Active'
		AND uh1.unit_status = 'Active'
		AND uh2.unit_status = 'Active'
	GROUP BY u.unit_id;

$$ LANGUAGE SQL;