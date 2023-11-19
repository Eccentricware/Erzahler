--sudo -u postgres psql < database/scripts/functions/create-get-transport_destinations-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_transport_destinations function'

CREATE OR REPLACE FUNCTION get_transport_destinations(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE(unit_id INTEGER, transport_destinations json)
AS $$

	SELECT u.unit_id,
		json_agg(CASE
			WHEN n.node_id = na.node_1_id
				THEN json_build_object('node_id', nd2.node_id, 'node_name', nd2.node_name, 'province_id', p2.province_id)
			WHEN n.node_id = na.node_2_id
				THEN json_build_object('node_id', nd1.node_id, 'node_name', nd1.node_name, 'province_id', p1.province_id)
		END) AS transport_destinations
	FROM nodes n
	INNER JOIN unit_histories uh ON uh.node_id = n.node_id
	INNER JOIN get_last_unit_history($1, $2) luh
		ON luh.unit_id = uh.unit_id AND luh.turn_id = uh.turn_id
	INNER JOIN units u ON u.unit_id = uh.unit_id
	INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
	INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
	INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
	INNER JOIN provinces p ON p.province_id = n.province_id
	INNER JOIN provinces p1 ON p1.province_id = n1.province_id
	INNER JOIN provinces p2 ON p2.province_id = n2.province_id
	INNER JOIN nodes nd1 ON nd1.province_id = p1.province_id AND nd1.node_type = 'land'
	INNER JOIN nodes nd2 ON nd2.province_id = p2.province_id AND nd2.node_type = 'land'
	INNER JOIN turns t ON t.turn_id = uh.turn_id
	WHERE t.game_id = $1
		AND t.turn_number <= $2
		AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
		AND ((u.unit_type = 'Fleet' AND p.province_type != 'coast') OR u.unit_type = 'Wing')
		AND CASE
			WHEN n.node_id = na.node_1_id
				THEN p2.province_type IN ('inland', 'island', 'coast')
			WHEN n.node_id = na.node_2_id
				THEN p1.province_type IN ('inland', 'island', 'coast')
		END
		AND uh.unit_status = 'Active'
	GROUP BY u.unit_id;

 $$ LANGUAGE SQL;