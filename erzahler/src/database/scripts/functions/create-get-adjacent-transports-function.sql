--sudo -u postgres psql < database/scripts/functions/create-get-adjacent-transports-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_adjacent_transports function'

CREATE OR REPLACE FUNCTION get_adjacent_transports(
	INTEGER,  --game_id
	INTEGER   --turn_number
)
RETURNS TABLE(unit_id INTEGER, adjacent_transports json)
AS $$

	SELECT u.unit_id,
		json_agg(
			json_build_object('unit_id', ltuh.unit_id, 'unit_name', tu.unit_name)
		) AS adjacent_transports
	FROM units u
	INNER JOIN get_last_unit_history($1, $2) luh ON luh.unit_id = u.unit_id
	INNER JOIN nodes un ON un.node_id = luh.node_id
	INNER JOIN provinces up ON up.province_id = un.province_id
	INNER JOIN games g ON g.game_id = up.game_id
	INNER JOIN nodes oan
		ON oan.province_id = up.province_id AND oan.node_type = 'air'
	INNER JOIN node_adjacencies na
		ON na.node_1_id = oan.node_id OR na.node_2_id = oan.node_id
	INNER JOIN nodes aan
		ON (aan.node_id = na.node_1_id AND oan.node_id = na.node_2_id)
			OR (aan.node_id = na.node_2_id AND oan.node_id = na.node_1_id)
	INNER JOIN provinces ap ON ap.province_id = aan.province_id
	INNER JOIN nodes tn
		ON tn.province_id = ap.province_id
			AND (tn.node_type = 'air'
				OR (tn.node_type = 'sea' AND ap.province_type != 'coast'))
	INNER JOIN get_last_unit_history($1, $2) ltuh ON ltuh.node_id = tn.node_id
	INNER JOIN units tu ON tu.unit_id = ltuh.unit_id
	WHERE g.game_id = $1
		AND luh.unit_status = 'Active'
		AND ltuh.unit_status = 'Active'
	GROUP BY u.unit_id;

$$ LANGUAGE SQL;