import { FieldDef, Pool } from 'pg';
import { testCredentials } from '../../secrets/dbCredentials';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import {
  importCoalitionScheduleRowQuery,
  importCountryHistoryRowsQuery,
  importCountryRowsQuery,
  importGameRowQuery,
  importLabelLineRowsQuery,
  importLabelRowsQuery,
  importNodeAdjacencyRowsQuery,
  importNodeRowsQuery,
  importNominationRowsQuery,
  importOrderAdjustmentRowsQuery,
  importOrderOptionRowsQuery,
  importOrderRowsQuery,
  importOrderSetRowsQuery,
  importOrderTransferBuildRowsQuery,
  importOrderTransferTechRowsQuery,
  importProvinceHistoryRowsQuery,
  importProvinceRowsQuery,
  importRulesInGameRowsQuery,
  importTerrainRowsQuery,
  importTurnRowsQuery,
  importUnitHistoryRowsQuery,
  importUnitRowsQuery,
  importVoteRowsQuery
} from '../queries/import/import-queries';
import { terminalLog } from '../../server/utils/general';

export class ImportRepository {
  testPool = new Pool(testCredentials);
  livePool = new Pool(testCredentials); // TODO: change to live credentials, obviously

  gamesCols: ColumnSet<unknown> | undefined;
  coalitionSchedulesCols: ColumnSet<unknown> | undefined;
  rulesInGamesCols: ColumnSet<unknown> | undefined;
  turnsCols: ColumnSet<unknown> | undefined;
  countrysCols: ColumnSet<unknown> | undefined;
  countryHistorysCols: ColumnSet<unknown> | undefined;
  provincesCols: ColumnSet<unknown> | undefined;
  provinceHistorysCols: ColumnSet<unknown> | undefined;
  terrainsCols: ColumnSet<unknown> | undefined;
  labelsCols: ColumnSet<unknown> | undefined;
  labelLinesCols: ColumnSet<unknown> | undefined;
  nodesCols: ColumnSet<unknown> | undefined;
  nodeAdjacencysCols: ColumnSet<unknown> | undefined;
  unitsCols: ColumnSet<unknown> | undefined;
  unitHistorysCols: ColumnSet<unknown> | undefined;
  orderOptionsCols: ColumnSet<unknown> | undefined;
  orderSetsCols: ColumnSet<unknown> | undefined;
  ordersCols: ColumnSet<unknown> | undefined;
  orderAdjustmentsCols: ColumnSet<unknown> | undefined;
  orderTransferBuildsCols: ColumnSet<unknown> | undefined;
  orderTransferTechsCols: ColumnSet<unknown> | undefined;
  nominationsCols: ColumnSet<unknown> | undefined;
  votesCols: ColumnSet<unknown> | undefined;

  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async importGameRow(gameId: number, environment: string) {
    const gameRowResult =
      environment === 'test'
        ? await this.testPool.query(importGameRowQuery, [gameId])
        : await this.livePool.query(importGameRowQuery, [gameId]);

    this.gamesCols = this.createColumnSets(gameRowResult.fields, 'games');
    return gameRowResult.rows;
  }

  async importCoalitionScheduleRow(gameId: number, environment: string) {
    const coalitionScheduleResult =
      environment === 'test'
        ? await this.testPool.query(importCoalitionScheduleRowQuery, [gameId])
        : await this.livePool.query(importCoalitionScheduleRowQuery, [gameId]);

    this.coalitionSchedulesCols = this.createColumnSets(coalitionScheduleResult.fields, 'coalition_schedules');
    return coalitionScheduleResult.rows;
  }

  async importRulesInGameRows(gameId: number, environment: string) {
    const rulesInGameRowsResult =
      environment === 'test'
        ? await this.testPool.query(importRulesInGameRowsQuery, [gameId])
        : await this.livePool.query(importRulesInGameRowsQuery, [gameId]);

    this.rulesInGamesCols = this.createColumnSets(rulesInGameRowsResult.fields, 'rules_in_games');
    return rulesInGameRowsResult.rows;
  }

  async importTurnRows(gameId: number, environment: string) {
    const turnRowsResult =
      environment === 'test'
        ? await this.testPool.query(importTurnRowsQuery, [gameId])
        : await this.livePool.query(importTurnRowsQuery, [gameId]);

    this.turnsCols = this.createColumnSets(turnRowsResult.fields, 'turns');
    return turnRowsResult.rows;
  }

