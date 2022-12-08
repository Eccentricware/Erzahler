import { DecodedIdToken } from "firebase-admin/auth";
import { Pool, Query, QueryResult } from "pg";
import { checkGameNameAvailabilityQuery } from "../../database/queries/game/check-game-name-availability-query";
import { insertAssignmentQuery } from "../../database/queries/game/insert-assignment-query";
import { insertCountryHistoryQuery } from "../../database/queries/game/insert-country-history-query";
import { insertCountryQuery } from "../../database/queries/game/insert-country-query";
import { insertNewGameQuery } from "../../database/queries/game/insert-game-query";
import { insertLabelQuery } from "../../database/queries/game/insert-label-query";
import { insertNodeAdjacencyQuery } from "../../database/queries/game/insert-node-adjacency-query";
import { insertNodeQuery } from "../../database/queries/game/insert-node-query";
import { insertInitialProvinceHistoryQuery } from "../../database/queries/game/insert-initial-province-history-query";
import { insertProvinceQuery } from "../../database/queries/game/insert-province-query";
import { insertRuleInGameQuery } from "../../database/queries/game/insert-rule-in-game-query";
import { insertTerrainQuery } from "../../database/queries/game/insert-terrain-query";
import { insertTurnQuery } from "../../database/queries/game/insert-turn-query";
import { insertUnitHistoryQuery } from "../../database/queries/game/insert-unit-history-query";
import { insertUnitQuery } from "../../database/queries/game/insert-unit-query";
import { victorCredentials } from "../../secrets/dbCredentials";
import { AccountService } from "./accountService";
import { getGameDetailsQuery } from "../../database/queries/game/get-game-details-query";
import { getRulesInGameQuery } from "../../database/queries/game/get-rules-in-game-query";
import { checkUserGameAdminQuery } from "../../database/queries/game/check-user-game-admin-query";
import { updateGameSettingsQuery } from "../../database/queries/game/update-game-settings-query";
import { updateTurnQuery } from "../../database/queries/game/update-turn-query";
import { SchedulerService } from "./scheduler-service";
import { StartScheduleObject } from "../../models/objects/start-schedule-object";
import { FormattingService } from "./formattingService";
import { getGamesQuery } from "../../database/queries/game/get-games-query";
import { GameSummaryBuilder } from "../../models/classes/game-summary-builder";
import { GameSummaryQueryObject } from "../../models/objects/game-summary-query-object";
import { getPlayerRegistrationStatus } from "../../database/queries/assignments/get-player-registration-status";
import { GameDetailsBuilder } from "../../models/classes/game-details-builder";
import { startGameQuery } from "../../database/queries/game/start-game-query";
import { StartScheduleEvents } from "../../models/objects/start-schedule-events-object";
import schedule from 'node-schedule';
import { TurnStatus } from "../../models/enumeration/turn-status-enum";
import { StartDetails } from "../../models/objects/initial-times-object";
import { ResolutionService } from "./resolutionService";
import { GameStatus } from "../../models/enumeration/game-status-enum";
import { setAssignmentsActiveQuery } from "../../database/queries/assignments/set-assignments-active-query";
import { OptionsService } from "./optionsService";
import { TurnType } from "../../models/enumeration/turn-type-enum";
import { insertCoalitionScheduleQuery } from "../../database/queries/game/insert-coalition-schedule-query";

export class GameService {
  gameData: any = {};
  user: any = undefined;
  errors: string[] = [];

