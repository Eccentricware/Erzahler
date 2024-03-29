--sudo -u postgres psql < database/scripts/functions/create-get-adjacent-units-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_adjacent_units function'

CREATE OR REPLACE FUNCTION get_adjacent_units(INTEGER) --turn_id
RETURNS TABLE(unit_id INTEGER, adjacent_units json, adjacent_transports json)
AS $$
	SELECT u.unit_id,
  	json_agg(CASE
			WHEN n.node_id = na.node_1_id
				THEN json_build_object('unit_id', u2.unit_id, 'unit_name', u2.unit_name)
			WHEN n.node_id = na.node_2_id
				THEN json_build_object('unit_id', u1.unit_id, 'unit_name', u1.unit_name)
		END) AS adjacent_units,
		json_agg(CASE
			WHEN n.node_id = na.node_1_id
			AND ((u2.unit_type = 'Fleet' AND p2.province_type != 'coast') OR u2.unit_type = 'Wing')
				THEN json_build_object('unit_id', u2.unit_id, 'unit_name', u2.unit_name)
			WHEN n.node_id = na.node_2_id
			AND ((u1.unit_type = 'Fleet' AND p1.province_type != 'coast') OR u1.unit_type = 'Wing')
				THEN json_build_object('unit_id', u1.unit_id, 'unit_name', u1.unit_name)
		END) AS adjacent_transports
	FROM nodes n
	INNER JOIN unit_histories uh ON uh.node_id = n.node_id
	INNER JOIN units u ON u.unit_id = uh.unit_id
	INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
	INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
	INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
	INNER JOIN provinces p ON p.province_id = n.province_id
	INNER JOIN provinces p1 ON p1.province_id = n1.province_id
	INNER JOIN provinces p2 ON p2.province_id = n2.province_id
	INNER JOIN nodes tn1 ON tn1.province_id = p1.province_id
	INNER JOIN nodes tn2 ON tn2.province_id = p2.province_id
	INNER JOIN unit_histories uh1 ON uh1.node_id = tn1.node_id
	INNER JOIN unit_histories uh2 ON uh2.node_id = tn2.node_id
	INNER JOIN units u1 ON u1.unit_id = uh1.unit_id
	INNER JOIN units u2 ON u2.unit_id = uh2.unit_id
	INNER JOIN turns t ON t.turn_id = uh.turn_id
	WHERE t.turn_id = $1
		AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
	GROUP BY u.unit_id;
 $$ LANGUAGE SQL;