  async importCountryRows(gameId: number, environment: string) {
    const countryRowsResults =
      environment === 'test'
        ? await this.testPool.query(importCountryRowsQuery, [gameId])
        : await this.livePool.query(importCountryRowsQuery, [gameId]);

    this.countrysCols = this.createColumnSets(countryRowsResults.fields, 'countries');
    return countryRowsResults.rows;
  }

  async importCountryHistoryRows(gameId: number, environment: string) {
    const countryHistoryRowsResult =
      environment === 'test'
        ? await this.testPool.query(importCountryHistoryRowsQuery, [gameId])
        : await this.livePool.query(importCountryHistoryRowsQuery, [gameId]);

    this.countryHistorysCols = this.createColumnSets(countryHistoryRowsResult.fields, 'country_histories');
    return countryHistoryRowsResult.rows;
  }

  async importProvinceRows(gameId: number, environment: string) {
    const provinceRowsResult =
      environment === 'test'
        ? await this.testPool.query(importProvinceRowsQuery, [gameId])
        : await this.livePool.query(importProvinceRowsQuery, [gameId]);

    this.provincesCols = this.createColumnSets(provinceRowsResult.fields, 'provinces');
    return provinceRowsResult.rows;
  }

  async importProvinceHistoryRows(gameId: number, environment: string) {
    const provinceHistoryRowsResult =
      environment === 'test'
        ? await this.testPool.query(importProvinceHistoryRowsQuery, [gameId])
        : await this.livePool.query(importProvinceHistoryRowsQuery, [gameId]);

    this.provinceHistorysCols = this.createColumnSets(provinceHistoryRowsResult.fields, 'province_histories');
    return provinceHistoryRowsResult.rows;
  }

  async importTerrainRows(gameId: number, environment: string) {
    const terrainRowsResult =
      environment === 'test'
        ? await this.testPool.query(importTerrainRowsQuery, [gameId])
        : await this.livePool.query(importTerrainRowsQuery, [gameId]);

    this.terrainsCols = this.createColumnSets(terrainRowsResult.fields, 'terrain');
    return terrainRowsResult.rows;
  }

  async importLabelRows(gameId: number, environment: string) {
    const labelRowsResult =
      environment === 'test'
        ? await this.testPool.query(importLabelRowsQuery, [gameId])
        : await this.livePool.query(importLabelRowsQuery, [gameId]);

    this.labelsCols = this.createColumnSets(labelRowsResult.fields, 'labels');
    return labelRowsResult.rows;
  }

  async importLabelLineRows(gameId: number, environment: string) {
    const labelLineRowsResult =
      environment === 'test'
        ? await this.testPool.query(importLabelLineRowsQuery, [gameId])
        : await this.livePool.query(importLabelLineRowsQuery, [gameId]);

    this.labelLinesCols = this.createColumnSets(labelLineRowsResult.fields, 'label_lines');
    return labelLineRowsResult.rows;
  }

  async importNodeRows(gameId: number, environment: string) {
    const nodeRowsResult =
      environment === 'test'
        ? await this.testPool.query(importNodeRowsQuery, [gameId])
        : await this.livePool.query(importNodeRowsQuery, [gameId]);

    this.nodesCols = this.createColumnSets(nodeRowsResult.fields, 'nodes');
    return nodeRowsResult.rows;
  }

  async importNodeAdjacencyRows(gameId: number, environment: string) {
    const nodeAdjacencyRowsResult =
      environment === 'test'
        ? await this.testPool.query(importNodeAdjacencyRowsQuery, [gameId])
        : await this.livePool.query(importNodeAdjacencyRowsQuery, [gameId]);

    this.nodeAdjacencysCols = this.createColumnSets(nodeAdjacencyRowsResult.fields, 'node_adjacencies');
    return nodeAdjacencyRowsResult.rows;
  }

  async importUnitRows(gameId: number, environment: string) {
    const unitRowsResult =
      environment === 'test'
        ? await this.testPool.query(importUnitRowsQuery, [gameId])
        : await this.livePool.query(importUnitRowsQuery, [gameId]);

    this.unitsCols = this.createColumnSets(unitRowsResult.fields, 'units');
    return unitRowsResult.rows;
  }

