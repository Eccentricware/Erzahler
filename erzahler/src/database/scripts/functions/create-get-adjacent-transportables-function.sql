--sudo -u postgres psql < database/scripts/functions/create-get-adjacent-transportables-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_adjacent_transportables function'

CREATE OR REPLACE FUNCTION get_adjacent_transportables(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE(unit_id INTEGER, adjacent_transportables json)
AS $$

	SELECT u.unit_id,
		json_agg(CASE
			WHEN n.node_id = na.node_1_id
				THEN json_build_object('unit_id', u2.unit_id, 'unit_name', u2.unit_name)
			WHEN n.node_id = na.node_2_id
				THEN json_build_object('unit_id', u1.unit_id, 'unit_name', u1.unit_name)
		END) AS adjacent_transportables
	FROM get_last_unit_history($1, $2) luh
	INNER JOIN nodes n ON n.node_id = luh.node_id
	INNER JOIN units u ON u.unit_id = luh.unit_id
	INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
	INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
	INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
	INNER JOIN provinces p ON p.province_id = n.province_id
	INNER JOIN provinces p1 ON p1.province_id = n1.province_id
	INNER JOIN provinces p2 ON p2.province_id = n2.province_id
	INNER JOIN nodes tn1 ON tn1.province_id = p1.province_id
	INNER JOIN nodes tn2 ON tn2.province_id = p2.province_id
	INNER JOIN get_last_unit_history($1, $2) luh1 ON luh1.node_id = tn1.node_id
	INNER JOIN get_last_unit_history($1, $2) luh2 ON luh2.node_id = tn2.node_id
	INNER JOIN units u1 ON u1.unit_id = luh1.unit_id
	INNER JOIN units u2 ON u2.unit_id = luh2.unit_id
	INNER JOIN turns t ON t.turn_id = luh.turn_id
	WHERE t.game_id = $1
		AND t.turn_number <= $2
		AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
		AND ((u.unit_type = 'Fleet' AND p.province_type != 'coast') OR u.unit_type = 'Wing')
		AND CASE
			WHEN n.node_id = na.node_1_id THEN u2.unit_type IN ('Army', 'Nuke')
			WHEN n.node_id = na.node_2_id THEN u1.unit_type IN ('Army', 'Nuke')
		END
		AND luh.unit_status = 'Active'
		AND luh1.unit_status = 'Active'
		AND luh2.unit_status = 'Active'
	GROUP BY u.unit_id;

 $$ LANGUAGE SQL;