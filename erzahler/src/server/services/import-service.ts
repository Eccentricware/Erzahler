import { db } from "../../database/connection";
// import { ImportedGameTableRows } from "../../models/objects/games/new-game-data-object";
import { terminalLog } from "../utils/general";

interface ForeignKeyLibrary {
  game: Record<number, number>;
  turns: Record<number, number>;
  countries: Record<number, number>;
  provinces: Record<number, number>;
  nodes: Record<number, number>;
  units: Record<number, number>;
  orderSets: Record<number, number>;
  nominations: Record<number, number>;
}

export class ImportService {
  async importGame(gameId: number, environment: string, magicWord: string): Promise<void> {
    if (magicWord !== process.env.MAGIC_WORD) {
      terminalLog(`Someone attempting to import game without magic word!`);
      return;
    }

    const fkLib: ForeignKeyLibrary = {
      game: {},
      turns: {},
      countries: {},
      provinces: {},
      nodes: {},
      units: {},
      orderSets: {},
      nominations: {}
    }

    Promise.all([
      db.importRepo.importGameRow(gameId, environment),
      db.importRepo.importCoalitionScheduleRow(gameId, environment),
      db.importRepo.importRulesInGameRows(gameId, environment),
      db.importRepo.importTurnRows(gameId, environment),
      db.importRepo.importCountryRows(gameId, environment),
      db.importRepo.importCountryHistoryRows(gameId, environment),
      db.importRepo.importProvinceRows(gameId, environment),
      db.importRepo.importProvinceHistoryRows(gameId, environment),
      db.importRepo.importTerrainRows(gameId, environment),
      db.importRepo.importLabelRows(gameId, environment),
      db.importRepo.importLabelLineRows(gameId, environment),
      db.importRepo.importNodeRows(gameId, environment),
      db.importRepo.importNodeAdjacencyRows(gameId, environment),
      db.importRepo.importUnitRows(gameId, environment),
      db.importRepo.importUnitHistoryRows(gameId, environment),
      db.importRepo.importOrderOptionRows(gameId, environment),
      db.importRepo.importOrderSetRows(gameId, environment),
      db.importRepo.importOrderRows(gameId, environment),
      db.importRepo.importOrderAdjustmentRows(gameId, environment),
      db.importRepo.importOrderTransferBuildRows(gameId, environment),
      db.importRepo.importOrderTransferTechRows(gameId, environment),
      db.importRepo.importNominationRows(gameId, environment),
      db.importRepo.importVoteRows(gameId, environment)
    ]).then(async (results) => {
      const gameRow = results[0][0];
      const coalitionScheduleRow = results[1][0];
      const rulesInGameRows =  results[2];
      const turnRows = results[3];
      const countryRows = results[4];
      const countryHistoryRows = results[5];
      const provinceRows = results[6];
      const provinceHistoryRows = results[7];
      const terrainRows = results[8];
      const labelRows = results[9];
      const labelLineRows = results[10];
      const nodeRows = results[11];
      const nodeAdjacencyRows = results[12];
      const unitRows = results[13];
      const unitHistoryRows = results[14];
      const orderOptionRows = results[15];
      const orderSetRows = results[16];
      const orderRows = results[17];
      const orderAdjustmentRows = results[18];
      const orderTransferBuildRows = results[19];
      const orderTransferTechRows = results[20];
      const nominationRows = results[21];
      const voteRows = results[22];

      gameRow.game_name = `${
        gameRow.game_name
      } (imported from ${
        gameRow.origin ? gameRow.origin : environment
      })`;

      await db.importRepo.insertGameRow(gameRow)
        .then(async (newGameId: number) => {
          fkLib.game[gameId] = newGameId;

          // Foreign Key Updating
          coalitionScheduleRow.game_id = newGameId;
          rulesInGameRows.forEach((rulesInGameRow: any) => { rulesInGameRow.game_id = newGameId; });
          turnRows.forEach((turnRow: any) => { turnRow.game_id = newGameId; });
          countryRows.forEach((countryRow: any) => { countryRow.game_id = newGameId; });

          await db.importRepo.insertCoalitionRow(coalitionScheduleRow);
          await db.importRepo.insertRulesInGameRows(rulesInGameRows);

          Promise.all([
            db.importRepo.insertTurnRows(turnRows),
            db.importRepo.insertCountryRows(countryRows)
          ]).then(async ([
            newTurnIds,
            newCountryIds
          ]) => {
            // Update Foreign Key Library
            for (let turnIndex = 0; turnIndex < turnRows.length; turnIndex++) {
              fkLib.turns[turnRows[turnIndex].turn_id] = newTurnIds[turnIndex];
            }

            for (let countryIndex = 0; countryIndex < countryRows.length; countryIndex++) {
              fkLib.countries[countryRows[countryIndex].country_id] = newCountryIds[countryIndex];
            }

            // Replace Foreign Keys
            countryHistoryRows.forEach((countryHistoryRow: any) => {
              countryHistoryRow.country_id = fkLib.countries[countryHistoryRow.country_id];
              countryHistoryRow.turn_id = fkLib.turns[countryHistoryRow.turn_id];
            });

            provinceRows.forEach((provinceRow: any) => {
              provinceRow.game_id = newGameId;
              provinceRow.capital_owner_id = fkLib.countries[provinceRow.capital_owner_id];
            });

            unitRows.forEach((unitRow: any) => {
              unitRow.country_id = fkLib.countries[unitRow.country_id];
            });

            orderSetRows.forEach((orderSetRow: any) =>{
              orderSetRow.country_id = fkLib.countries[orderSetRow.country_id];
              orderSetRow.turn_id = fkLib.turns[orderSetRow.turn_id];
            });

            nominationRows.forEach((nominationRow: any) => {
              nominationRow.country_id = fkLib.countries[nominationRow.country_id];
              nominationRow.turn_id = fkLib.turns[nominationRow.turn_id];
            });

            // Insert Rows
            await db.importRepo.insertCountryHistoryRows(countryHistoryRows);
            Promise.all([
              db.importRepo.insertProvinceRows(provinceRows),
              db.importRepo.insertUnitRows(unitRows),
              db.importRepo.insertOrderSetRows(orderSetRows),
              db.importRepo.insertNominationRows(nominationRows)
            ]).then(async ([
              newProvinceIds,
              newUnitIds,
              newOrderSetIds,
              newNominationIds
            ]) => {
              // Update Foreign Key Library
              for (let provinceIndex = 0; provinceIndex < provinceRows.length; provinceIndex++) {
                fkLib.provinces[provinceRows[provinceIndex].province_id] = newProvinceIds[provinceIndex];
              }

              for (let unitIndex = 0; unitIndex < unitRows.length; unitIndex++) {
                fkLib.units[unitRows[unitIndex].unit_id] = newUnitIds[unitIndex];
              }

              for (let orderSetIndex = 0; orderSetIndex < orderSetRows.length; orderSetIndex++) {
                fkLib.orderSets[orderSetRows[orderSetIndex].order_set_id] = newOrderSetIds[orderSetIndex];
              }

              for (let nominationIndex = 0; nominationIndex < nominationRows.length; nominationIndex++) {
                fkLib.nominations[nominationRows[nominationIndex].nomination_id] = newNominationIds[nominationIndex];
              }

              // Replace Foreign Keys
              provinceHistoryRows.forEach((provinceHistoryRow: any) => {
                provinceHistoryRow.province_id = fkLib.provinces[provinceHistoryRow.province_id];
                provinceHistoryRow.turn_id = fkLib.turns[provinceHistoryRow.turn_id];
                provinceHistoryRow.controller_id = fkLib.countries[provinceHistoryRow.controller_id];
              });

              terrainRows.forEach((terrainRow: any) => {
                terrainRow.province_id = fkLib.provinces[terrainRow.province_id];
              });

              labelRows.forEach((labelRow: any) => {
                labelRow.province_id = fkLib.provinces[labelRow.province_id];
              });

              labelLineRows.forEach((labelLineRow: any) => {
                labelLineRow.province_id = fkLib.provinces[labelLineRow.province_id];
              });

              nodeRows.forEach((nodeRow: any) => {
                nodeRow.province_id = fkLib.provinces[nodeRow.province_id];
              });

              voteRows.forEach((voteRow: any) => {
                voteRow.nomination_id = fkLib.nominations[voteRow.nomination_id];
                voteRow.voting_country_id = fkLib.countries[voteRow.voting_country_id];
              });

              // Insert Rows
              await db.importRepo.insertProvinceHistoryRows(provinceHistoryRows);
              await db.importRepo.insertTerrainRows(terrainRows);
              await db.importRepo.insertLabelRows(labelRows);
              await db.importRepo.insertLabelLineRows(labelLineRows);
              await db.importRepo.insertVoteRows(voteRows);

              await db.importRepo.insertNodeRows(nodeRows)
                .then(async (newNodeIds) => {
                  // Update Foreign Key Library
                  for (let nodeIndex = 0; nodeIndex < nodeRows.length; nodeIndex++) {
                    fkLib.nodes[nodeRows[nodeIndex].node_id] = newNodeIds[nodeIndex];
                  }

                  // Replace Foreign Keys and filter
                  let previousAdjacencyId = 0;
                  let spliceIds: number[] = [];

                  nodeAdjacencyRows.forEach((nodeAdjacencyRow: any, index: number) => {
                    if (nodeAdjacencyRow.node_adjacency_id === previousAdjacencyId) {
                      spliceIds.push(index);
                    } else {
                      nodeAdjacencyRow.node_1_id = fkLib.nodes[nodeAdjacencyRow.node_1_id];
                      nodeAdjacencyRow.node_2_id = fkLib.nodes[nodeAdjacencyRow.node_2_id];
                      previousAdjacencyId = nodeAdjacencyRow.node_adjacency_id;
                    }
                  });

                  for (let spliceIndex = spliceIds.length - 1; spliceIndex >= 0; spliceIndex--) {
                    nodeAdjacencyRows.splice(spliceIds[spliceIndex], 1);
                  }

                  unitHistoryRows.forEach((unitHistoryRow: any) => {
                    unitHistoryRow.unit_id = fkLib.units[unitHistoryRow.unit_id];
                    unitHistoryRow.turn_id = fkLib.turns[unitHistoryRow.turn_id];
                    unitHistoryRow.node_id = fkLib.nodes[unitHistoryRow.node_id];
                  });

                  orderOptionRows.forEach((orderOptionRow: any) => {
                    orderOptionRow.unit_id = fkLib.units[orderOptionRow.unit_id];
                    orderOptionRow.secondary_unit_id = fkLib.units[orderOptionRow.secondary_unit_id];
                    orderOptionRow.turn_id = fkLib.turns[orderOptionRow.turn_id];
                    if (orderOptionRow.destinations?.length > 0) {
                      for (let destinationIndex = 0; destinationIndex < orderOptionRow.destinations.length; destinationIndex++) {
                        orderOptionRow.destinations[destinationIndex] = fkLib.nodes[orderOptionRow.destinations[destinationIndex]];
                      }
                    }
                  });

                  orderRows.forEach((orderRow: any) => {
                    orderRow.order_set_id = fkLib.orderSets[orderRow.order_set_id];
                    orderRow.ordered_unit_id = fkLib.units[orderRow.ordered_unit_id];
                    orderRow.secondary_unit_id = fkLib.units[orderRow.secondary_unit_id];
                    orderRow.destination_id = fkLib.nodes[orderRow.destination_id];
                  });

                  orderAdjustmentRows.forEach((orderAdjustmentRow: any) => {
                    orderAdjustmentRow.order_set_id = fkLib.orderSets[orderAdjustmentRow.order_set_id];
                    orderAdjustmentRow.node_id = fkLib.nodes[orderAdjustmentRow.node_id];
                  });

                  orderTransferBuildRows.forEach((orderTransferBuildRow: any) => {
                    orderTransferBuildRow.order_set_id = fkLib.orderSets[orderTransferBuildRow.order_set_id];
                    orderTransferBuildRow.recipient_id = fkLib.countries[orderTransferBuildRow.recipient_id];
                  });

                  orderTransferTechRows.forEach((orderTransferTechRow: any) => {
                    orderTransferTechRow.order_set_id = fkLib.orderSets[orderTransferTechRow.order_set_id];
                    orderTransferTechRow.foreign_country_id = fkLib.countries[orderTransferTechRow.foreign_country_id];
                  });

                  // Insert Rows
                  Promise.all([
                    db.importRepo.insertNodeAdjacencyRows(nodeAdjacencyRows),
                    db.importRepo.insertUnitHistoryRows(unitHistoryRows),
                    db.importRepo.insertOrderOptionRows(orderOptionRows),
                    db.importRepo.insertOrderRows(orderRows),
                    db.importRepo.insertOrderAdjustmentRows(orderAdjustmentRows),
                    db.importRepo.insertOrderTransferBuildRows(orderTransferBuildRows),
                    db.importRepo.insertOrderTransferTechRows(orderTransferTechRows)
                  ]).then(() => {
                    terminalLog(`Game ${gameId} has been imported`);
                  });
                });
            });
          });
        });
    }).catch((error: Error) => {
      terminalLog(`Game ${gameId} failed to import: ${error.message}`);
    });
  }
}