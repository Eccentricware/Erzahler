--sudo -u postgres psql < database/scripts/stored-procedures/create-soft-revert-combat-turn-sp.sql

CREATE PROCEDURE soft_revert_combat_turn(
  INTEGER, -- game_id
  INTEGER  -- turn_number
)
AS $$

  UPDATE turns
  SET turn_status = 'Pending'
  WHERE game_id = $1
    AND turn_number = $2;

  UPDATE turns
  SET turn_status = 'Cancelled'
  WHERE game_id = $1
    AND turn_number > $2;

  UPDATE unit_histories
  SET unit_status = 'Discarded'
  WHERE turn_id IN (
    SELECT uh.turn_id
    FROM unit_histories uh
    INNER JOIN turns t ON t.turn_id = uh.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  UPDATE country_histories
  SET country_status = 'Discarded'
  WHERE turn_id IN (
    SELECT ch.turn_id
    FROM country_histories ch
    INNER JOIN turns t ON t.turn_id = ch.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  UPDATE province_histories
  SET province_status = 'Discarded'
  WHERE turn_id IN (
    SELECT ph.turn_id
    FROM province_histories ph
    INNER JOIN turns t ON t.turn_id = ph.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  UPDATE order_sets
  SET order_set_status = 'Discarded'
  WHERE turn_id IN (
    SELECT os.turn_id
    FROM order_sets os
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number >= $2
  );

  UPDATE orders
  SET order_status = 'Discarded'
  WHERE order_set_id IN (
    SELECT o.order_set_id
    FROM orders o
    INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  UPDATE orders_transfer_builds
  SET status = 'Discarded'
  WHERE order_set_id IN (
    SELECT otb.order_set_id
    FROM orders_transfer_builds otb
    INNER JOIN order_sets os ON os.order_set_id = otb.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

  UPDATE orders_transfer_tech
  SET status = 'Discarded'
  WHERE order_set_id IN (
    SELECT ott.order_set_id
    FROM orders_transfer_tech ott
    INNER JOIN order_sets os ON os.order_set_id = ott.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
      AND t.turn_number > $2
  );

$$ LANGUAGE SQL;