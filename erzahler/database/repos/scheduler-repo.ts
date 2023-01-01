import { error } from "console";
import { DateTime } from "luxon";
import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { SchedulerSettingsBuilder } from "../../models/classes/schedule-settings-builder";
import { TurnStatus } from "../../models/enumeration/turn-status-enum";
import { ScheduleSettingsQueryResult } from "../../models/objects/schedule-settings-query-object";
import { UpcomingTurn, UpcomingTurnResult } from "../../models/objects/scheduler/upcoming-turns-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { FormattingService } from "../../server/services/formattingService";
import { setAssignmentsActiveQuery } from "../queries/assignments/set-assignments-active-query";
import { startGameQuery } from "../queries/game/start-game-query";
import { updateTurnQuery } from "../queries/game/update-turn-query";
import { getScheduleSettingsQuery } from "../queries/scheduler/get-schedule-settings-query";
import { getUpcomingTurnsQuery } from "../queries/scheduler/get-upcoming-turns-query";

/**
 * Handles DB updates involving scheduling timing critical events.
 */
export class SchedulerRepository {
  pool = new Pool(victorCredentials);
  formattingService = new FormattingService();
  // "lint": "eslint --cache --fix . && prettier --ignore-path .prettierignore --write ."
  // eslinst ^7.24
  // eslint-config-prettier: ^8.2
  // eslint-plugin-prettier: ^3.3.1
  // prettier: ^2.2.1
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

  async getScheduleSettings(gameId: number): Promise<any> {
    return await this.pool.query(getScheduleSettingsQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((gameScheduleSettings: ScheduleSettingsQueryResult) => {
          return new SchedulerSettingsBuilder(gameScheduleSettings);
        })[0];
      })
      .catch((error: Error) => {
        console.log('Get Schedule Settings Query Error: ' + error.message);
      });
  }

  async getUpcomingTurns(gameId: number = 0): Promise<UpcomingTurn[]> {
    return await this.pool.query(getUpcomingTurnsQuery, [gameId])
      .then((results: QueryResult<any>) => {
        return results.rows.map((turn: UpcomingTurnResult) => {
          return <UpcomingTurn> {
            gameId: turn.game_id,
            turnId: turn.turn_id,
            gameName: turn.game_name,
            turnName: turn.turn_name,
            turnType: turn.turn_type,
            turnStatus: turn.turn_status,
            deadline: turn.deadline
          }
        })
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
    return await this.pool.query(updateTurnQuery, argsArray)
      .then((turns: QueryResult<any>) => {
        return turns.rows.map((turn: any) => { return this.formattingService.convertKeysSnakeToCamel(turn); })[0];
      });
  }
}