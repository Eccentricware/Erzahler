import { DecodedIdToken } from 'firebase-admin/auth';
import { QueryResult } from 'pg';
import { db } from '../../database/connection';
import { AccountService } from './account-service';
import { SchedulerService } from './scheduler-service';
import { StartScheduleObject } from '../../models/objects/start-schedule-object';
import { StartScheduleEvents } from '../../models/objects/start-schedule-events-object';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { NewGameData } from '../../models/objects/games/new-game-data-object';
import { GameFinderParameters } from '../../models/objects/games/game-finder-query-objects';
import { terminalAddendum, terminalLog } from '../utils/general';
import { UserProfile } from '../../models/objects/user-profile-object';

export class GameService {
  async newGame(gameData: NewGameData, idToken: string): Promise<any> {
    const accountService: AccountService = new AccountService();
    const errors: string[] = [];

    const user = await accountService.getUserProfile(idToken);
    if (user) {
      const newGameResult = await this.addNewGame(gameData, user, errors)
        .then(async (newGameId: number) => {
          terminalLog(`New Game ${gameData.gameName} (${newGameId}) created by ${user.username} (${user.userId})`);
          return {
            success: true,
            gameId: newGameId,
            errors: errors
          };
        })
        .catch((error: Error) => {
          terminalLog(`New Game ${gameData.gameName} failed to create by ${user.username} (${user.userId})`);
          console.log('Game Response Failure:', error.message);
          errors.push('New Game Error' + error.message);
          return {
            success: false,
            gameId: 0,
            errors: errors
          };
        });

      return newGameResult;
    } else {
      console.log(`Invalid Token UID attempting to save new game ${gameData.gameName}`);
      return {
        success: false,
        error: 'Invalid Token UID'
      };
    }
  }

  async addNewGame(gameData: NewGameData, user: UserProfile, errors: string[]): Promise<any> {
    const schedulerService: SchedulerService = new SchedulerService();
    const events: StartScheduleEvents = schedulerService.extractEvents(gameData, user.timeZone);
    const schedule: StartScheduleObject = schedulerService.prepareStartSchedule(events);
    console.log('Schedule', schedule);

    const settingsArray = [
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
      gameData.skillRange[1]
    ];

    return await db.gameRepo
      .insertGame(settingsArray)
      .then(async (results: QueryResult<any>) => {
        const newGame = results.rows[0];
        console.log('Game Row Added Successfully');

        return await Promise.all([
          await this.addCreatorAssignment(gameData, user.userId),
          await this.addRulesInGame(gameData, errors),
          await this.addTurn0(gameData, schedule, errors),
          await this.addCoalitionSchedule(gameData, gameData.coalitionSchedule)
        ]).then(() => {
          return newGame.game_id;
        });
      })
      .catch((error: Error) => {
        console.log('New game Error:', error.message);
        errors.push('New Game Error: ' + error.message);
      });
  }

  async addCreatorAssignment(gameData: NewGameData, userId: number): Promise<void> {
    await db.gameRepo.insertAssignment(userId, undefined, 'Creator', gameData.gameName);
  }

  async addCoalitionSchedule(gameData: NewGameData, coalitionSchedule: any): Promise<void> {
    await db.gameRepo.insertCoalitionScheduleQuery(gameData.gameName, coalitionSchedule);
  }

  async addTurn0(gameData: NewGameData, schedule: StartScheduleObject, errors: string[]): Promise<void> {
    await db.gameRepo
      .insertTurn([
        schedule.gameStart,
        0,
        `Winter ${gameData.stylizedStartYear}`,
        TurnType.ADJUSTMENTS,
        TurnStatus.RESOLVED,
        gameData.gameName
      ])
      .then(async (result: any) => {
        console.log('Turn 0 Added Successfully');
        await this.addCountries(gameData, errors);
      })
      .catch((error: Error) => {
        console.log('Turn 0 Error: ', error.message);
        errors.push('Turn 0 Error: ' + error.message);
      });
  }

  async addTurn1(gameData: NewGameData, schedule: StartScheduleObject, errors: string[]): Promise<void> {
    console.log('trying turn 1');
    await db.gameRepo
      .insertTurn([
        schedule.firstTurnDeadline,
        1,
        `Spring ${gameData.stylizedStartYear + 1}`,
        TurnType.SPRING_ORDERS,
        TurnStatus.PAUSED,
        gameData.gameName
      ])
      .then(async (result: QueryResult<any>) => {
        console.log('Turn 1 Added Successfully');
        return result.rows[0].turn_id;
      })
      .catch((error: Error) => {
        console.log('Turn 1 Error: ', error.message);
        errors.push('Turn 1 Error: ' + error.message);
        return 0;
      });
  }

