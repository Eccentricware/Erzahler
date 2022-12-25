import { Pool, QueryResult } from "pg";
import { IDatabase, IMain } from "pg-promise";
import { GameState, GameStateResult } from "../../models/objects/last-turn-info-object";
import { victorCredentials } from "../../secrets/dbCredentials";
import { getGameStateQuery } from "../queries/options/get-game-state-query";

export class GameRepository {
  constructor(private db: IDatabase<any>, private pgp: IMain) {}

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
}