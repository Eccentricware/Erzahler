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
exports.AssignmentService = void 0;
const pg_1 = require("pg");
const assignment_status_enum_1 = require("../../models/enumeration/assignment-status-enum");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const accountService_1 = require("./accountService");
const formattingService_1 = require("./formattingService");
const assignment_type_enum_1 = require("../../models/enumeration/assignment-type-enum");
const connection_1 = require("../../database/connection");
class AssignmentService {
    constructor() {
        this.user = undefined;
        this.adminRoles = [assignment_type_enum_1.AssignmentType.ADMINISTRATOR, assignment_type_enum_1.AssignmentType.CREATOR];
    }
    getGameAssignments(idToken, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const formattingService = new formattingService_1.FormattingService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            let userId = 0;
            if (idToken) {
                this.user = yield accountService.getUserProfile(idToken);
                // console.log('this.user', this.user);
                if (!this.user.error) {
                    userId = this.user.userId;
                }
            }
            const gameData = yield connection_1.db.gameRepo.getGameDetails(gameId, userId, 'America/Los_Angeles', this.user.meridiemTime);
            const assignments = yield connection_1.db.assignmentRepo.getAssignments(gameId, userId);
            const registeredUsers = yield connection_1.db.assignmentRepo.getRegisteredPlayers(gameId);
            const userStatus = yield connection_1.db.assignmentRepo.getPlayerRegistrationStatus(gameId, userId);
            const userIsAdmin = yield this.isPlayerAdmin(gameId, userId);
            const assignmentData = {
                gameId: gameId,
                assignments: assignments,
                registrants: registeredUsers,
                userStatus: userStatus,
                userIsAdmin: userIsAdmin,
                allAssigned: assignments.filter((assignment) => assignment.playerId === null).length === 0,
                partialRosterStart: gameData.partialRosterStart,
                finalReadinessCheck: gameData.finalReadinessCheck
            };
            return assignmentData;
        });
    }
    isPlayerAdmin(gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            const gameAdmins = yield connection_1.db.assignmentRepo.getGameAdmins(gameId);
            const playerAdmin = gameAdmins.filter((admin) => admin.user_id === playerId);
            return playerAdmin.length > 0;
        });
    }
    registerUser(idToken, gameId, assignmentType) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            console.log('gameId', gameId, 'assignmentType', assignmentType, 'userId', this.user.userId);
            this.user = yield accountService.getUserProfile(idToken);
            if (!this.user.error) {
                const userAssignmentTypes = yield connection_1.db.assignmentRepo.getPlayerRegistrationStatus(gameId, this.user.userId);
                const blockedStatuses = [assignment_status_enum_1.AssignmentStatus.BANNED];
                const existingAssignment = userAssignmentTypes.filter((assignment) => {
                    return assignment.assignment_type === assignmentType;
                });
                if (existingAssignment.length === 0 && !blockedStatuses.includes(existingAssignment.assignment_type)) {
                    return yield connection_1.db.assignmentRepo.saveRegisterUser(gameId, this.user.userId, assignmentType);
                }
                else if (existingAssignment[0].assignment_end !== null) {
                    return yield connection_1.db.assignmentRepo.saveReregisterUser(gameId, this.user.userId, assignmentType);
                }
                else {
                    console.log(`User is already registered as ${assignmentType}`);
                    return {
                        success: undefined,
                        message: `User is already registered as ${assignmentType}`
                    };
                }
            }
            return {
                success: false,
                message: 'Invalid user'
            };
        });
    }
    unregisterUser(idToken, gameId, assignmentType) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('gameId', gameId);
            console.log('assignmentType', assignmentType);
            console.log('userId', this.user);
            const accountService = new accountService_1.AccountService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            this.user = yield accountService.getUserProfile(idToken);
            if (!this.user.error) {
                return yield connection_1.db.assignmentRepo.saveUnregisterUser(gameId, this.user.userId, assignmentType);
            }
        });
    }
    assignPlayer(idToken, gameId, playerId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            this.user = yield accountService.getUserProfile(idToken);
            if (!this.user.error) {
                const requestFromAdmin = yield this.isPlayerAdmin(gameId, this.user.userId);
                if (requestFromAdmin) {
                    yield connection_1.db.assignmentRepo.clearCountryAssignments(gameId, countryId);
                    if (playerId > 0) {
                        yield connection_1.db.assignmentRepo.assignPlayer(countryId, gameId, playerId);
                    }
                }
            }
            else {
                return {
                    success: false,
                    error: 'Invalid user'
                };
            }
        });
    }
    lockAssignment(idToken, gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            this.user = yield accountService.getUserProfile(idToken);
            if (!this.user.error) {
                const requestFromAdmin = yield this.isPlayerAdmin(gameId, this.user.userId);
                if (requestFromAdmin) {
                    yield connection_1.db.assignmentRepo.saveLockAssignment(gameId, playerId);
                }
            }
            else {
                return {
                    success: false,
                    error: 'Invalid user'
                };
            }
        });
    }
    unlockAssignment(idToken, gameId, playerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            this.user = yield accountService.getUserProfile(idToken);
            if (!this.user.error) {
                const requestFromAdmin = yield this.isPlayerAdmin(gameId, this.user.userId);
                if (requestFromAdmin) {
                    yield connection_1.db.assignmentRepo.saveUnlockAssignment(gameId, playerId);
                }
            }
            else {
                return {
                    success: false,
                    error: 'Invalid user'
                };
            }
        });
    }
}
exports.AssignmentService = AssignmentService;
//# sourceMappingURL=assignmentService.js.map