  async importUnitHistoryRows(gameId: number, environment: string) {
    const unitHistoryRowsResult =
      environment === 'test'
        ? await this.testPool.query(importUnitHistoryRowsQuery, [gameId])
        : await this.livePool.query(importUnitHistoryRowsQuery, [gameId]);

    this.unitHistorysCols = this.createColumnSets(unitHistoryRowsResult.fields, 'unit_histories');
    return unitHistoryRowsResult.rows;
  }

  async importOrderOptionRows(gameId: number, environment: string) {
    const orderOptionsRowsResult =
      environment === 'test'
        ? await this.testPool.query(importOrderOptionRowsQuery, [gameId])
        : await this.livePool.query(importOrderOptionRowsQuery, [gameId]);

    this.orderOptionsCols = this.createColumnSets(orderOptionsRowsResult.fields, 'order_options');
    return orderOptionsRowsResult.rows;
  }

  async importOrderSetRows(gameId: number, environment: string) {
    const orderSetRowsResult =
      environment === 'test'
        ? await this.testPool.query(importOrderSetRowsQuery, [gameId])
        : await this.livePool.query(importOrderSetRowsQuery, [gameId]);

    this.orderSetsCols = this.createColumnSets(orderSetRowsResult.fields, 'order_sets');
    return orderSetRowsResult.rows;
  }

  async importOrderRows(gameId: number, environment: string) {
    const orderRowsResult =
      environment === 'test'
        ? await this.testPool.query(importOrderRowsQuery, [gameId])
        : await this.livePool.query(importOrderRowsQuery, [gameId]);

    this.ordersCols = this.createColumnSets(orderRowsResult.fields, 'orders');
    return orderRowsResult.rows;
  }

  async importOrderAdjustmentRows(gameId: number, environment: string) {
    const orderAdjustmentRowsResult =
      environment === 'test'
        ? await this.testPool.query(importOrderAdjustmentRowsQuery, [gameId])
        : await this.livePool.query(importOrderAdjustmentRowsQuery, [gameId]);

    this.orderAdjustmentsCols = this.createColumnSets(orderAdjustmentRowsResult.fields, 'orders_adjustments');
    return orderAdjustmentRowsResult.rows;
  }

  async importOrderTransferBuildRows(gameId: number, environment: string) {
    const orderTransferBuildRowsResult =
      environment === 'test'
        ? await this.testPool.query(importOrderTransferBuildRowsQuery, [gameId])
        : await this.livePool.query(importOrderTransferBuildRowsQuery, [gameId]);

    this.orderTransferBuildsCols = this.createColumnSets(orderTransferBuildRowsResult.fields, 'orders_transfer_builds');
    return orderTransferBuildRowsResult.rows;
  }

  async importOrderTransferTechRows(gameId: number, environment: string) {
    const importOrderTransferTechRowsResult =
      environment === 'test'
        ? await this.testPool.query(importOrderTransferTechRowsQuery, [gameId])
        : await this.livePool.query(importOrderTransferTechRowsQuery, [gameId]);

    this.orderTransferTechsCols = this.createColumnSets(
      importOrderTransferTechRowsResult.fields,
      'orders_transfer_tech'
    );
    return importOrderTransferTechRowsResult.rows;
  }

  async importNominationRows(gameId: number, environment: string) {
    const nominationRowsResult =
      environment === 'test'
        ? await this.testPool.query(importNominationRowsQuery, [gameId])
        : await this.livePool.query(importNominationRowsQuery, [gameId]);

    this.nominationsCols = this.createColumnSets(nominationRowsResult.fields, 'nominations');
    return nominationRowsResult.rows;
  }

  async importVoteRows(gameId: number, environment: string) {
    const voteRowsResult =
      environment === 'test'
        ? await this.testPool.query(importVoteRowsQuery, [gameId])
        : await this.livePool.query(importVoteRowsQuery, [gameId]);

    this.votesCols = this.createColumnSets(voteRowsResult.fields, 'votes');
    return voteRowsResult.rows;
  }

  //// Utility ////

