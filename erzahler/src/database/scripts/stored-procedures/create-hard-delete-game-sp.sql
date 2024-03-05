CREATE PROCEDURE hard_delete_game(
  INTEGER -- game_id
)
AS $$

------------------------------------------------------------
  DELETE FROM unit_histories
  WHERE unit_history_id IN (
    SELECT uh.unit_history_id
    FROM unit_histories uh
    INNER JOIN turns t ON t.turn_id = t.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM node_adjacencies
  WHERE node_adjacency_id IN (
    SELECT na.node_adjacency_id
    FROM node_adjacencies na
    INNER JOIN nodes n ON n.node_id = na.node_1_id OR n.node_id = na.node_2_id
    INNER JOIN provinces p ON p.province_id = n.province_id
    WHERE p.game_id = $1
  );

  DELETE FROM order_options
  WHERE order_option_id IN (
    SELECT oo.order_option_id
    FROM order_options oo
    INNER JOIN turns t ON t.turn_id = oo.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM orders
  WHERE order_id IN (
    SELECT o.order_id
    FROM orders o
    INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM orders_adjustments
  WHERE build_order_id IN (
    SELECT oa.build_order_id
    FROM orders_adjustments oa
    INNER JOIN order_sets os ON os.order_set_id = oa.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM orders_transfer_builds
  WHERE build_transfer_order_id IN (
    SELECT otb.build_transfer_order_id
    FROM orders_transfer_builds otb
    INNER JOIN order_sets os ON os.order_set_id = otb.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM orders_transfer_tech
  WHERE tech_transfer_order_id IN (
    SELECT ott.tech_transfer_order_id
    FROM orders_transfer_tech ott
    INNER JOIN order_sets os ON os.order_set_id = ott.order_set_id
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
  );

------------------------------------------------------------

  DELETE FROM province_histories
  WHERE province_history_id IN (
    SELECT ph.province_history_id
    FROM province_histories ph
    INNER JOIN provinces p ON p.province_id = ph.province_id
    WHERE p.game_id = $1
  );

  DELETE FROM terrain
  WHERE terrain_id IN (
    SELECT t.terrain_id
    FROM terrain t
    INNER JOIN provinces p ON p.province_id = t.province_id
    WHERE p.game_id = $1
  );

  DELETE FROM labels
  WHERE label_id IN (
    SELECT l.label_id
    FROM labels l
    INNER JOIN provinces p ON p.province_id = l.province_id
    WHERE p.game_id = $1
  );

  DELETE FROM label_lines
  WHERE label_line_id IN (
    SELECT ll.label_line_id
    FROM label_lines ll
    INNER JOIN provinces p ON p.province_id = ll.province_id
    WHERE p.game_id = $1
  );

  DELETE FROM nodes
  WHERE node_id IN (
    SELECT n.node_id
    FROM nodes n
    INNER JOIN provinces p ON p.province_id = n.province_id
    WHERE p.game_id = $1
  );

  DELETE FROM votes
  WHERE vote_id IN (
    SELECT v.vote_id
    FROM votes v
    INNER JOIN nominations n ON n.nomination_id = v.nomination_id
    INNER JOIN turns t ON t.turn_id = n.turn_id
    WHERE t.game_id = $1
  );
------------------------------------------------------------
  DELETE FROM country_histories
  WHERE country_history_id IN (
    SELECT ch.country_history_id
    FROM country_histories ch
    INNER JOIN turns t ON t.turn_id = ch.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM provinces
  WHERE province_id IN (
    SELECT province_id
    FROM provinces
    WHERE game_id = $1
  );

  DELETE FROM units
  WHERE unit_id IN (
    SELECT u.unit_id
    FROM units u
    INNER JOIN countries c ON c.country_id = u.country_id
    WHERE c.game_id = $1
  );

  DELETE FROM order_sets
  WHERE order_set_id IN (
    SELECT os.order_set_id
    FROM order_sets os
    INNER JOIN turns t ON t.turn_id = os.turn_id
    WHERE t.game_id = $1
  );

  DELETE FROM nominations
  WHERE nomination_id IN (
    SELECT n.nomination_id
    FROM nominations n
    INNER JOIN turns t ON t.turn_id = n.turn_id
    WHERE t.game_id = $1
  );
------------------------------------------------------------
  DELETE FROM coalition_schedules
  WHERE coalition_schedule_id IN (
    SELECT coalition_schedule_id
    FROM coalition_schedules
    WHERE game_id = $1
  );

  DELETE FROM rules_in_games
  WHERE rule_in_game_id IN (
    SELECT rule_in_game_id
    FROM rules_in_games
    WHERE game_id = $1
  );

  DELETE FROM turns
  WHERE turn_id IN (
    SELECT turn_id
    FROM turns
    WHERE game_id = $1
  );

  DELETE FROM countries
  WHERE country_id IN (
    SELECT country_id
    FROM countries
    WHERE game_id = $1
  );

------------------------------------------------------------
  DELETE FROM games
  WHERE game_id = $1;

$$ LANGUAGE SQL;