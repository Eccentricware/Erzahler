--sudo -u postgres psql < database/scripts/create-get-transport_destinations-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_transport_destinations funnction'

CREATE OR REPLACE FUNCTION get_transport_destinations(INTEGER) --turn_id
RETURNS TABLE(unit_id INTEGER, transport_destinations json)
AS $$
  SELECT u.unit_id,
		json_agg(CASE
			WHEN n.node_id = na.node_1_id
				THEN json_build_object('province_id', p2.province_id, 'province_name', p2.province_name)
			WHEN n.node_id = na.node_2_id
				THEN json_build_object('province_id', p1.province_id, 'province_name', p1.province_name)
		END) AS transport_destinations
	FROM nodes n
	INNER JOIN unit_histories uh ON uh.node_id = n.node_id
	INNER JOIN units u ON u.unit_id = uh.unit_id
	INNER JOIN node_adjacencies na ON na.node_1_id = n.node_id OR na.node_2_id = n.node_id
	INNER JOIN nodes n1 ON n1.node_id = na.node_1_id
	INNER JOIN nodes n2 ON n2.node_id = na.node_2_id
	INNER JOIN provinces p ON p.province_id = n.province_id
	INNER JOIN provinces p1 ON p1.province_id = n1.province_id
	INNER JOIN provinces p2 ON p2.province_id = n2.province_id
	INNER JOIN turns t ON t.turn_id = uh.turn_id
	WHERE t.turn_id = $1
		AND (na.node_1_id = n.node_id OR na.node_2_id = n.node_id)
		AND ((u.unit_type = 'fleet' AND p.province_type != 'coast') OR u.unit_type = 'wing')
		AND CASE
			WHEN n.node_id = na.node_1_id
				THEN p2.province_type IN ('inland', 'island', 'coast')
			WHEN n.node_id = na.node_2_id
				THEN p1.province_type IN ('inland', 'island', 'coast')
		END
	GROUP BY u.unit_id;
 $$ LANGUAGE SQL;