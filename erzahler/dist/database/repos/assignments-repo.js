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
exports.AssignmentRepository = void 0;
const pg_1 = require("pg");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const formattingService_1 = require("../../server/services/formattingService");
const assign_user_query_1 = require("../queries/assignments/assign-user-query");
const clear_country_assignments_query_1 = require("../queries/assignments/clear-country-assignments-query");
const get_user_game_assignments_query_1 = require("../queries/assignments/get-user-game-assignments-query");
const get_player_registration_status_1 = require("../queries/assignments/get-player-registration-status");
const lock_assignment_query_1 = require("../queries/assignments/lock-assignment-query");
const register_user_query_1 = require("../queries/assignments/register-user-query");
const reregister_user_query_1 = require("../queries/assignments/reregister-user-query");
const unlock_assignment_query_1 = require("../queries/assignments/unlock-assignment-query");
const unregister_user_query_1 = require("../queries/assignments/unregister-user-query");
const get_assignments_query_1 = require("../queries/game/get-assignments-query");
const get_game_admins_query_1 = require("../queries/game/get-game-admins-query");
const get_registered_players_query_1 = require("../queries/game/get-registered-players-query");
const get_player_is_country_query_1 = require("../queries/assignments/get-player-is-country-query");
/**
 * Handles DB updates involving user associations with games.
 */
class AssignmentRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
        this.formattingService = new formattingService_1.FormattingService();
    }
    getGameAdmins(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_game_admins_query_1.getGameAdminsQuery, [gameId])
                .then((results) => results.rows)
                .catch((error) => {
                console.log('Get Game Admins Query Error: ' + error.message);
                return [];
            });
        });
    }
    getAssignments(gameId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_assignments_query_1.getAssignmentsQuery, [gameId, userId])
                .then((assignmentDataResults) => {
                return assignmentDataResults.rows.map((assignment) => this.formattingService.convertKeysSnakeToCamel(assignment));
            })
                .catch((error) => console.log('Get Assignment Data Results Error: ' + error.message));
        });
    }
    saveRegisterUser(gameId, userId, assignmentType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(register_user_query_1.registerUserQuery, [gameId, userId, assignmentType])
                .then(() => {
                return { success: true };
            })
                .catch((error) => {
                console.log('Insert assignment error: ' + error.message);
                return {
                    success: false,
                    message: error.message
                };
            });
        });
    }
    saveUnregisterUser(gameId, userId, assignmentType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(unregister_user_query_1.unregisterUserQuery, [gameId, userId, assignmentType])
                .then(() => {
                return { success: true };
            })
                .catch((error) => {
                console.log('Unregister User Error: ' + error.message);
            });
        });
    }
    saveReregisterUser(gameId, userId, assignmentType) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(reregister_user_query_1.reregisterUserQuery, [gameId, userId, assignmentType])
                .then(() => {
                return { success: true };
            })
                .catch((error) => {
                console.log('Update assignment error: ' + error.message);
                return {
                    success: false,
                    message: error.message
                };
            });
        });
    }
    getRegisteredPlayers(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_registered_players_query_1.getRegisteredPlayersQuery, [gameId])
                .then((registeredUserResults) => {
                return registeredUserResults.rows.map((player) => this.formattingService.convertKeysSnakeToCamel(player));
            })
                .catch((error) => console.log('Get Registered Player Data Results Error: ' + error.message));
        });
    }
    getPlayerRegistrationStatus(gameId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_player_registration_status_1.getPlayerRegistrationStatusQuery, [gameId, userId])
                .then((playerRegistrationResults) => {
                return playerRegistrationResults.rows.map((registrationType) => this.formattingService.convertKeysSnakeToCamel(registrationType));
            })
                .catch((error) => console.log('Get Player Registration Types Results Error: ' + error.message));
        });
    }
    clearCountryAssignments(gameId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(clear_country_assignments_query_1.clearCountryAssignmentsQuery, [gameId, countryId]).catch((error) => {
                console.log('Clear Country Assignments Error: ' + error.message);
            });
        });
    }
    assignPlayer(countryId, gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(assign_user_query_1.assignUserQuery, [countryId, gameId, playerId]).catch((error) => {
                console.log('Assign User Error: ' + error.message);
            });
        });
    }
    saveLockAssignment(gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(lock_assignment_query_1.lockAssignmentQuery, [gameId, playerId]);
        });
    }
    saveUnlockAssignment(gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(unlock_assignment_query_1.unlockAssignmentQuery, [gameId, playerId]);
        });
    }
    getUserAssignments(gameId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignments = yield this.pool
                .query(get_user_game_assignments_query_1.getUserGameAssignmentsQuery, [gameId, userId])
                .then((queryResult) => queryResult.rows.map((result) => {
                return {
                    username: result.username,
                    assignmentType: result.assignment_type,
                    countryId: result.country_id ? result.country_id : 0,
                    countryName: result.country_name,
                    countryStatus: result.country_status,
                    nukeTech: result.nuke_range !== null,
                    blindAdministrators: result.blind_administrators
                };
            }))
                .catch((error) => {
                console.log('getUserAssignments Error: ' + error.message);
                return [];
            });
            return assignments;
        });
    }
    confirmUserIsCountry(gameId, userId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const assigned = yield this.pool
                .query(get_player_is_country_query_1.getPlayerIsCountryQuery, [gameId, userId, countryId])
                .then((result) => result.rows[0].assigned);
            return assigned;
        });
    }
}
exports.AssignmentRepository = AssignmentRepository;
//# sourceMappingURL=assignments-repo.js.map