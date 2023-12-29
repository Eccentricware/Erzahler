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
		json_agg(
			json_build_object('node_id', dn.node_id, 'node_name', dn.node_name, 'province_id', dp.province_id)
		) AS transport_destinations
	FROM units u
	INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
	INNER JOIN nodes un ON un.node_id = luh.node_id
	INNER JOIN provinces up ON up.province_id = un.province_id
	INNER JOIN node_adjacencies na
		ON na.node_1_id = un.node_id OR na.node_2_id = un.node_id
	INNER JOIN nodes an
		ON (an.node_id = na.node_1_id AND un.node_id = na.node_2_id)
			OR (an.node_id = na.node_2_id AND un.node_id = na.node_1_id)
	INNER JOIN provinces dp ON dp.province_id = an.province_id
	INNER JOIN nodes dn ON dn.province_id = dp.province_id AND dn.node_type = 'land'
	INNER JOIN games g ON g.game_id = dp.game_id
	WHERE g.game_id = $1
		AND luh.unit_status = 'Active'
		AND ((u.unit_type = 'Fleet' AND up.province_type != 'coast') OR u.unit_type = 'Wing')
	GROUP BY u.unit_id;

 $$ LANGUAGE SQL;