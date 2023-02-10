"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerRepository = void 0;
const pg_1 = require("pg");
const schedule_settings_builder_1 = require("../../models/classes/schedule-settings-builder");
const turn_type_enum_1 = require("../../models/enumeration/turn-type-enum");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const formattingService_1 = require("../../server/services/formattingService");
const set_assignments_active_query_1 = require("../queries/assignments/set-assignments-active-query");
const start_game_query_1 = require("../queries/game/start-game-query");
const update_turn_query_1 = require("../queries/game/update-turn-query");
const get_schedule_settings_query_1 = require("../queries/scheduler/get-schedule-settings-query");
const get_upcoming_turns_query_1 = require("../queries/scheduler/get-upcoming-turns-query");
/**
 * Handles DB updates involving scheduling timing critical events and turns.
 */
class SchedulerRepository {
    // "lint": "eslint --cache --fix . && prettier --ignore-path .prettierignore --write ."
    // eslinst ^7.24
    // eslint-config-prettier: ^8.2
    // eslint-plugin-prettier: ^3.3.1
    // prettier: ^2.2.1
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
        this.formattingService = new formattingService_1.FormattingService();
        this.turnCols = new pgp.helpers.ColumnSet(['game_id', 'turn_number', 'turn_name', 'turn_type', 'turn_status', 'year_number', 'deadline'], { table: 'turns' });
    }
    insertTurn(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const turnValues = {
                game_id: input.gameId,
                turn_number: input.turnNumber,
                turn_name: input.turnName,
                turn_type: input.turnType,
                turn_status: input.turnStatus,
                year_number: input.yearNumber,
                deadline: input.deadline
            };
            const query = this.pgp.helpers.insert(turnValues, this.turnCols) + 'RETURNING turn_id';
            const newTurn = yield this.db.any(query).then((data) => {
                return data.map((result) => {
                    return {
                        turnId: result.turn_id
                    };
                });
            });
            return newTurn[0];
        });
    }
    //// Legacy Functions ////
    getScheduleSettings(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_schedule_settings_query_1.getScheduleSettingsQuery, [gameId])
                .then((result) => {
                return result.rows.map((gameScheduleSettings) => {
                    return new schedule_settings_builder_1.SchedulerSettingsBuilder(gameScheduleSettings);
                })[0];
            })
                .catch((error) => {
                console.log('Get Schedule Settings Query Error: ' + error.message);
            });
        });
    }
    getUpcomingTurns(gameId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_upcoming_turns_query_1.getUpcomingTurnsQuery, [gameId])
                .then((results) => {
                return results.rows.map((turn) => {
                    const unitMovement = [
                        turn_type_enum_1.TurnType.ORDERS_AND_VOTES,
                        turn_type_enum_1.TurnType.SPRING_ORDERS,
                        turn_type_enum_1.TurnType.SPRING_RETREATS,
                        turn_type_enum_1.TurnType.FALL_ORDERS,
                        turn_type_enum_1.TurnType.FALL_RETREATS
                    ].includes(turn.turn_type);
                    const transfers = [turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.SPRING_ORDERS].includes(turn.turn_type);
                    const capturing = [turn_type_enum_1.TurnType.FALL_ORDERS, turn_type_enum_1.TurnType.FALL_RETREATS].includes(turn.turn_type);
                    const adjustments = [turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(turn.turn_type);
                    const nominations = [turn_type_enum_1.TurnType.ADJ_AND_NOM, turn_type_enum_1.TurnType.NOMINATIONS].includes(turn.turn_type);
                    const votes = [turn_type_enum_1.TurnType.VOTES, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(turn.turn_type);
                    return {
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
                .catch((error) => {
                console.log('getUpcomingTurns Error: ' + error);
                return [];
            });
        });
    }
    startGame(startGameArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(start_game_query_1.startGameQuery, startGameArgs);
        });
    }
    setAssignmentsActive(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(set_assignments_active_query_1.setAssignmentsActiveQuery, [gameId]);
        });
    }
    updateTurn(argsArray) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(update_turn_query_1.updateTurnQuery, argsArray).then((turns) => {
                return turns.rows.map((turn) => {
                    return this.formattingService.convertKeysSnakeToCamel(turn);
                })[0];
            });
        });
    }
}
exports.SchedulerRepository = SchedulerRepository;
//# sourceMappingURL=scheduler-repo.js.map