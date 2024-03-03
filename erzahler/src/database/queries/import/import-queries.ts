export const importGameRowQuery = `
  SELECT *
  FROM games
  WHERE game_id = $1;
`;

export const importCoalitionScheduleRowQuery = `
  SELECT *
  FROM coalition_schedules
  WHERE game_id = $1;
`;

export const importRulesInGameRowsQuery = `
  SELECT *
  FROM rules_in_games
  WHERE game_id = $1;
`;

export const importTurnRowsQuery = `
  SELECT *
  FROM turns
  WHERE game_id = $1;
`;

export const importCountryRowsQuery = `
  SELECT *
  FROM countries
  WHERE game_id = $1;
`;

export const importCountryHistoryRowsQuery = `
  SELECT ch.*
  FROM country_histories ch
  INNER JOIN countries c ON c.country_id = ch.country_id
  WHERE c.game_id = $1;
`;

export const importProvinceRowsQuery = `
  SELECT *
  FROM provinces
  WHERE game_id = $1;
`;

export const importProvinceHistoryRowsQuery = `
  SELECT ph.*
  FROM province_histories ph
  INNER JOIN provinces p ON p.province_id = ph.province_id
  WHERE p.game_id = $1;
`;

export const importTerrainRowsQuery = `
  SELECT t.*
  FROM terrain t
  INNER JOIN provinces p ON p.province_id = t.province_id
  WHERE p.game_id = $1;
`;

export const importLabelRowsQuery = `
  SELECT l.*
  FROM labels l
  INNER JOIN provinces p ON p.province_id = l.province_id
  WHERE p.game_id = $1;
`;

export const importLabelLineRowsQuery = `
  SELECT ll.*
  FROM label_lines ll
  INNER JOIN provinces p ON p.province_id = ll.province_id
  WHERE p.game_id = $1;
`;

export const importNodeRowsQuery = `
  SELECT n.*
  FROM nodes n
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE p.game_id = $1;
`;

export const importNodeAdjacencyRowsQuery = `
  SELECT na.*
  FROM node_adjacencies na
  INNER JOIN nodes n ON n.node_id = na.node_1_id OR n.node_id = na.node_2_id
  INNER JOIN provinces p ON p.province_id = n.province_id
  WHERE p.game_id = $1
  ORDER BY node_adjacency_id;
`;

export const importUnitRowsQuery = `
  SELECT u.*
  FROM units u
  INNER JOIN countries c ON c.country_id = u.country_id
  WHERE c.game_id = $1;
`;

export const importUnitHistoryRowsQuery = `
  SELECT uh.*
  FROM unit_histories uh
  INNER JOIN units u ON u.unit_id = uh.unit_id
  INNER JOIN countries c ON c.country_id = u.country_id
  WHERE c.game_id = $1;
`;

export const importOrderOptionRowsQuery = `
  SELECT oo.*
  FROM order_options oo
  INNER JOIN turns t ON t.turn_id = oo.turn_id
  WHERE t.game_id = $1;
`;

export const importOrderSetRowsQuery = `
  SELECT os.*
  FROM order_sets os
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1;
`;

export const importOrderRowsQuery = `
  SELECT o.*
  FROM orders o
  INNER JOIN order_sets os ON os.order_set_id = o.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1;
`;

export const importOrderAdjustmentRowsQuery = `
  SELECT oa.*
  FROM orders_adjustments oa
  INNER JOIN order_sets os ON os.order_set_id = oa.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1;
`;

export const importOrderTransferBuildRowsQuery = `
  SELECT otb.*
  FROM orders_transfer_builds otb
  INNER JOIN order_sets os ON os.order_set_id = otb.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1;
`;

export const importOrderTransferTechRowsQuery = `
  SELECT ott.*
  FROM orders_transfer_tech ott
  INNER JOIN order_sets os ON os.order_set_id = ott.order_set_id
  INNER JOIN turns t ON t.turn_id = os.turn_id
  WHERE t.game_id = $1;
`;

export const importNominationRowsQuery = `
  SELECT n.*
  FROM nominations n
  INNER JOIN turns t ON t.turn_id = n.turn_id
  WHERE t.game_id = $1;
`;

export const importVoteRowsQuery = `
  SELECT v.*
  FROM votes v
  INNER JOIN nominations n ON n.nomination_id = v.nomination_id
  INNER JOIN turns t ON t.turn_id = n.turn_id
  WHERE t.game_id = $1;
`;