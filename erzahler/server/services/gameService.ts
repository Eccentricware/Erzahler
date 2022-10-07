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
import { getAssignmentsQuery } from "../../database/queries/game/get-assignments-query";
import { getGameAdminsQuery } from "../../database/queries/game/get-game-admins-query";
import { getRegisteredPlayersQuery } from "../../database/queries/game/get-registered-players-query";
import { checkUserGameAdminQuery } from "../../database/queries/game/check-user-game-admin-query";
import { updateGameSettingsQuery } from "../../database/queries/game/update-game-settings-query";
import { updateTurnQuery } from "../../database/queries/game/update-turn-query";
import { SchedulerService } from "./schedulerService";
import { StartScheduleObject } from "../../models/start-schedule-object";
import { FormattingService } from "./formattingService";
import { getGamesQuery } from "../../database/queries/game/get-games-query";

export class GameService {
  gameData: any = {};
  user: any = undefined;
  errors: string[] = [];

  async newGame(gameData: any, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      this.user = await accountService.getUserProfile(idToken);
      const pool: Pool = new Pool(victorCredentials);
      this.gameData = gameData;

      return await this.addNewGame(pool, this.gameData)
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
          errors: this.errors
        }
      });

    } else {
      console.log('Invalid Token UID attempting to save new game');
      return {
        success: false,
        error: 'Invalid Token UID'
      }
    }
  }

  async addNewGame(pool: Pool, settings: any): Promise<any> {
    const schedulerService: SchedulerService = new SchedulerService();
    const events = schedulerService.extractEvents(settings);
    const schedule: StartScheduleObject = schedulerService.prepareStartSchedule(events);
    console.log('Schedule', schedule);

    const settingsArray: any = [
      settings.gameName,
      settings.assignmentMethod,
      settings.stylizedStartYear,
      settings.turn1Timing,
      settings.deadlineType,
      schedule.gameStart,
      settings.timeZone,
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
          await this.addTurn0(pool, schedule)
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
      'creator',
      this.gameData.gameName
    ])
    .catch((error: Error) => {
      console.log('New Assignment Error:', error.message);
      this.errors.push('New Assignment Error:' + error.message);
    });
  }

  async addTurn0(pool: Pool, schedule: StartScheduleObject): Promise<void> {
    await pool.query(insertTurnQuery, [
      schedule.gameStart,
      0,
      `Winter ${this.gameData.stylizedStartYear}`,
      'orders',
      'resolved',
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
      'orders',
      'paused',
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
    const newCountryPromises: Promise<any>[] = await this.gameData.dbRows.countries.map(async (country: any) => {
      return await pool.query(insertCountryQuery, [
        country.name,
        country.rank,
        country.color,
        country.keyName,
        this.gameData.gameName
      ])
      .catch((error: Error) => {
        console.log('Insert Country Error:', error.message);
        this.errors.push('Insert Country Error:' + error.message);
      });
    });

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
    const provincePromises: Promise<any>[] = await this.gameData.dbRows.provinces.map(async (province: any) => {
      return await pool.query(insertProvinceQuery, [
        province.name,
        province.fullName,
        province.type,
        province.voteType,
        province.cityLoc,
        this.gameData.gameName
      ])
      .catch((error: Error) => {
        console.log('Insert Province Error:', error.message);
        this.errors.push('Insert Province Error: ' + error.message);
      });
    });

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
    const provinceHistoryPromises: Promise<Query<any>>[] = this.gameData.dbRows.provinces.map(async (province: any) => {
      return await pool.query(insertInitialProvinceHistoryQuery, [
        province.status,
        province.voteColor,
        province.statusColor,
        province.strokeColor,
        province.country,
        province.owner,
        this.gameData.gameName,
        province.name
      ])
      .catch((error: Error) => {
        console.log('Insert Province History Error:', error.message);
        this.errors.push('Insert Province History Error:' + error.message);
      });
    });

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
    const nodePromises: Promise<QueryResult<any>>[] = this.gameData.dbRows.nodes.map(async (node: any) => {
      return await pool.query(insertNodeQuery, [
        node.name,
        node.type,
        node.loc,
        this.gameData.gameName,
        node.province
      ])
      .catch((error: Error) => {
        console.log('Insert Node Error:', error.message);
        this.errors.push('Insert Node Error: ' + error.message);
      });
    });

    return await Promise.all(nodePromises).then(async (nodes: any) => {
      await this.addNodeAdjacencies(pool);
      await this.addUnits(pool);
    });
  }

  async addNodeAdjacencies(pool: Pool): Promise<any> {
    const nodeAdjacencyPromises: Promise<QueryResult<any>>[] = await this.gameData.dbRows.links.map(async (link: any) => {
      return await pool.query(insertNodeAdjacencyQuery, [
        this.gameData.gameName,
        link.alpha.name,
        link.omega.name
      ])
      .catch((error: Error) => {
        console.log('Insert Node Adjacency Error:', error.message);
        this.errors.push('Insert Node Adjacency Error: ' + error.message);
      });
    });

    return await Promise.all(nodeAdjacencyPromises)
      .catch((error: Error) => {
        console.log('Node Adjacies Error ' + error.message);
        this.errors.push('Node Adjacies Error ' + error.message);
      })
  }

  async addCountryInitialHistories(pool: Pool): Promise<any> {
    const countryHistoryPromises: Promise<QueryResult<any>>[] = await this.gameData.dbRows.countries.map(async (country: any) => {
      return await pool.query(insertCountryHistoryQuery, [
        country.rank !== 'n' ? 'available' : 'npc',
        country.cities.length,
        country.units.length,
        country.bankedBuilds,
        country.nuke,
        country.adjustments,
        this.gameData.gameName,
        country.name,
      ])
      .catch((error: Error) => {
        console.log('Insert Country History Error:', error.message);
        this.errors.push('Insert Country History Error: ' + error.message);
      });
    });

    return await Promise.all(countryHistoryPromises)
      .catch((error: Error) => {
        console.log('Country History Promise Error: ' + error.message);
        this.errors.push('Country History Promise Error: ' + error.message);
      })
  }

  async addUnits(pool: Pool): Promise<any> {
    const unitPromises: Promise<QueryResult<any>>[] = await this.gameData.dbRows.units.map(async (unit: any) => {
      return await pool.query(insertUnitQuery, [
        unit.fullName,
        unit.type,
        this.gameData.gameName,
        unit.country
      ])
      .catch((error: Error) => {
        console.log('Insert Unit Error:', error.message);
        this.errors.push('Insert Unit Error: ' + error.message);
      });
    });

    return await Promise.all(unitPromises).then(async (units: any) => {
      await this.addInitialUnitHistories(pool);
    });
  }

  async addInitialUnitHistories(pool: Pool): Promise<any> {
    const initialHistoryPromises: Promise<QueryResult<any>>[] = await this.gameData.dbRows.units.map(async (unit: any) => {
      return await pool.query(insertUnitHistoryQuery, [
        'active',
        this.gameData.gameName,
        unit.fullName,
        unit.node
      ])
      .catch((error: Error) => {
        console.log('Insert Unit History Error:', error.message);
        this.errors.push('Insert Unit History Error: ' + error.message);
      });
    });

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
    const pool: Pool = new Pool(victorCredentials);
    //const token: DecodedIdToken = await accountService.validateToken(idToken);

    const games = await pool.query(getGamesQuery, [])
      .then((gamesResults: any) => {
        return formattingService.convertKeysSnakeToCamel(gamesResults);
      })
      .catch((error: Error) => {
        console.log('Get Games Query Error', error.message);
      });

      return games.rows;
  }

  async getGameData(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();
    const formattingService: FormattingService = new FormattingService();
    const pool: Pool = new Pool(victorCredentials);
    let userId = 0;
    let userTimeZone = 'Africa/Monrovia';

    if (idToken !== '') {
      const token: DecodedIdToken = await accountService.validateToken(idToken);

      if (token.uid) {
        this.user = await accountService.getUserProfile(idToken);
        userId = this.user.userId;
        userTimeZone = this.user.timeZone;
      }
    }

    console.log(userTimeZone);

    const gameData: any = await pool.query(getGameDetailsQuery, [gameId, userId, userTimeZone])
      .then((gameDataResults: any) => {
        return formattingService.convertKeysSnakeToCamel(gameDataResults.rows[0]);
      })
      .catch((error: Error) => console.log('Get Game Data Results Error: ' + error.message));

    const ruleData: any = await pool.query(getRulesInGameQuery, [gameId])
      .then((ruleDataResults: any) => {
        return ruleDataResults.rows.map((rule: any) => formattingService.convertKeysSnakeToCamel(rule));
      })
      .catch((error: Error) => console.log('Get Rule Data Results Error: ' + error.message));

    const administratorData: any = await pool.query(getGameAdminsQuery, [gameId])
      .then((adminDataResults: any) => {
        return adminDataResults.rows.map((adminAssignment: any) => formattingService.convertKeysSnakeToCamel(adminAssignment));
      })
      .catch((error: Error) => console.log('Get Administrator Data Results Error: ' + error.message));

    const assignmentData: any = await pool.query(getAssignmentsQuery, [gameId, userId])
      .then((assignmentDataResults: any) => {
        return assignmentDataResults.rows.map((assignment: any) => formattingService.convertKeysSnakeToCamel(assignment));
      })
      .catch((error: Error) => console.log('Get Assignment Data Results Error: ' + error.message));

    const registeredPlayerData: any = await pool.query(getRegisteredPlayersQuery, [gameId])
      .then((registeredPlayerDataResults: QueryResult<any>) => {
        return registeredPlayerDataResults.rows.map((player: any) => formattingService.convertKeysSnakeToCamel(player));
      })
      .catch((error: Error) => console.log('Get Registered Player Data Results Error: ' + error.message));

    gameData.rules = ruleData;
    gameData.administrators = administratorData;
    gameData.assignments = assignmentData;
    gameData.registeredPlayers = registeredPlayerData;

    gameData.ordersTime = schedulerService.timeIdentity(gameData.ordersTime);

    console.log('Providing front end ordersTime:', gameData.ordersTime);

    return gameData;
  }

  async updateGameSettings(idToken: string, gameData: any): Promise<any> {
    const accountService: AccountService = new AccountService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      const pool: Pool = new Pool(victorCredentials);

      const isAdmin = await pool.query(checkUserGameAdminQuery, [token.uid, gameData.gameId]);
      if (isAdmin) {
        const gameSettings = [
          gameData.gameName,
          gameData.assignmentMethod,
          gameData.stylizedStartYear,
          gameData.turn1Timing,
          gameData.deadlineType,
          gameData.startTime,
          gameData.timeZone,
          gameData.observeDst,
          gameData.ordersDay,
          gameData.ordersTime,
          gameData.retreatsDay,
          gameData.retreatsTime,
          gameData.adjustmentsDay,
          gameData.adjustmentsTime,
          gameData.nominationsDay,
          gameData.nominationsTime,
          gameData.votesDay,
          gameData.votesTime,
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

        console.log('Internal Game Data:', gameData);
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

        const turn1Update = await pool.query(updateTurnQuery, [gameData.firstTurnDeadline, 0, gameData.gameId])
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
            errors.push('Update Game Settings Error: ' + error.message)
            return {
              success: false,
              errors: errors
            };
          });

        console.log(errors);
      } else {
        return 'Not admin!';
      }
    }
  }
}