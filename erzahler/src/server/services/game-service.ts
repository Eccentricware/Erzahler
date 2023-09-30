import { DecodedIdToken } from 'firebase-admin/auth';
import { Pool, QueryResult } from 'pg';
import { db } from '../../database/connection';
import { envCredentials } from '../../secrets/dbCredentials';
import { AccountService } from './account-service';
import { SchedulerService } from './scheduler-service';
import { StartScheduleObject } from '../../models/objects/start-schedule-object';
import { FormattingService } from './formatting-service';
import { StartScheduleEvents } from '../../models/objects/start-schedule-events-object';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { OrdersService } from './orders-service';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { NewGameData } from '../../models/objects/games/new-game-data-object';
import { GameFinderParameters } from '../../models/objects/games/game-finder-query-objects';
import { terminalAddendum, terminalLog } from '../utils/general';

export class GameService {
  gameData: any = {};
  user: any = undefined;
  errors: string[] = [];

  async newGame(gameData: NewGameData, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();
    const optionsService: OrdersService = new OrdersService();

    this.user = await accountService.getUserProfile(idToken);
    if (!this.user.error) {
      const pool: Pool = new Pool(envCredentials);
      this.gameData = gameData;

      const newGameResult = await this.addNewGame(pool, this.gameData, this.user.timeZone)
        .then(async (newGameId: any) => {
          terminalLog(
            `New Game ${this.gameData.gameName} (${newGameId}) created by ${this.user.username} (${this.user.userId})`
          );
          return {
            success: true,
            gameId: newGameId,
            errors: this.errors
          };
        })
        .catch((error: Error) => {
          terminalLog(
            `New Game ${this.gameData.gameName} failed to create by ${this.user.username} (${this.user.userId})`
          );
          console.log('Game Response Failure:', error.message);
          this.errors.push('New Game Error' + error.message);
          return {
            success: false,
            gameId: 0,
            errors: this.errors
          };
        });

      return newGameResult;
    } else {
      console.log(`Invalid Token UID attempting to save new game ${this.gameData.gameName}`);
      return {
        success: false,
        error: 'Invalid Token UID'
      };
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

    return await db.gameRepo
      .insertGame(settingsArray)
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
    await db.gameRepo.insertAssignment(userId, undefined, 'Creator', this.gameData.gameName);
  }

  async addCoalitionSchedule(pool: Pool): Promise<void> {
    await db.gameRepo.insertCoalitionScheduleQuery(this.gameData.gameName);
  }

  async addTurn0(pool: Pool, schedule: StartScheduleObject): Promise<void> {
    await db.gameRepo
      .insertTurn([
        schedule.gameStart,
        0,
        `Winter ${this.gameData.stylizedStartYear}`,
        TurnType.ADJUSTMENTS,
        TurnStatus.RESOLVED,
        this.gameData.gameName
      ])
      .then(async (result: any) => {
        console.log('Turn 0 Added Successfully');
        await this.addCountries(pool);
      })
      .catch((error: Error) => {
        console.log('Turn 0 Error: ', error.message);
        this.errors.push('Turn 0 Error: ' + error.message);
      });
  }

  async addTurn1(pool: Pool, schedule: StartScheduleObject): Promise<void> {
    console.log('trying turn 1');
    await db.gameRepo
      .insertTurn([
        schedule.firstTurnDeadline,
        1,
        `Spring ${this.gameData.stylizedStartYear + 1}`,
        TurnType.SPRING_ORDERS,
        TurnStatus.PAUSED,
        this.gameData.gameName
      ])
      .then(async (result: QueryResult<any>) => {
        console.log('Turn 1 Added Successfully');
        return result.rows[0].turn_id;
      })
      .catch((error: Error) => {
        console.log('Turn 1 Error: ', error.message);
        this.errors.push('Turn 1 Error: ' + error.message);
        return 0;
      });
  }

  async addRulesInGame(pool: Pool): Promise<any> {
    const rulePromises: Promise<QueryResult<any>>[] = await db.gameRepo.insertRulesInGame(
      this.gameData.rules,
      this.gameData.gameName
    );

    return Promise.all(rulePromises)
      .then((rules: any) => true)
      .catch((error: Error) => {
        console.log('Rule Promises Error: ' + error.message);
        this.errors.push('Rule Promises Error: ' + error.message);
      });
  }

  async addCountries(pool: Pool): Promise<void> {
    const newCountryPromises: Promise<any>[] = await db.gameRepo.insertCountries(
      this.gameData.dbRows.countries,
      this.gameData.gameName
    );

    // console.log('newCountryPromises', newCountryPromises);

    return await Promise.all(newCountryPromises)
      .then(async (newCountryResolved) => {
        await this.addProvinces(pool);
        await this.addCountryInitialHistories(pool);
      })
      .catch((error: Error) => {
        console.log('New Country Promises Error: ' + error.message);
        this.errors.push('New Country Promises Error: ' + error.message);
      });
  }

  async addProvinces(pool: Pool): Promise<void> {
    const provincePromises: Promise<any>[] = await db.gameRepo.insertProvinces(
      this.gameData.dbRows.provinces,
      this.gameData.gameName
    );

    return await Promise.all(provincePromises).then(async () => {
      console.log('Provinces Added');
      await this.addProvinceHistories(pool);
      await this.addTerrain(pool);
      await this.addLabels(pool);
      await this.addLabelLines();
      await this.addNodes(pool);
    });
  }

  async addProvinceHistories(pool: Pool): Promise<any> {
    const provinceHistoryPromises: Promise<any>[] = await db.gameRepo.insertProvinceHistories(
      this.gameData.dbRows.provinces,
      this.gameData.gameName
    );

    return await Promise.all(provinceHistoryPromises).catch((error: Error) => {
      console.log('Province History Promises Error: ' + error.message);
      this.errors.push('Province History Promises Error: ' + error.message);
    });
  }

  async addTerrain(pool: Pool): Promise<any> {
    const terrainPromises: Promise<any>[] = await db.gameRepo.insertTerrain(
      this.gameData.dbRows.terrain,
      this.gameData.gameName
    );

    return await Promise.all(terrainPromises).catch((error: Error) => {
      console.log('Terrain Promises Error: ' + error.message);
      this.errors.push('Terrain Promises Error: ' + error.message);
    });
  }

  async addLabels(pool: Pool): Promise<any> {
    db.gameRepo.insertLabels(this.gameData.dbRows.labels, this.gameData.gameName);
  }

  async addLabelLines(): Promise<any> {
    db.gameRepo.insertLabelLines(this.gameData.dbRows.labelLines, this.gameData.gameName);
  }

  async addNodes(pool: Pool): Promise<any> {
    const nodePromises: Promise<any>[] = await db.gameRepo.insertNodes(
      this.gameData.dbRows.nodes,
      this.gameData.gameName
    );

    return await Promise.all(nodePromises).then(async (nodes: any) => {
      await this.addNodeAdjacencies(pool);
      await this.addUnits(pool);
    });
  }

  async addNodeAdjacencies(pool: Pool): Promise<any> {
    const nodeAdjacencyPromises: Promise<any>[] = await db.gameRepo.insertNodeAdjacencies(
      this.gameData.dbRows.links,
      this.gameData.gameName
    );

    return await Promise.all(nodeAdjacencyPromises).catch((error: Error) => {
      console.log('Node Adjacies Error ' + error.message);
      this.errors.push('Node Adjacies Error ' + error.message);
    });
  }

  async addCountryInitialHistories(pool: Pool): Promise<any> {
    const countryHistoryPromises: Promise<any>[] = await db.gameRepo.insertInitialCountryHistories(
      this.gameData.dbRows.countries,
      this.gameData.gameName
    );

    return await Promise.all(countryHistoryPromises).catch((error: Error) => {
      console.log('Country History Promise Error: ' + error.message);
      this.errors.push('Country History Promise Error: ' + error.message);
    });
  }

  async addUnits(pool: Pool): Promise<any> {
    const unitPromises: Promise<any>[] = await db.gameRepo.insertUnits(
      this.gameData.dbRows.units,
      this.gameData.gameName
    );

    return await Promise.all(unitPromises).then(async (units: any) => {
      await this.addInitialUnitHistories(pool);
    });
  }

  async addInitialUnitHistories(pool: Pool): Promise<any> {
    const initialHistoryPromises: Promise<any>[] = await db.gameRepo.insertInitialUnitHistories(
      this.gameData.dbRows.units,
      this.gameData.gameName
    );

    return await Promise.all(initialHistoryPromises).catch((error: Error) => {
      console.log('Initial History Promise Error: ' + error.message);
      this.errors.push('Initial History Promise Error: ' + error.message);
    });
  }

  async checkGameNameAvailability(gameName: string): Promise<boolean> {
    const gameNameResults: QueryResult<any> = await db.gameRepo.checkGameNameAvailable(gameName);

    return gameNameResults.rowCount === 0;
  }

  async findGames(idToken: string, params: GameFinderParameters): Promise<any> {
    const accountService: AccountService = new AccountService();

    let userId = 0;
    let username = 'Guest';
    let userTimeZone = 'Africa/Monrovia';
    let meridiemTime = false;

    if (idToken) {
      // const token: DecodedIdToken = await accountService.validateToken(idToken);

      this.user = await accountService.getUserProfile(idToken);
      if (!this.user.error) {
        userId = this.user.userId;
        username = this.user.username;
        userTimeZone = this.user.timeZone;
        meridiemTime = this.user.meridiemTime;
      }
    }

    terminalLog(`Finding games for ${username} (${userId})`);
    terminalAddendum('Params', JSON.stringify(params));
    const gameResults: any = await db.gameRepo.getGames(userId, params, userTimeZone, meridiemTime);

    return gameResults;
  }

  async getGameData(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();
    const formattingService: FormattingService = new FormattingService();
    const pool: Pool = new Pool(envCredentials);
    let userId = 0;
    let username = 'Guest';
    let userTimeZone = 'Africa/Monrovia';
    let meridiemTime = false;

    if (idToken) {
      // const token: DecodedIdToken = await accountService.validateToken(idToken);

      this.user = await accountService.getUserProfile(idToken);
      if (!this.user.error) {
        userId = this.user.userId;
        username = this.user.username;
        userTimeZone = this.user.timeZone;
        meridiemTime = this.user.meridiemTime;
      }
    }

    terminalLog(`${username} (${userId}) Requested Game Data: ${gameId}`);
    const gameData: any = await db.gameRepo.getGameDetails(gameId, userId, userTimeZone, meridiemTime);
    const ruleData: any = await db.gameRepo.getRulesInGame(gameId);
    const playerRegistration: any = await db.gameRepo.getPlayerRegistrationStatus(gameId, userId);

    gameData.rules = ruleData;
    gameData.playerRegistration = playerRegistration;

    gameData.ordersTime = schedulerService.timeIdentity(gameData.ordersTime);
    return gameData;
  }

  async updateGameSettings(idToken: string, gameData: any): Promise<any> {
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();

    const token: DecodedIdToken = await accountService.validateToken(idToken);
    if (token.uid) {
      const isAdmin = await db.gameRepo.isGameAdmin(token.uid, gameData.gameId);

      if (isAdmin) {
        this.user = await accountService.getUserProfile(idToken);
        terminalLog(
          `Updating Game Settings: ${gameData.gameName} (${gameData.gameId}) | ${this.user.username} (${this.user.userId})`
        );
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
        await db.gameRepo
          .updateGameSettings(gameSettings)
          .then((result: any) => {
            return {
              success: true,
              message: 'Game Updated'
            };
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
        terminalLog(
          `WARNING! Non-Admin Update Game Settings Attempt: ${gameData.gameName} (${gameData.gameId}) | ${this.user.username} (${this.user.userId})`
        );
        return 'Not admin!';
      }
    }
  }

  /**
   * Top level route handler at the request of a game administrator.
   * Initializes a game into an actionable state.
   * Adds first turn, processes and saves unit options.
   * Sets time for game start and assignments reveal.
   * Sets time for first turn orders deadline.
   *
   * @param idToken
   * @param gameId
   */
  async declareReady(idToken: string, gameId: number): Promise<any> {
    const schedulerService: SchedulerService = new SchedulerService();

    const gameData = await this.getGameData(idToken, gameId);
    terminalLog(`Game Declared Ready: ${gameData.gameName} (${gameData.gameId})`);

    // TO-DO Restore to registration clause after troubleshooting && gameData.gameStatus === GameStatus.REGISTRATION
    if (gameData.isAdmin) {
      await schedulerService.readyGame(gameData);
    }
  }

  async getGameStats(gameId: number): Promise<any> {
    terminalLog(`Game Stats Requested: ${gameId}`);
    const gameState = await db.gameRepo.getGameState(gameId);
    const countryStats = await db.gameRepo.getGameStats(gameId, gameState.turnNumber);
    return { countries: countryStats };
  }
}
