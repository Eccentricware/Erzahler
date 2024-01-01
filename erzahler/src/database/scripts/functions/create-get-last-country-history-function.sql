--sudo -u postgres psql < database/scripts/functions/create-get-last-country-history-function.sql

\c erzahler_dev;
\echo 'Attempting to create get_last_country_history function'

CREATE OR REPLACE FUNCTION get_last_country_history(
	INTEGER, --game_id
	INTEGER  --turn_number
)
RETURNS TABLE (
	country_history_id INTEGER,
	country_id INTEGER,
	turn_id INTEGER,
	country_status VARCHAR(18),
	city_count INTEGER,
	unit_count INTEGER,
	banked_builds INTEGER,
	nuke_range INTEGER,
	adjustments INTEGER,
	vote_count INTEGER,
	in_retreat BOOLEAN,
	nukes_in_production INTEGER
)
AS $$

	WITH last_turn_number AS (
		SELECT ch.country_id,
			MAX(t.turn_number) AS turn_number
		FROM country_histories ch
		INNER JOIN turns t ON t.turn_id = ch.turn_id
		WHERE t.game_id = $1
			AND t.turn_number <= $2
		GROUP BY ch.country_id
	)
	SELECT ch.country_history_id,
		ch.country_id,
		ch.turn_id,
		ch.country_status,
		ch.city_count,
		ch.unit_count,
		ch.banked_builds,
		ch.nuke_range,
		ch.adjustments,
		ch.vote_count,
		ch.in_retreat,
		ch.nukes_in_production
	FROM turns t
	INNER JOIN last_turn_number ltn
		ON ltn.turn_number = t.turn_number
	INNER JOIN country_histories ch
		ON ch.turn_id = t.turn_id AND ch.country_id = ltn.country_id
	WHERE t.game_id = $1;

$$ LANGUAGE SQL;