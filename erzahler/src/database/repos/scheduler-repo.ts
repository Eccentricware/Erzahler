import { error } from 'console';
import { DateTime } from 'luxon';
import { Pool, QueryResult } from 'pg';
import { ColumnSet, IDatabase, IMain } from 'pg-promise';
import { SchedulerSettingsBuilder } from '../../models/classes/schedule-settings-builder';
import { TurnStatus } from '../../models/enumeration/turn-status-enum';
import { TurnType } from '../../models/enumeration/turn-type-enum';
import { TurnPG, TurnTS } from '../../models/objects/database-objects';
import { ScheduleSettingsQueryResult } from '../../models/objects/schedule-settings-query-object';
import { UpcomingTurn, UpcomingTurnResult } from '../../models/objects/scheduler/upcoming-turns-object';
import { victorCredentials } from '../../secrets/dbCredentials';
import { FormattingService } from '../../server/services/formattingService';
import { setAssignmentsActiveQuery } from '../queries/assignments/set-assignments-active-query';
import { insertTurnQuery } from '../queries/game/insert-turn-query';
import { startGameQuery } from '../queries/game/start-game-query';
import { updateTurnQuery } from '../queries/game/update-turn-query';
import { getNominationsQuery } from '../queries/orders/options-final/get-nominations-query';
import { getScheduleSettingsQuery } from '../queries/scheduler/get-schedule-settings-query';
import { getUpcomingTurnsQuery } from '../queries/scheduler/get-upcoming-turns-query';

/**
 * Handles DB updates involving scheduling timing critical events and turns.
 */
export class SchedulerRepository {
  turnCols: ColumnSet<unknown>;
  pool = new Pool(victorCredentials);
  formattingService = new FormattingService();
  // "lint": "eslint --cache --fix . && prettier --ignore-path .prettierignore --write ."
  // eslinst ^7.24
  // eslint-config-prettier: ^8.2
  // eslint-plugin-prettier: ^3.3.1
  // prettier: ^2.2.1
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.turnCols = new pgp.helpers.ColumnSet(
      ['game_id', 'turn_number', 'turn_name', 'turn_type', 'turn_status', 'year_number', 'deadline'],
      { table: 'turns' }
    );
  }

  async insertTurn(input: TurnTS): Promise<TurnTS> {
    const turnValues: TurnPG = {
      game_id: input.gameId,
      turn_number: input.turnNumber,
      turn_name: input.turnName,
      turn_type: input.turnType,
      turn_status: input.turnStatus,
      year_number: input.yearNumber,
      deadline: input.deadline
    };

    const query = this.pgp.helpers.insert(turnValues, this.turnCols) + 'RETURNING turn_id';

    const newTurn: TurnTS[] = await this.db.any(query).then((data: any) => {
      return data.map((result: TurnPG) => {
        return <TurnTS>{
          turnId: result.turn_id
        };
      });
    });

    return newTurn[0];
  }

  //// Legacy Functions ////

  async getScheduleSettings(gameId: number): Promise<SchedulerSettingsBuilder | void> {
    return await this.pool
      .query(getScheduleSettingsQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((gameScheduleSettings: ScheduleSettingsQueryResult) => {
          return new SchedulerSettingsBuilder(gameScheduleSettings);
        })[0];
      })
      .catch((error: Error) => {
        console.log('Get Schedule Settings Query Error: ' + error.message);
      });
  }

  async getUpcomingTurns(gameId = 0): Promise<UpcomingTurn[]> {
    return await this.pool
      .query(getUpcomingTurnsQuery, [gameId])
      .then((results: QueryResult<any>) => {
        return results.rows.map((turn: UpcomingTurnResult) => {
          const unitMovement = [
            TurnType.ORDERS_AND_VOTES,
            TurnType.SPRING_ORDERS,
            TurnType.SPRING_RETREATS,
            TurnType.FALL_ORDERS,
            TurnType.FALL_RETREATS
          ].includes(turn.turn_type);
          const transfers = [TurnType.ORDERS_AND_VOTES, TurnType.SPRING_ORDERS].includes(turn.turn_type);
          const capturing = [TurnType.FALL_ORDERS, TurnType.FALL_RETREATS].includes(turn.turn_type);
          const adjustments = [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM].includes(turn.turn_type);
          const nominations = [TurnType.ADJ_AND_NOM, TurnType.NOMINATIONS].includes(turn.turn_type);
          const votes = [TurnType.VOTES, TurnType.ORDERS_AND_VOTES].includes(turn.turn_type);

          return <UpcomingTurn>{
            gameId: turn.game_id,
            turnId: turn.turn_id,
            gameName: turn.game_name,
            turnName: turn.turn_name,
            turnType: turn.turn_type,
            turnStatus: turn.turn_status,
            deadline: turn.deadline,
            defaultsReady: turn.defaults_ready,
            unitMovement: unitMovement,
            transfers: transfers,
            hasCaptures: capturing,
            adjustments: adjustments,
            nominations: nominations,
            votes: votes
          };
        });
      })
      .catch((error: Error) => {
        console.log('getUpcomingTurns Error: ' + error);
        return [];
      });
  }

  async startGame(startGameArgs: any[]): Promise<any> {
    await this.pool.query(startGameQuery, startGameArgs);
  }

  async setAssignmentsActive(gameId: number): Promise<any> {
    await this.pool.query(setAssignmentsActiveQuery, [gameId]);
  }

  async updateTurn(argsArray: any[]): Promise<any> {
    return await this.pool.query(updateTurnQuery, argsArray).then((turns: QueryResult<any>) => {
      return turns.rows.map((turn: any) => {
        return this.formattingService.convertKeysSnakeToCamel(turn);
      })[0];
    });
  }
}
