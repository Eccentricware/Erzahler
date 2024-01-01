--sudo -u postgres psql < database/scripts/functions/create-get-last-province-history-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_last_province_history function'

CREATE OR REPLACE FUNCTION get_last_province_history(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE (
	province_history_id INTEGER,
	province_id INTEGER,
	turn_id INTEGER,
	controller_id INTEGER,
	capital_owner_id INTEGER,
	province_status VARCHAR,
	valid_retreat BOOLEAN
)
AS $$

	WITH last_turn_number AS (
		SELECT ph.province_id,
			MAX(t.turn_number) AS turn_number
		FROM province_histories ph
		INNER JOIN turns t ON t.turn_id = ph.turn_id
		WHERE t.game_id = $1
			AND t.turn_number <= $2
		GROUP BY ph.province_id
	)
	SELECT ph.province_history_id,
		ph.province_id,
		ph.turn_id,
		ph.controller_id,
		ph.capital_owner_id,
		ph.province_status,
		ph.valid_retreat
	FROM turns t
	INNER JOIN last_turn_number ltn
		ON ltn.turn_number = t.turn_number
	INNER JOIN province_histories ph
		ON ph.turn_id = t.turn_id AND ph.province_id = ltn.province_id
	WHERE t.game_id = $1


$$ LANGUAGE SQL;