  createColumnSets(fields: FieldDef[], tableName: string): ColumnSet {
    const columnNames = fields.map((field: FieldDef) => field.name);
    columnNames.shift(); // remove id column
    return new this.pgp.helpers.ColumnSet(columnNames, { table: tableName });
  }

  //// Insert ////

  async insertGameRow(gameRow: any): Promise<number> {
    if (!gameRow) {
      terminalLog('Import insertGameRow error: no gameRow');
      0;
    }

    const insertGameQuery = this.pgp.helpers.insert(gameRow, this.gamesCols) + ' RETURNING game_id';

    const gameIds = await this.db
      .query(insertGameQuery)
      .then((result: any) => result.map((row: any) => row.game_id))
      .catch((error: Error) => {
        terminalLog(`Import insertGameRow error: ${error.message}`);
      });

    return gameIds[0];
  }

  async insertCoalitionRow(coalitionRow: any): Promise<void> {
    if (!coalitionRow) {
      terminalLog('Import insertCoalitionRow error: no coalitionRow');
      return;
    }

    const insertCoalitionQuery = this.pgp.helpers.insert(coalitionRow, this.coalitionSchedulesCols);
    await this.db.none(insertCoalitionQuery).catch((error: Error) => {
      terminalLog(`Import insertCoalitionRow error: ${error.message}`);
    });
  }

  async insertRulesInGameRows(rulesInGameRows: any[]): Promise<void> {
    if (rulesInGameRows.length === 0) {
      terminalLog('Import insertRulesInGameRows error: no rulesInGameRows');
      return;
    }

    const insertRulesInGameQuery = this.pgp.helpers.insert(rulesInGameRows, this.rulesInGamesCols);
    await this.db.none(insertRulesInGameQuery).catch((error: Error) => {
      terminalLog(`Import insertRulesInGameRows error: ${error.message}`);
    });
  }

  async insertTurnRows(turnRows: any[]): Promise<number[]> {
    if (turnRows.length === 0) {
      terminalLog('Import insertTurnRows error: no turnRows');
      return [];
    }

    const insertTurnQuery = this.pgp.helpers.insert(turnRows, this.turnsCols) + ' RETURNING turn_id';

    const turnIds = await this.db
      .query(insertTurnQuery)
      .then((result) => result.map((row: any) => row.turn_id))
      .catch((error: Error) => {
        terminalLog(`Import insertTurnRows error: ${error.message}`);
      });

    return turnIds;
  }

  async insertCountryRows(countryRows: any[]): Promise<number[]> {
    if (countryRows.length === 0) {
      terminalLog('Import insertCountryRows error: no countryRows');
      return [];
    }

    const insertCountryQuery = this.pgp.helpers.insert(countryRows, this.countrysCols) + ' RETURNING country_id';

    const countryIds = await this.db
      .query(insertCountryQuery)
      .then((result) => result.map((row: any) => row.country_id))
      .catch((error: Error) => {
        terminalLog(`Import insertCountryRows error: ${error.message}`);
      });

    return countryIds;
  }

  async insertProvinceRows(provinceRows: any[]): Promise<number[]> {
    if (provinceRows.length === 0) {
      terminalLog('Import insertProvinceRows error: no provinceRows');
      return [];
    }

    const insertProvinceQuery = this.pgp.helpers.insert(provinceRows, this.provincesCols) + ' RETURNING province_id';

    const provinceIds = await this.db
      .query(insertProvinceQuery)
      .then((result) => result.map((row: any) => row.province_id))
      .catch((error: Error) => {
        terminalLog(`Import insertProvinceRows error: ${error.message}`);
      });

    return provinceIds;
  }

  async insertCountryHistoryRows(countryHistoryRows: any[]): Promise<void> {
    if (countryHistoryRows.length === 0) {
      terminalLog('Import insertCountryHistoryRows error: no countryHistoryRows');
      return;
    }

    const insertCountryHistoryQuery = this.pgp.helpers.insert(countryHistoryRows, this.countryHistorysCols);
    await this.db.none(insertCountryHistoryQuery).catch((error: Error) => {
      terminalLog(`Import insertCountryHistoryRows error: ${error.message}`);
    });
  }