  async newGame(gameData: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();
    const optionsService: OptionsService = new OptionsService();

    // const token: DecodedIdToken = await accountService.validateToken(idToken);
    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const pool: Pool = new Pool(victorCredentials);
      this.gameData = gameData;

      const newGameResult = await this.addNewGame(pool, this.gameData, this.user.timeZone)
        .then((newGameId: any) => {
          pool.end();
          return {
            success: true,
            gameId: newGameId,
            errors: this.errors
          };
        })
        .catch((error: Error) => {
          console.log('Game Response Failure:', error.message)
          this.errors.push('New Game Error' + error.message);
          pool.end();
          return {
            success: false,
            gameId: 0,
            errors: this.errors
          }
        });

      return newGameResult;

    } else {
      console.log('Invalid Token UID attempting to save new game');
      return {
        success: false,
        error: 'Invalid Token UID'
      }
    }
  }

  async addNewGame(pool: Pool, settings: any, userTimeZoneName: string): Promise<any> {
    const schedulerService: SchedulerService = new SchedulerService();
    const events: StartScheduleEvents = schedulerService.extractEvents(settings, userTimeZoneName);
    const schedule: StartScheduleObject = schedulerService.prepareStartSchedule(events);
    console.log('Schedule', schedule);

    const settingsArray: any = [
      settings.gameName,
      settings.assignmentMethod,
      settings.stylizedStartYear,
      settings.turn1Timing,
      settings.deadlineType,
      schedule.gameStart,
      settings.observeDst,
      schedule.orders.day,
      schedule.orders.time,
      schedule.retreats.day,
      schedule.retreats.time,
      schedule.adjustments.day,
      schedule.adjustments.time,
      schedule.nominations.day,
      schedule.nominations.time,
      schedule.votes.day,
      schedule.votes.time,
      settings.nmrTolerance,
      settings.concurrentGamesLimit,
      settings.privateGame,
      settings.hiddenGame,
      settings.blindCreator,
      settings.finalReadinessCheck,
      settings.voteDeadlineExtension,
      settings.partialRosterStart,
      settings.nominationTiming,
      settings.nominationYear,
      settings.automaticAssignments,
      settings.ratingLimits,
      settings.funRange[0],
      settings.funRange[1],
      settings.skillRange[0],
      settings.skillRange[1]
    ];

    return await pool.query(insertNewGameQuery, settingsArray)
      .then(async (results: QueryResult<any>) => {
        const newGame = results.rows[0];
        console.log('Game Row Added Successfully');

        return await Promise.all([
          await this.addCreatorAssignment(pool, this.user.userId),
          await this.addRulesInGame(pool),
          await this.addTurn0(pool, schedule),
          await this.addCoalitionSchedule(pool)
        ]).then(() => {
          return newGame.game_id;
        });

      })
      .catch((error: Error) => {
        console.log('New game Error:', error.message);
        this.errors.push('New Game Error: ' + error.message);
      });
  }

  async addCreatorAssignment(pool: Pool, userId: number): Promise<void> {
    await pool.query(insertAssignmentQuery, [
      userId,
      null,
      'Creator',
      this.gameData.gameName
    ])
    .catch((error: Error) => {
      console.log('New Assignment Error:', error.message);
      this.errors.push('New Assignment Error:' + error.message);
    });
  }

  async addCoalitionSchedule(pool: Pool): Promise<void> {
    await pool.query(insertCoalitionScheduleQuery, [
      50,
      1,
      undefined,
      9,
      6,
      3,
      1,
      0,
      undefined,
      undefined,
      undefined,
      'ABB',
      undefined,
      this.gameData.gameName
    ])
    .catch((error: Error) => {
      console.log('Add Coalition Error:', error.message);
      this.errors.push('Add Coalition Error:' + error.message);
    })
  }

  async addTurn0(pool: Pool, schedule: StartScheduleObject): Promise<void> {
    await pool.query(insertTurnQuery, [
      schedule.gameStart,
      0,
      `Winter ${this.gameData.stylizedStartYear}`,
      TurnType.ADJUSTMENTS,
      TurnStatus.RESOLVED,
      this.gameData.gameName
    ])
    .then(async (result: any) => {
      console.log('Turn 0 Added Successfully');
      await this.addTurn1(pool, schedule);
    })
    .catch((error: Error) => {
      console.log('Turn 0 Error: ', error.message);
      this.errors.push('Turn 0 Error: ' + error.message);
    });
  }

  async addTurn1(pool: Pool, schedule: StartScheduleObject): Promise<void> {
    console.log('trying turn 1');
    await pool.query(insertTurnQuery, [
      schedule.firstTurnDeadline,
      1,
      `Spring ${this.gameData.stylizedStartYear + 1}`,
      TurnType.SPRING_ORDERS,
      TurnStatus.PAUSED,
      this.gameData.gameName
    ])
    .then(async (result: any) => {
      console.log('Turn 1 Added Successfully');
      await this.addCountries(pool);
    })
    .catch((error: Error) => {
      console.log('Turn 1 Error: ', error.message);
      this.errors.push('Turn 1 Error: ' + error.message);
      return 0;
    });
  }

  async addRulesInGame(pool: Pool): Promise<any> {
    const rulePromises: Promise<QueryResult<any>>[] = await this.gameData.rules.map(async (rule: any) => {
      return await pool.query(insertRuleInGameQuery, [
        this.gameData.gameName,
        rule.key,
        rule.enabled
      ])
      .catch((error: Error) => {
        console.log('Rule In Games Error:', error.message);
        this.errors.push('Error adding Rule In Game: ' + error.message);
      });
    });

    return Promise.all(rulePromises)
      .then((rules: any) => true)
      .catch((error: Error) => {
        console.log('Rule Promises Error: ' + error.message);
        this.errors.push('Rule Promises Error: ' + error.message);
      });
  }

  async addCountries(pool: Pool): Promise<void> {
    const newCountryPromises: Promise<any>[] = [];

    for (let countryName in this.gameData.dbRows.countries) {
      newCountryPromises.push(pool.query(insertCountryQuery, [
        this.gameData.dbRows.countries[countryName].name,
        this.gameData.dbRows.countries[countryName].rank,
        this.gameData.dbRows.countries[countryName].color,
        this.gameData.dbRows.countries[countryName].keyName,
        this.gameData.gameName
      ])
      .catch((error: Error) => {
        console.log('Insert Country Error:', error.message);
        this.errors.push('Insert Country Error:' + error.message);
      }));
    }

    // console.log('newCountryPromises', newCountryPromises);

    return await Promise.all(newCountryPromises)
      .then(async () => {
        await this.addProvinces(pool);
        await this.addCountryInitialHistories(pool);
      })
      .catch((error: Error) => {
        console.log('New Country Promises Error: ' + error.message);
        this.errors.push('New Country Promises Error: ' + error.message);
      });
  }

  async addProvinces(pool: Pool): Promise<void> {
    const provincePromises: Promise<any>[] = [];
    for (let provinceName in this.gameData.dbRows.provinces) {
      provincePromises.push(pool.query(insertProvinceQuery, [
        this.gameData.dbRows.provinces[provinceName].name,
        this.gameData.dbRows.provinces[provinceName].fullName,
        this.gameData.dbRows.provinces[provinceName].type,
        this.gameData.dbRows.provinces[provinceName].voteType,
        this.gameData.dbRows.provinces[provinceName].cityLoc,
        this.gameData.gameName
      ])
      .catch((error: Error) => {
        console.log('Insert Province Error:', error.message);
        this.errors.push('Insert Province Error: ' + error.message);
      }));
    }

    return await Promise.all(provincePromises)
      .then(async (resolvedProvincePromises) => {
        console.log('Provinces Added');
        await this.addProvinceHistories(pool);
        await this.addTerrain(pool);
        await this.addLabels(pool);
        await this.addNodes(pool);
      });
  }

  async addProvinceHistories(pool: Pool): Promise<any> {
    const provinceHistoryPromises: Promise<any>[] = [];

    for (let provinceName in this.gameData.dbRows.provinces) {
      provinceHistoryPromises.push(pool.query(insertInitialProvinceHistoryQuery, [
        this.gameData.dbRows.provinces[provinceName].status,
        this.gameData.dbRows.provinces[provinceName].voteColor,
        this.gameData.dbRows.provinces[provinceName].statusColor,
        this.gameData.dbRows.provinces[provinceName].strokeColor,
        this.gameData.dbRows.provinces[provinceName].country,
        this.gameData.dbRows.provinces[provinceName].owner,
        this.gameData.gameName,
        this.gameData.dbRows.provinces[provinceName].name
      ])
      .catch((error: Error) => {
        console.log('Insert Province History Error:', error.message);
        this.errors.push('Insert Province History Error:' + error.message);
      }));
    }

    return await Promise.all(provinceHistoryPromises)
      .catch((error: Error) => {
        console.log('Province History Promises Error: ' + error.message);
        this.errors.push('Province History Promises Error: ' + error.message);
      })
  }

  async addTerrain(pool: Pool): Promise<any> {
    const terrainPromises: Promise<QueryResult<any>>[] = await this.gameData.dbRows.terrain.map(async (terrain: any) => {
      return await pool.query(insertTerrainQuery, [
        terrain.type,
        terrain.renderCategory,
        terrain.points,
        terrain.bounds.top,
        terrain.bounds.left,
        terrain.bounds.right,
        terrain.bounds.bottom,
        terrain.start,
        terrain.end,
        this.gameData.gameName,
        terrain.province,
      ])
      .catch((error: Error) => {
        console.log('Insert Terrain Error:', error.message);
        this.errors.push('Insert Terrain Error:' + error.message);
      });
    });


    return await Promise.all(terrainPromises)
      .catch((error: Error) => {
        console.log('Terrain Promises Error: ' + error.message);
        this.errors.push('Terrain Promises Error: ' + error.message);
      })
  }

  async addLabels(pool: Pool): Promise<any> {
    this.gameData.dbRows.labels.forEach(async (label: any) => {
      await pool.query(insertLabelQuery, [
        label.name,
        label.type,
        label.loc,
        label.text,
        label.fill,
        this.gameData.gameName,
        label.province
      ])
      .catch((error: Error) => {
        console.log('Insert Label Error:', error.message);
        this.errors.push('Insert Label Error: ' + error.message);
      });
    });
  }

  async addNodes(pool: Pool): Promise<any> {
    const nodePromises: Promise<any>[] = [];

    for (let nodeName in this.gameData.dbRows.nodes) {
      nodePromises.push(pool.query(insertNodeQuery, [
        this.gameData.dbRows.nodes[nodeName].name,
        this.gameData.dbRows.nodes[nodeName].type,
        this.gameData.dbRows.nodes[nodeName].loc,
        this.gameData.gameName,
        this.gameData.dbRows.nodes[nodeName].province
      ])
      .catch((error: Error) => {
        console.log('Insert Node Error:', error.message);
        this.errors.push('Insert Node Error: ' + error.message);
      }));
    }

    return await Promise.all(nodePromises).then(async (nodes: any) => {
      await this.addNodeAdjacencies(pool);
      await this.addUnits(pool);
    });
  }

  async addNodeAdjacencies(pool: Pool): Promise<any> {
    const nodeAdjacencyPromises: Promise<any>[] = [];
    for (let linkName in this.gameData.dbRows.links) {
      nodeAdjacencyPromises.push(pool.query(insertNodeAdjacencyQuery, [
        this.gameData.gameName,
        this.gameData.dbRows.links[linkName].alpha.name,
        this.gameData.dbRows.links[linkName].omega.name
      ])
      .catch((error: Error) => {
        console.log('Insert Node Adjacency Error:', error.message);
        this.errors.push('Insert Node Adjacency Error: ' + error.message);
      }))
    }

    return await Promise.all(nodeAdjacencyPromises)
      .catch((error: Error) => {
        console.log('Node Adjacies Error ' + error.message);
        this.errors.push('Node Adjacies Error ' + error.message);
      });
  }

  async addCountryInitialHistories(pool: Pool): Promise<any> {
    const countryHistoryPromises: Promise<any>[] = [];
    for (let countryName in this.gameData.dbRows.countries) {
      countryHistoryPromises.push(pool.query(insertCountryHistoryQuery, [
        this.gameData.dbRows.countries[countryName].rank !== 'n' ? 'available' : 'npc',
        this.gameData.dbRows.countries[countryName].cities.length,
        this.gameData.dbRows.countries[countryName].units.length,
        this.gameData.dbRows.countries[countryName].bankedBuilds,
        this.gameData.dbRows.countries[countryName].nuke,
        this.gameData.dbRows.countries[countryName].adjustments,
        this.gameData.gameName,
        this.gameData.dbRows.countries[countryName].name,
      ])
      .catch((error: Error) => {
        console.log('Insert Country History Error:', error.message);
        this.errors.push('Insert Country History Error: ' + error.message);
      }));
    }

    return await Promise.all(countryHistoryPromises)
      .catch((error: Error) => {
        console.log('Country History Promise Error: ' + error.message);
        this.errors.push('Country History Promise Error: ' + error.message);
      })
  }

  async addUnits(pool: Pool): Promise<any> {
    const unitPromises: Promise<any>[] = [];
    for (let unitName in this.gameData.dbRows.units) {
      unitPromises.push(pool.query(insertUnitQuery, [
        this.gameData.dbRows.units[unitName].fullName,
        this.gameData.dbRows.units[unitName].type,
        this.gameData.gameName,
        this.gameData.dbRows.units[unitName].country
      ])
      .catch((error: Error) => {
        console.log('Insert Unit Error:', error.message);
        this.errors.push('Insert Unit Error: ' + error.message);
      }))
    }

    return await Promise.all(unitPromises).then(async (units: any) => {
      await this.addInitialUnitHistories(pool);
    });
  }

  async addInitialUnitHistories(pool: Pool): Promise<any> {
    const initialHistoryPromises: Promise<any>[] = [];
    for (let unitName in this.gameData.dbRows.units) {
      initialHistoryPromises.push(pool.query(insertUnitHistoryQuery, [
        'Active',
        this.gameData.gameName,
        this.gameData.dbRows.units[unitName].fullName,
        this.gameData.dbRows.units[unitName].node
      ])
      .catch((error: Error) => {
        console.log('Insert Unit History Error:', error.message);
        this.errors.push('Insert Unit History Error: ' + error.message);
      }))
    }

    return await Promise.all(initialHistoryPromises)
      .catch((error: Error) => {
        console.log('Initial History Promise Error: ' + error.message);
        this.errors.push('Initial History Promise Error: ' + error.message);
      });
  }

  async checkGameNameAvailability(gameName: string): Promise<boolean> {
    const pool: Pool = new Pool(victorCredentials);

    const gameNameResults: QueryResult<any> = await pool.query(checkGameNameAvailabilityQuery, [gameName]);

    return gameNameResults.rowCount === 0;
  }

  async findGames(idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();
    const formattingService: FormattingService  = new FormattingService();
    const schedulerService: SchedulerService = new SchedulerService();
    const pool: Pool = new Pool(victorCredentials);
    let userId = 0;
    let userTimeZone = 'Africa/Monrovia';
    let meridiemTime = false;

    if (idToken) {
      // const token: DecodedIdToken = await accountService.validateToken(idToken);

      this.user = await accountService.getUserProfile(idToken);
      if (!this.user.error) {
        userId = this.user.userId;
        userTimeZone = this.user.timeZone;
        meridiemTime = this.user.meridiemTime;
      }
    }

    const gameResults: any = await pool.query(getGamesQuery, [userTimeZone])
      .then((gamesResults: QueryResult<any>) => {
        return gamesResults.rows.map((game: GameSummaryQueryObject) => {
          return new GameSummaryBuilder(game, userTimeZone, meridiemTime);
        });
      })
      .catch((error: Error) => {
        console.log('Get Games Query Error', error.message);
      });

    return gameResults;
  }

  async getGameData(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();
    const formattingService: FormattingService = new FormattingService();
    const pool: Pool = new Pool(victorCredentials);
    let userId = 0;
    let userTimeZone = 'Africa/Monrovia';
    let meridiemTime = false;

    if (idToken) {
      // const token: DecodedIdToken = await accountService.validateToken(idToken);

      this.user = await accountService.getUserProfile(idToken);
      if (!this.user.error) {
        userId = this.user.userId;
        userTimeZone = this.user.timeZone;
        meridiemTime = this.user.meridiemTime;
      }
    }

    const gameData: any = await pool.query(getGameDetailsQuery, [gameId, userId, userTimeZone])
      .then((gameDataResults: any) => {
        return new GameDetailsBuilder(gameDataResults.rows[0], userTimeZone, meridiemTime);
      })
      .catch((error: Error) => console.log('Get Game Data Results Error: ' + error.message));

    const ruleData: any = await pool.query(getRulesInGameQuery, [gameId])
      .then((ruleDataResults: any) => {
        return ruleDataResults.rows.map((rule: any) => formattingService.convertKeysSnakeToCamel(rule));
      })
      .catch((error: Error) => console.log('Get Rule Data Results Error: ' + error.message));

    const playerRegistration: any = await pool.query(getPlayerRegistrationStatus, [gameId, userId])
      .then((playerRegistrationResults: any) => {
        return playerRegistrationResults.rows.map((registrationType: any) => formattingService.convertKeysSnakeToCamel(registrationType));
      })
      .catch((error: Error) => console.log('Get Player Registration Types Results Error: ' + error.message));

    gameData.rules = ruleData;
    gameData.playerRegistration = playerRegistration;

    gameData.ordersTime = schedulerService.timeIdentity(gameData.ordersTime);
    return gameData;
  }

  async updateGameSettings(idToken: string, gameData: any): Promise<any> {
    console.log('triggering save');
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      const pool: Pool = new Pool(victorCredentials);

      const isAdmin = await pool.query(checkUserGameAdminQuery, [token.uid, gameData.gameId]);
      if (isAdmin) {
        this.user = await accountService.getUserProfile(idToken);
        const events = schedulerService.extractEvents(gameData, this.user.timeZone);
        const schedule: StartScheduleObject = schedulerService.prepareStartSchedule(events);

        const gameSettings = [
          gameData.gameName,
          gameData.assignmentMethod,
          gameData.stylizedStartYear,
          gameData.turn1Timing,
          gameData.deadlineType,
          schedule.gameStart,
          gameData.observeDst,
          schedule.orders.day,
          schedule.orders.time,
          schedule.retreats.day,
          schedule.retreats.time,
          schedule.adjustments.day,
          schedule.adjustments.time,
          schedule.nominations.day,
          schedule.nominations.time,
          schedule.votes.day,
          schedule.votes.time,
          gameData.nmrTolerance,
          gameData.concurrentGamesLimit,
          gameData.privateGame,
          gameData.hiddenGame,
          gameData.blindCreator,
          gameData.finalReadinessCheck,
          gameData.voteDeadlineExtension,
          gameData.partialRosterStart,
          gameData.nominationTiming,
          gameData.nominationYear,
          gameData.automaticAssignments,
          gameData.ratingLimits,
          gameData.funRange[0],
          gameData.funRange[1],
          gameData.skillRange[0],
          gameData.skillRange[1],
          gameData.gameId
        ];
        const errors: string[] = [];

        // console.log('Internal Game Data:', gameData);
        const gameUpdate = await pool.query(updateGameSettingsQuery, gameSettings)
        .catch((error: Error) => {
          console.log('Update Game Error: ' + error.message);
          errors.push('Update Game Error: ' + error.message);
        });

        const turn0Update = await pool.query(updateTurnQuery, [gameData.gameStart, 0, gameData.gameId])
          .catch((error: Error) => {
            console.log('Update Turn 0 Error: ' + error.message);
            errors.push('Update Turn 0 Error: ' + error.message);
          });

        const turn1Update = await pool.query(updateTurnQuery, [gameData.firstTurnDeadline, 1, gameData.gameId])
          .catch((error: Error) => {
            console.log('Update Turn 1 Error: ' + error.message);
            errors.push('Update Turn 1 Error: ' + error.message);
          });

        return Promise.all([gameUpdate, turn0Update, turn1Update])
          .then((result: any) => {
            return {
              success: true,
              message: 'Game Updated'
            }
          })
          .catch((error: Error) => {
            errors.push('Update Game Settings Error: ' + error.message);
            console.log('Update Game Settings Error: ' + error.message);
            return {
              success: false,
              errors: errors
            };
          });
      } else {
        return 'Not admin!';
      }
    }
  }

  async declareReady(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const gameData = await this.getGameData(idToken, gameId);

      if (gameData.displayAsAdmin && gameData.gameStatus === GameStatus.REGISTRATION) {
        await schedulerService.prepareGameStart(gameData);
      }
    }
  }
}