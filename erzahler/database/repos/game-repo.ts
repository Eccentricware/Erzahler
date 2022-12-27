import { Pool, QueryResult } from "pg";
import { ColumnSet, IDatabase, IMain } from "pg-promise";
import { GameStatus } from "../../models/enumeration/game-status-enum";
import { GameState, GameStateResult } from "../../models/objects/last-turn-info-object";
import { StartScheduleEvents } from "../../models/objects/start-schedule-events-object";
import { StartScheduleObject } from "../../models/objects/start-schedule-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { SchedulerService } from "../../server/services/scheduler-service";
import { insertNewGameQuery } from "../queries/game/insert-game-query";
import { getGameStateQuery } from "../queries/options/get-game-state-query";

const gamesCols: string[] = [
  'game_name',
  'game_status',
  'assignment_method',
  'stylized_start_year',
  'current_year',
  'turn_1_timing',
  'deadline_type',
  'start_time',
  'observe_dst',
  'orders_day',
  'orders_time',
  'retreats_day',
  'retreats_time',
  'adjustments_day',
  'adjustments_time',
  'nominations_day',
  'nominations_time',
  'votes_day',
  'votes_time',
  'nmr_tolerance_total',
  'concurrent_games_limit',
  'private_game',
  'hidden_game',
  'blind_administrators',
  'final_readiness_check',
  'vote_delay_enabled',
  'partial_roster_start',
  'nomination_timing',
  'nomination_year',
  'automatic_assignments',
  'rating_limits_enabled',
  'fun_min',
  'fun_max',
  'skill_min',
  'skill_max'
]
export class GameRepository {
  gamesCols: ColumnSet<unknown>;

  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.gamesCols = new pgp.helpers.ColumnSet(gamesCols, { table: 'games' });
  }

  async getGameState(gameId: number): Promise<any> {
    const pool = new Pool(victorCredentials);

    const gameState: GameState = await pool.query(getGameStateQuery, [gameId])
      .then((result: QueryResult<any>) => {
        return result.rows.map((gameStateResult: GameStateResult) => {
          return <GameState> {
            gameId: gameStateResult.game_id,
            turnId: gameStateResult.turn_id,
            deadline: gameStateResult.deadline,
            turnNumber: gameStateResult.turn_number,
            turnName: gameStateResult.turn_name,
            turnType: gameStateResult.turn_type,
            turnStatus: gameStateResult.turn_status,
            resolvedTime: gameStateResult.resolved_time,
            deadlineMissed: gameStateResult.deadline_missed,
            nominateDuringAdjustments: gameStateResult.nominate_during_adjustments,
            voteDuringSpring: gameStateResult.vote_during_spring,
            nominationTiming: gameStateResult.nomination_timing,
            nominationYear: gameStateResult.nomination_year,
            currentYear: gameStateResult.current_year,
            yearNumber: gameStateResult.year_number,
            highestRankedReq: gameStateResult.highest_ranked_req,
            allVotesControlled: gameStateResult.all_votes_controlled,
            unitsInRetreat: gameStateResult.unit_in_retreat
          }
        })[0];
      });

    return gameState;
  }

  async insertNewGameQuery(settings: any, schedule: StartScheduleObject): Promise<any> {
    const gameValues = {
      game_name: settings.gameName,
      game_status: GameStatus.REGISTRATION,
      assignment_method: settings.assignmentMethod,
      stylized_start_year: settings.stylizedStartYear,
      current_year: 0,
      turn_1_timing: settings.turn1Timing,
      deadline_type: settings.deadlineType,
      start_time: schedule.gameStart,
      observe_dst: settings.observeDst,
      orders_day: schedule.orders.day,
      orders_time: schedule.orders.time,
      retreats_day: schedule.retreats.day,
      retreats_time: schedule.retreats.time,
      adjustments_day: schedule.adjustments.day,
      adjustments_time: schedule.adjustments.time,
      nominations_day: schedule.nominations.day,
      nominations_time: schedule.nominations.time,
      votes_day: schedule.votes.day,
      votes_time: schedule.votes.time,
      nmr_tolerance_total: settings.nmrTolerance,
      concurrent_games_limit: settings.concurrentGamesLimit,
      private_game: settings.privateGame,
      hidden_game: settings.hiddenGame,
      blind_administrators: settings.blindAdministrators,
      final_readiness_check: settings.finalReadinessCheck,
      vote_delay_enabled: settings.voteDelayEnabled,
      partial_roster_start: settings.partialRosterStart,
      nomination_timing: settings.nominationTiming,
      nomination_year: settings.nominationYear,
      automatic_assignments: settings.automaticAssignments,
      rating_limits_enabled: settings.ratingLimits,
      fun_min: settings.funRange[0],
      fun_max: settings.funRange[1],
      skill_min: settings.skillRange[0],
      skill_max: settings.skillRange[1]
    };

    const insertGameQuery = this.pgp.helpers.insert(gameValues, this.gamesCols);
    return this.db.any(insertGameQuery);
  }
}