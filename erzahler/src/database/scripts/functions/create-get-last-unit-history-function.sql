--sudo -u postgres psql < database/scripts/functions/create-get-last-unit-history-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_last_unit_history function'

CREATE OR REPLACE FUNCTION get_last_unit_history(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE(unit_id INTEGER, turn_id INTEGER, turn_number INTEGER)
AS $$

	WITH last_turn_number AS (
		SELECT uh.unit_id,
			MAX(t.turn_number) AS turn_number
		FROM unit_histories uh
		INNER JOIN turns t ON t.turn_id = uh.turn_id
		WHERE t.game_id = $1
			AND t.turn_number <= $2
			AND uh.unit_status != 'Discarded'
		GROUP BY uh.unit_id
	)
	SELECT ltn.unit_id,
		t.turn_id,
		t.turn_number
	FROM turns t
	INNER JOIN last_turn_number ltn ON ltn.turn_number = t.turn_number
	WHERE t.game_id = $1

$$ LANGUAGE SQL;