  async insertProvinceHistoryRows(provinceHistoryRows: any[]): Promise<void> {
    if (provinceHistoryRows.length === 0) {
      terminalLog('Import insertProvinceHistoryRows error: no provinceHistoryRows');
      return;
    }

    const insertProvinceHistoryQuery = this.pgp.helpers.insert(provinceHistoryRows, this.provinceHistorysCols);
    await this.db.none(insertProvinceHistoryQuery).catch((error: Error) => {
      terminalLog(`Import insertProvinceHistoryRows error: ${error.message}`);
    });
  }

  async insertTerrainRows(terrainRows: any[]): Promise<void> {
    if (terrainRows.length === 0) {
      terminalLog('Import insertTerrainRows error: no terrainRows');
      return;
    }

    const insertTerrainQuery = this.pgp.helpers.insert(terrainRows, this.terrainsCols);
    await this.db.none(insertTerrainQuery).catch((error: Error) => {
      terminalLog(`Import insertTerrainRows error: ${error.message}`);
    });
  }

  async insertLabelRows(labelRows: any[]): Promise<void> {
    if (labelRows.length === 0) {
      terminalLog('Import insertLabelRows error: no labelRows');
      return;
    }

    const insertLabelQuery = this.pgp.helpers.insert(labelRows, this.labelsCols);

    if (labelRows.length === 0) {
      return;
    }

    await this.db.none(insertLabelQuery).catch((error: Error) => {
      terminalLog(`Import insertLabelRows error: ${error.message}`);
    });
  }

  async insertLabelLineRows(labelLineRows: any[]): Promise<void> {
    if (labelLineRows.length === 0) {
      terminalLog('Import insertLabelLineRows error: no labelLineRows');
      return;
    }

    const insertLabelLineQuery = this.pgp.helpers.insert(labelLineRows, this.labelLinesCols);
    await this.db.none(insertLabelLineQuery).catch((error: Error) => {
      terminalLog(`Import insertLabelLineRows error: ${error.message}`);
    });
  }

  async insertNodeRows(nodeRows: any[]): Promise<number[]> {
    if (nodeRows.length === 0) {
      terminalLog('Import insertNodeRows error: no nodeRows');
      return [];
    }

    const insertNodeQuery = this.pgp.helpers.insert(nodeRows, this.nodesCols) + ' RETURNING node_id';

    const nodeIds = await this.db
      .query(insertNodeQuery)
      .then((result) => result.map((row: any) => row.node_id))
      .catch((error: Error) => {
        terminalLog(`Import insertNodeRows error: ${error.message}`);
      });

    return nodeIds;
  }

  async insertNodeAdjacencyRows(nodeAdjacencyRows: any[]): Promise<void> {
    if (nodeAdjacencyRows.length === 0) {
      terminalLog('Import insertNodeAdjacencyRows error: no nodeAdjacencyRows');
      return;
    }

    const insertNodeAdjacencyQuery = this.pgp.helpers.insert(nodeAdjacencyRows, this.nodeAdjacencysCols);
    await this.db.none(insertNodeAdjacencyQuery).catch((error: Error) => {
      terminalLog(`Import insertNodeAdjacencyRows error: ${error.message}`);
    });
  }

  async insertUnitRows(unitRows: any[]): Promise<number[]> {
    if (unitRows.length === 0) {
      terminalLog('Import insertUnitRows error: no unitRows');
      return [];
    }

    const insertUnitQuery = this.pgp.helpers.insert(unitRows, this.unitsCols) + ' RETURNING unit_id';

    const unitIds = await this.db
      .query(insertUnitQuery)
      .then((result) => result.map((row: any) => row.unit_id))
      .catch((error: Error) => {
        terminalLog(`Import insertUnitRows error: ${error.message}`);
      });

    return unitIds;
  }

  async insertUnitHistoryRows(unitHistoryRows: any[]): Promise<void> {
    if (unitHistoryRows.length === 0) {
      terminalLog('Import insertUnitHistoryRows error: no unitHistoryRows');
      return;
    }

    const insertUnitHistoryQuery = this.pgp.helpers.insert(unitHistoryRows, this.unitHistorysCols);
    await this.db.none(insertUnitHistoryQuery).catch((error: Error) => {
      terminalLog(`Import insertUnitHistoryRows error: ${error.message}`);
    });
  }

