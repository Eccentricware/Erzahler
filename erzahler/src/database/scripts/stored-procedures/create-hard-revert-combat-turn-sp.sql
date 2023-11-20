--sudo -u postgres psql < database/scripts/stored-procedures/create-hard-revert-combat-turn-sp.sql

CREATE PROCEDURE hard_revert_combat_turn(
  INTEGER, -- game_id
  INTEGER  -- turn_number
)
AS $$

  UPDATE turns
  SET turn_status = 'Pending'
  WHERE game_id = $1
    AND turn_number = $2;

  DELETE FROM orders
  WHERE order_id IN (
    SELECT o.order_id
    FROM orders o
    INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  DELETE FROM orders_transfer_builds
  WHERE build_transfer_order_id IN (
    SELECT tbo.build_transfer_order_id
    FROM orders_transfer_builds tbo
    INNER JOIN order_sets os ON os.order_set_id = tbo.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  DELETE FROM orders_transfer_tech
  WHERE tech_transfer_order_id IN (
    SELECT tto.tech_transfer_order_id
    FROM orders_transfer_tech tto
    INNER JOIN order_sets os ON os.order_set_id = tto.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  DELETE FROM order_sets
  WHERE order_set_id IN (
    SELECT os.order_set_id
    FROM order_sets os
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  DELETE FROM order_options
  WHERE order_option_id IN (
    SELECT oo.order_option_id
    FROM order_options oo
    INNER JOIN turns t ON t.turn_id = oo.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  DELETE FROM unit_histories
  WHERE unit_history_id in (
    SELECT uh.unit_history_id
    FROM unit_histories uh
    INNER JOIN turns t ON t.turn_id = uh.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  DELETE FROM province_histories
  WHERE province_history_id in (
    SELECT ph.province_history_id
    FROM province_histories ph
    INNER JOIN turns t ON t.turn_id = ph.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  DELETE FROM country_histories
  WHERE country_history_id in (
    SELECT ch.country_history_id
    FROM country_histories ch
    INNER JOIN turns t ON t.turn_id = ch.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  DELETE FROM turns
  WHERE game_id = $1
    AND turn_number > $2;

$$ LANGUAGE SQL;