  async addRulesInGame(gameData: NewGameData, errors: string[]): Promise<any> {
    const rulePromises: Promise<QueryResult<any>>[] = await db.gameRepo.insertRulesInGame(
      gameData.rules,
      gameData.gameName
    );

    return Promise.all(rulePromises)
      .then((rules: any) => true)
      .catch((error: Error) => {
        console.log('Rule Promises Error: ' + error.message);
        errors.push('Rule Promises Error: ' + error.message);
      });
  }

  async addCountries(gameData: NewGameData, errors: string[]): Promise<void> {
    const newCountryPromises: Promise<any>[] = await db.gameRepo.insertCountries(
      gameData.dbRows.countries,
      gameData.gameName
    );

    // console.log('newCountryPromises', newCountryPromises);

    return await Promise.all(newCountryPromises)
      .then(async () => {
        await this.addProvinces(gameData, errors);
        await this.addCountryInitialHistories(gameData, errors);
      })
      .catch((error: Error) => {
        console.log('New Country Promises Error: ' + error.message);
        errors.push('New Country Promises Error: ' + error.message);
      });
  }

  async addProvinces(gameData: NewGameData, errors: string[]): Promise<void> {
    const provincePromises: Promise<any>[] = await db.gameRepo.insertProvinces(
      gameData.dbRows.provinces,
      gameData.gameName
    );

    return await Promise.all(provincePromises).then(async () => {
      console.log('Provinces Added');
      await this.addProvinceHistories(gameData, errors);
      await this.addTerrain(gameData, errors);
      await this.addLabels(gameData);
      await this.addLabelLines(gameData);
      await this.addNodes(gameData, errors);
    });
  }

  async addProvinceHistories(gameData: NewGameData, errors: string[]): Promise<any> {
    const provinceHistoryPromises: Promise<any>[] = await db.gameRepo.insertProvinceHistories(
      gameData.dbRows.provinces,
      gameData.gameName
    );

    return await Promise.all(provinceHistoryPromises).catch((error: Error) => {
      console.log('Province History Promises Error: ' + error.message);
      errors.push('Province History Promises Error: ' + error.message);
    });
  }

  async addTerrain(gameData: NewGameData, errors: string[]): Promise<any> {
    const terrainPromises: Promise<any>[] = await db.gameRepo.insertTerrain(gameData.dbRows.terrain, gameData.gameName);

    return await Promise.all(terrainPromises).catch((error: Error) => {
      console.log('Terrain Promises Error: ' + error.message);
      errors.push('Terrain Promises Error: ' + error.message);
    });
  }

  async addLabels(gameData: NewGameData): Promise<any> {
    db.gameRepo.insertLabels(gameData.dbRows.labels, gameData.gameName);
  }

  async addLabelLines(gameData: NewGameData): Promise<any> {
    db.gameRepo.insertLabelLines(gameData.dbRows.labelLines, gameData.gameName);
  }

  async addNodes(gameData: NewGameData, errors: string[]): Promise<any> {
    const nodePromises: Promise<any>[] = await db.gameRepo.insertNodes(gameData.dbRows.nodes, gameData.gameName);

    return await Promise.all(nodePromises).then(async (nodes: any) => {
      await this.addNodeAdjacencies(gameData, errors);
      await this.addUnits(gameData, errors);
    });
  }

  async addNodeAdjacencies(gameData: NewGameData, errors: string[]): Promise<any> {
    const nodeAdjacencyPromises: Promise<any>[] = await db.gameRepo.insertNodeAdjacencies(
      gameData.dbRows.links,
      gameData.gameName
    );

    return await Promise.all(nodeAdjacencyPromises).catch((error: Error) => {
      console.log('Node Adjacies Error ' + error.message);
      errors.push('Node Adjacies Error ' + error.message);
    });
  }

  async addCountryInitialHistories(gameData: NewGameData, errors: string[]): Promise<any> {
    const countryHistoryPromises: Promise<any>[] = await db.gameRepo.insertInitialCountryHistories(
      gameData.dbRows.countries,
      gameData.gameName
    );

    return await Promise.all(countryHistoryPromises).catch((error: Error) => {
      console.log('Country History Promise Error: ' + error.message);
      errors.push('Country History Promise Error: ' + error.message);
    });
  }

