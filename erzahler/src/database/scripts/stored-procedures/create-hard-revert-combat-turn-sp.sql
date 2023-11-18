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
  USING orders o
  INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;

  DELETE FROM orders_transfer_builds
  USING orders_transfer_builds otb
  INNER JOIN order_sets os ON os.order_set_id = otb.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;

  DELETE FROM orders_transfer_tech
  USING orders_transfer_tech ott
  INNER JOIN order_sets os ON os.order_set_id = ott.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;

  DELETE FROM order_sets
  USING order_sets os
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;


  DELETE FROM unit_histories
  USING unit_histories uh
  INNER JOIN turns t ON t.turn_id = uh.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;

  DELETE FROM country_histories
  USING country_histories ch
  INNER JOIN turns t ON t.turn_id = ch.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;

  DELETE FROM province_histories
  USING province_histories ph
  INNER JOIN turns t ON t.turn_id = ph.turn_id
  WHERE t.game_id = $1
    AND t.turn_number > $2;

  DELETE FROM turns
  WHERE game_id = $1
    AND turn_number > $2;

$$ LANGUAGE SQL;