  async insertOrderOptionRows(orderOptionRows: any[]): Promise<void> {
    if (orderOptionRows.length === 0) {
      terminalLog('Import insertOrderOptionRows error: no orderOptionRows');
      return;
    }

    const insertOrderOptionQuery = this.pgp.helpers.insert(orderOptionRows, this.orderOptionsCols);
    await this.db.none(insertOrderOptionQuery).catch((error: Error) => {
      terminalLog(`Import insertOrderOptionRows error: ${error.message}`);
    });
  }

  async insertOrderSetRows(orderSetRows: any[]): Promise<number[]> {
    if (orderSetRows.length === 0) {
      terminalLog('Import insertOrderSetRows error: no orderSetRows');
      return [];
    }

    const insertOrderSetQuery = this.pgp.helpers.insert(orderSetRows, this.orderSetsCols) + ' RETURNING order_set_id';

    const orderSetIds = await this.db
      .query(insertOrderSetQuery)
      .then((result) => result.map((row: any) => row.order_set_id))
      .catch((error: Error) => {
        terminalLog(`Import insertOrderSetRows error: ${error.message}`);
      });

    return orderSetIds;
  }

  async insertOrderRows(orderRows: any[]): Promise<void> {
    if (orderRows.length === 0) {
      terminalLog('Import insertOrderRows error: no orderRows');
      return;
    }

    const insertOrderQuery = this.pgp.helpers.insert(orderRows, this.ordersCols);
    await this.db.none(insertOrderQuery).catch((error: Error) => {
      terminalLog(`Import insertOrderRows error: ${error.message}`);
    });
  }

  async insertOrderAdjustmentRows(orderAdjustmentRows: any[]): Promise<void> {
    if (orderAdjustmentRows.length === 0) {
      terminalLog('Import insertOrderAdjustmentRows error: no orderAdjustmentRows');
      return;
    }

    const insertOrderAdjustmentQuery = this.pgp.helpers.insert(orderAdjustmentRows, this.orderAdjustmentsCols);
    await this.db.none(insertOrderAdjustmentQuery).catch((error: Error) => {
      terminalLog(`Import insertOrderAdjustmentRows error: ${error.message}`);
    });
  }

  async insertOrderTransferBuildRows(orderTransferBuildRows: any[]): Promise<void> {
    if (orderTransferBuildRows.length === 0) {
      terminalLog('Import insertOrderTransferBuildRows error: no orderTransferBuildRows');
      return;
    }

    const insertOrderTransferBuildQuery = this.pgp.helpers.insert(orderTransferBuildRows, this.orderTransferBuildsCols);
    await this.db.none(insertOrderTransferBuildQuery).catch((error: Error) => {
      terminalLog(`Import insertOrderTransferBuildRows error: ${error.message}`);
    });
  }

  async insertOrderTransferTechRows(orderTransferTechRows: any[]): Promise<void> {
    if (orderTransferTechRows.length === 0) {
      terminalLog('Import insertOrderTransferTechRows error: no orderTransferTechRows');
      return;
    }

    const insertOrderTransferTechQuery = this.pgp.helpers.insert(orderTransferTechRows, this.orderTransferTechsCols);
    await this.db.none(insertOrderTransferTechQuery).catch((error: Error) => {
      terminalLog(`Import insertOrderTransferTechRows error: ${error.message}`);
    });
  }

  async insertNominationRows(nominationRows: any[]): Promise<number[]> {
    if (nominationRows.length === 0) {
      terminalLog('Import insertNominationRows error: no nominationRows');
      return [];
    }

    const insertNominationQuery =
      this.pgp.helpers.insert(nominationRows, this.nominationsCols) + ' RETURNING nomination_id';

    const nominationIds = await this.db
      .query(insertNominationQuery)
      .then((result) => result.map((row: any) => row.nomination_id))
      .catch((error: Error) => {
        terminalLog(`Import insertNominationRows error: ${error.message}`);
      });

    return nominationIds;
  }

  async insertVoteRows(voteRows: any[]): Promise<void> {
    if (voteRows.length === 0) {
      terminalLog('Import insertVoteRows error: no voteRows');
      return;
    }

    const insertVoteQuery = this.pgp.helpers.insert(voteRows, this.votesCols);
    await this.db.none(insertVoteQuery).catch((error: Error) => {
      terminalLog(`Import insertVoteRows error: ${error.message}`);
    });
  }
}
