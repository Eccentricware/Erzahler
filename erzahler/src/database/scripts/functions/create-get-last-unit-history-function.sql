--sudo -u postgres psql < database/scripts/functions/create-get-last-unit-history-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_last_unit_history function'

CREATE OR REPLACE FUNCTION get_last_unit_history(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE(
	unit_history_id INTEGER,
	unit_id INTEGER,
	turn_id INTEGER,
	node_id INTEGER,
	unit_status VARCHAR(23),
	displacer_province_id INTEGER
)
AS $$

	WITH last_unit_turn_id AS (
		SELECT uh.unit_id,
			MAX(t.turn_number) AS turn_number
		FROM unit_histories uh
		INNER JOIN turns t ON t.turn_id = uh.turn_id
		WHERE t.game_id = $1
			AND t.turn_number <= $2
		GROUP BY uh.unit_id
	)
	SELECT uh.unit_history_id,
		uh.unit_id,
		uh.turn_id,
		uh.node_id,
		uh.unit_status,
		uh.displacer_province_id
	FROM turns t
	INNER JOIN last_unit_turn_id lutid
	ON lutid.turn_number = t.turn_number
	INNER JOIN unit_histories uh
		ON uh.turn_id = t.turn_id AND uh.unit_id = lutid.unit_id
	WHERE t.game_id = $1;

$$ LANGUAGE SQL;