  async addUnits(gameData: NewGameData, errors: string[]): Promise<any> {
    const unitPromises: Promise<any>[] = await db.gameRepo.insertUnits(gameData.dbRows.units, gameData.gameName);

    return await Promise.all(unitPromises).then(async (units: any) => {
      await this.addInitialUnitHistories(gameData, errors);
    });
  }

  async addInitialUnitHistories(gameData: NewGameData, errors: string[]): Promise<any> {
    const initialHistoryPromises: Promise<any>[] = await db.gameRepo.insertInitialUnitHistories(
      gameData.dbRows.units,
      gameData.gameName
    );

    return await Promise.all(initialHistoryPromises).catch((error: Error) => {
      console.log('Initial History Promise Error: ' + error.message);
      errors.push('Initial History Promise Error: ' + error.message);
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

      const user = await accountService.getUserProfile(idToken);
      if (user) {
        userId = user.userId;
        username = user.username;
        userTimeZone = user.timeZone;
        meridiemTime = user.meridiemTime;
      }
    }

    terminalLog(`Finding games for ${username} (${userId})`);
    terminalAddendum('Find Games Params', JSON.stringify(params));
    const gameResults: any = await db.gameRepo.getGames(userId, params, userTimeZone, meridiemTime);

    return gameResults;
  }

  async getGameData(idToken: string, gameId: number): Promise<any> {
    const accountService: AccountService = new AccountService();
    const schedulerService: SchedulerService = new SchedulerService();
    // const formattingService: FormattingService = new FormattingService();
    // const pool: Pool = new Pool(envCredentials);
    let userId = 0;
    let username = 'Guest';
    let userTimeZone = 'Africa/Monrovia';
    let meridiemTime = false;

    if (idToken) {
      // const token: DecodedIdToken = await accountService.validateToken(idToken);

      const user = await accountService.getUserProfile(idToken);
      if (user) {
        userId = user.userId;
        username = user.username;
        userTimeZone = user.timeZone;
        meridiemTime = user.meridiemTime;
      }
    }

    terminalLog(`${username} (${userId}) Requested Game Data: ${gameId}`);
    const gameData: any = await db.gameRepo.getGameDetails(gameId, userId, userTimeZone, meridiemTime);
    const ruleData: any = await db.gameRepo.getRulesInGame(gameId);
    const playerRegistration: any = await db.assignmentRepo.getUserAssignments(gameId, userId);

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
        const user = await accountService.getUserProfile(idToken);
        if (!user) {
          return;
        }
        terminalLog(
          `Updating Game Settings: ${gameData.gameName} (${gameData.gameId}) | ${user.username} (${user.userId})`
        );
        const events = schedulerService.extractEvents(gameData, user.timeZone);
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

        const coalitionSchedule = [
          gameData.coalitionSchedule.baseRequired,
          gameData.coalitionSchedule.penalties.a,
          gameData.coalitionSchedule.penalties.b,
          gameData.coalitionSchedule.penalties.c,
          gameData.coalitionSchedule.penalties.d,
          gameData.coalitionSchedule.penalties.e,
          gameData.coalitionSchedule.penalties.f,
          gameData.coalitionSchedule.penalties.g,
          gameData.gameId
        ];
        const errors: string[] = [];

        // console.log('Internal Game Data:', gameData);
        await db.gameRepo
          .updateGameSettings(gameSettings)
          .then((result: any) => {
            return {
              success: true,
              message: 'Game Settings Updated'
            };
          })
          .catch((error: Error) => {
            errors.push('Update Game Settings Error: ' + error.message);
            terminalLog('Update Game Settings Error: ' + error.message);
            return {
              success: false,
              errors: errors
            };
          });

        await db.gameRepo
          .updateCoalitionSchedule(coalitionSchedule)
          .then((result: any) => {
            return {
              success: true,
              message: 'Game Coalitions Updated'
            };
          })
          .catch((error: Error) => {
            errors.push('Update Game Settings Error: ' + error.message);
            terminalLog('Update Game Settings Error: ' + error.message);
            return {
              success: false,
              errors: errors
            };
          });
      } else {
        terminalLog(
          `WARNING! Non-Admin Update Game Settings Attempt: ${gameData.gameName} (${gameData.gameId}) | ${token.uid})`
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
      return await schedulerService.readyGame(gameData).then((result) => result);
    } else {
      return {
        success: false,
        message: 'Non-administrator attempted to declare game ready.'
      };
    }
  }
}
