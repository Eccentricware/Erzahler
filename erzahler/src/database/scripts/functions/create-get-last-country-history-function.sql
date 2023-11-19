--sudo -u postgres psql < database/scripts/functions/create-get-last-country-history-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_last_country_history function'

CREATE OR REPLACE FUNCTION get_last_country_history(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE(country_id INTEGER, turn_id INTEGER, turn_number INTEGER)
AS $$

	WITH last_turn_number AS (
		SELECT ch.country_id,
			MAX(t.turn_number) AS turn_number
		FROM country_histories ch
		INNER JOIN turns t ON t.turn_id = ch.turn_id
		WHERE t.game_id = $1
			AND t.turn_number <= $2
			AND ch.country_status != 'Discarded'
		GROUP BY ch.country_id
	)
	SELECT ltn.country_id,
		t.turn_id,
		t.turn_number
	FROM turns t
	INNER JOIN last_turn_number ltn ON ltn.turn_number = t.turn_number
	WHERE t.game_id = $1

$$ LANGUAGE SQL;