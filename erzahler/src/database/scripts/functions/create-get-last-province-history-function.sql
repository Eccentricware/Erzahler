--sudo -u postgres psql < database/scripts/functions/create-get-last-province-history-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_last_province_history function'

CREATE OR REPLACE FUNCTION get_last_province_history(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE(province_id INTEGER, turn_id INTEGER, turn_number INTEGER)
AS $$

	WITH last_turn_number AS (
		SELECT ph.province_id,
			MAX(t.turn_number) AS turn_number
		FROM province_histories ph
		INNER JOIN turns t ON t.turn_id = ph.turn_id
		WHERE t.game_id = $1
			AND t.turn_number <= $2
			AND ph.province_status != 'Discarded'
		GROUP BY ph.province_id
	)
	SELECT ltn.province_id,
		t.turn_id,
		t.turn_number
	FROM turns t
	INNER JOIN last_turn_number ltn ON ltn.turn_number = t.turn_number
	WHERE t.game_id = $1


$$ LANGUAGE SQL;