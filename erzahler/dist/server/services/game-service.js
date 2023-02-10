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
exports.GameService = void 0;
const pg_1 = require("pg");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const accountService_1 = require("./accountService");
const scheduler_service_1 = require("./scheduler-service");
const formattingService_1 = require("./formattingService");
const turn_status_enum_1 = require("../../models/enumeration/turn-status-enum");
const orders_service_1 = require("./orders-service");
const turn_type_enum_1 = require("../../models/enumeration/turn-type-enum");
const connection_1 = require("../../database/connection");
class GameService {
    constructor() {
        this.gameData = {};
        this.user = undefined;
        this.errors = [];
    }
    newGame(gameData, idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const optionsService = new orders_service_1.OrdersService();
            this.user = yield accountService.getUserProfile(idToken);
            if (!this.user.error) {
                const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
                this.gameData = gameData;
                const newGameResult = yield this.addNewGame(pool, this.gameData, this.user.timeZone)
                    .then((newGameId) => __awaiter(this, void 0, void 0, function* () {
                    return {
                        success: true,
                        gameId: newGameId,
                        errors: this.errors
                    };
                }))
                    .catch((error) => {
                    console.log('Game Response Failure:', error.message);
                    this.errors.push('New Game Error' + error.message);
                    return {
                        success: false,
                        gameId: 0,
                        errors: this.errors
                    };
                });
                return newGameResult;
            }
            else {
                console.log('Invalid Token UID attempting to save new game');
                return {
                    success: false,
                    error: 'Invalid Token UID'
                };
            }
        });
    }
    addNewGame(pool, settings, userTimeZoneName) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedulerService = new scheduler_service_1.SchedulerService();
            const events = schedulerService.extractEvents(settings, userTimeZoneName);
            const schedule = schedulerService.prepareStartSchedule(events);
            console.log('Schedule', schedule);
            const settingsArray = [
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
            return yield connection_1.db.gameRepo
                .insertGame(settingsArray)
                .then((results) => __awaiter(this, void 0, void 0, function* () {
                const newGame = results.rows[0];
                console.log('Game Row Added Successfully');
                return yield Promise.all([
                    yield this.addCreatorAssignment(pool, this.user.userId),
                    yield this.addRulesInGame(pool),
                    yield this.addTurn0(pool, schedule),
                    yield this.addCoalitionSchedule(pool)
                ]).then(() => {
                    return newGame.game_id;
                });
            }))
                .catch((error) => {
                console.log('New game Error:', error.message);
                this.errors.push('New Game Error: ' + error.message);
            });
        });
    }
    addCreatorAssignment(pool, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.db.gameRepo.insertAssignment(userId, undefined, 'Creator', this.gameData.gameName);
        });
    }
    addCoalitionSchedule(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.db.gameRepo.insertCoalitionScheduleQuery(this.gameData.gameName);
        });
    }
    addTurn0(pool, schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            yield connection_1.db.gameRepo
                .insertTurn([
                schedule.gameStart,
                0,
                `Winter ${this.gameData.stylizedStartYear}`,
                turn_type_enum_1.TurnType.ADJUSTMENTS,
                turn_status_enum_1.TurnStatus.RESOLVED,
                this.gameData.gameName
            ])
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                console.log('Turn 0 Added Successfully');
                yield this.addCountries(pool);
            }))
                .catch((error) => {
                console.log('Turn 0 Error: ', error.message);
                this.errors.push('Turn 0 Error: ' + error.message);
            });
        });
    }
    addTurn1(pool, schedule) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('trying turn 1');
            yield connection_1.db.gameRepo
                .insertTurn([
                schedule.firstTurnDeadline,
                1,
                `Spring ${this.gameData.stylizedStartYear + 1}`,
                turn_type_enum_1.TurnType.SPRING_ORDERS,
                turn_status_enum_1.TurnStatus.PAUSED,
                this.gameData.gameName
            ])
                .then((result) => __awaiter(this, void 0, void 0, function* () {
                console.log('Turn 1 Added Successfully');
                return result.rows[0].turn_id;
            }))
                .catch((error) => {
                console.log('Turn 1 Error: ', error.message);
                this.errors.push('Turn 1 Error: ' + error.message);
                return 0;
            });
        });
    }
    addRulesInGame(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const rulePromises = yield connection_1.db.gameRepo.insertRulesInGame(this.gameData.rules, this.gameData.gameName);
            return Promise.all(rulePromises)
                .then((rules) => true)
                .catch((error) => {
                console.log('Rule Promises Error: ' + error.message);
                this.errors.push('Rule Promises Error: ' + error.message);
            });
        });
    }
    addCountries(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCountryPromises = yield connection_1.db.gameRepo.insertCountries(this.gameData.dbRows.countries, this.gameData.gameName);
            // console.log('newCountryPromises', newCountryPromises);
            return yield Promise.all(newCountryPromises)
                .then((newCountryResolved) => __awaiter(this, void 0, void 0, function* () {
                yield this.addProvinces(pool);
                yield this.addCountryInitialHistories(pool);
            }))
                .catch((error) => {
                console.log('New Country Promises Error: ' + error.message);
                this.errors.push('New Country Promises Error: ' + error.message);
            });
        });
    }
    addProvinces(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const provincePromises = yield connection_1.db.gameRepo.insertProvinces(this.gameData.dbRows.provinces, this.gameData.gameName);
            return yield Promise.all(provincePromises).then(() => __awaiter(this, void 0, void 0, function* () {
                console.log('Provinces Added');
                yield this.addProvinceHistories(pool);
                yield this.addTerrain(pool);
                yield this.addLabels(pool);
                yield this.addLabelLines();
                yield this.addNodes(pool);
            }));
        });
    }
    addProvinceHistories(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const provinceHistoryPromises = yield connection_1.db.gameRepo.insertProvinceHistories(this.gameData.dbRows.provinces, this.gameData.gameName);
            return yield Promise.all(provinceHistoryPromises).catch((error) => {
                console.log('Province History Promises Error: ' + error.message);
                this.errors.push('Province History Promises Error: ' + error.message);
            });
        });
    }
    addTerrain(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const terrainPromises = yield connection_1.db.gameRepo.insertTerrain(this.gameData.dbRows.terrain, this.gameData.gameName);
            return yield Promise.all(terrainPromises).catch((error) => {
                console.log('Terrain Promises Error: ' + error.message);
                this.errors.push('Terrain Promises Error: ' + error.message);
            });
        });
    }
    addLabels(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            connection_1.db.gameRepo.insertLabels(this.gameData.dbRows.labels, this.gameData.gameName);
        });
    }
    addLabelLines() {
        return __awaiter(this, void 0, void 0, function* () {
            connection_1.db.gameRepo.insertLabelLines(this.gameData.dbRows.labelLines, this.gameData.gameName);
        });
    }
    addNodes(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodePromises = yield connection_1.db.gameRepo.insertNodes(this.gameData.dbRows.nodes, this.gameData.gameName);
            return yield Promise.all(nodePromises).then((nodes) => __awaiter(this, void 0, void 0, function* () {
                yield this.addNodeAdjacencies(pool);
                yield this.addUnits(pool);
            }));
        });
    }
    addNodeAdjacencies(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeAdjacencyPromises = yield connection_1.db.gameRepo.insertNodeAdjacencies(this.gameData.dbRows.links, this.gameData.gameName);
            return yield Promise.all(nodeAdjacencyPromises).catch((error) => {
                console.log('Node Adjacies Error ' + error.message);
                this.errors.push('Node Adjacies Error ' + error.message);
            });
        });
    }
    addCountryInitialHistories(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const countryHistoryPromises = yield connection_1.db.gameRepo.insertCountryHistories(this.gameData.dbRows.countries, this.gameData.gameName);
            return yield Promise.all(countryHistoryPromises).catch((error) => {
                console.log('Country History Promise Error: ' + error.message);
                this.errors.push('Country History Promise Error: ' + error.message);
            });
        });
    }
    addUnits(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitPromises = yield connection_1.db.gameRepo.insertUnits(this.gameData.dbRows.units, this.gameData.gameName);
            return yield Promise.all(unitPromises).then((units) => __awaiter(this, void 0, void 0, function* () {
                yield this.addInitialUnitHistories(pool);
            }));
        });
    }
    addInitialUnitHistories(pool) {
        return __awaiter(this, void 0, void 0, function* () {
            const initialHistoryPromises = yield connection_1.db.gameRepo.insertUnitHistories(this.gameData.dbRows.units, this.gameData.gameName);
            return yield Promise.all(initialHistoryPromises).catch((error) => {
                console.log('Initial History Promise Error: ' + error.message);
                this.errors.push('Initial History Promise Error: ' + error.message);
            });
        });
    }
    checkGameNameAvailability(gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameNameResults = yield connection_1.db.gameRepo.checkGameNameAvailable(gameName);
            return gameNameResults.rowCount === 0;
        });
    }
    findGames(idToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const formattingService = new formattingService_1.FormattingService();
            const schedulerService = new scheduler_service_1.SchedulerService();
            let userId = 0;
            let userTimeZone = 'Africa/Monrovia';
            let meridiemTime = false;
            if (idToken) {
                // const token: DecodedIdToken = await accountService.validateToken(idToken);
                this.user = yield accountService.getUserProfile(idToken);
                if (!this.user.error) {
                    userId = this.user.userId;
                    userTimeZone = this.user.timeZone;
                    meridiemTime = this.user.meridiemTime;
                }
            }
            const gameResults = yield connection_1.db.gameRepo.getGames(userTimeZone, meridiemTime);
            return gameResults;
        });
    }
    getGameData(idToken, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const schedulerService = new scheduler_service_1.SchedulerService();
            const formattingService = new formattingService_1.FormattingService();
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            let userId = 0;
            let userTimeZone = 'Africa/Monrovia';
            let meridiemTime = false;
            if (idToken) {
                // const token: DecodedIdToken = await accountService.validateToken(idToken);
                this.user = yield accountService.getUserProfile(idToken);
                if (!this.user.error) {
                    userId = this.user.userId;
                    userTimeZone = this.user.timeZone;
                    meridiemTime = this.user.meridiemTime;
                }
            }
            const gameData = yield connection_1.db.gameRepo.getGameDetails(gameId, userId, userTimeZone, meridiemTime);
            const ruleData = yield connection_1.db.gameRepo.getRulesInGame(gameId);
            const playerRegistration = yield connection_1.db.gameRepo.getPlayerRegistrationStatus(gameId, userId);
            gameData.rules = ruleData;
            gameData.playerRegistration = playerRegistration;
            gameData.ordersTime = schedulerService.timeIdentity(gameData.ordersTime);
            return gameData;
        });
    }
    updateGameSettings(idToken, gameData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('triggering save');
            const accountService = new accountService_1.AccountService();
            const schedulerService = new scheduler_service_1.SchedulerService();
            const token = yield accountService.validateToken(idToken);
            if (token.uid) {
                const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
                const isAdmin = yield connection_1.db.gameRepo.isGameAdmin(token.uid, gameData.gameId);
                if (isAdmin) {
                    this.user = yield accountService.getUserProfile(idToken);
                    const events = schedulerService.extractEvents(gameData, this.user.timeZone);
                    const schedule = schedulerService.prepareStartSchedule(events);
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
                    const errors = [];
                    // console.log('Internal Game Data:', gameData);
                    yield connection_1.db.gameRepo
                        .updateGameSettings(gameSettings)
                        .then((result) => {
                        return {
                            success: true,
                            message: 'Game Updated'
                        };
                    })
                        .catch((error) => {
                        errors.push('Update Game Settings Error: ' + error.message);
                        console.log('Update Game Settings Error: ' + error.message);
                        return {
                            success: false,
                            errors: errors
                        };
                    });
                }
                else {
                    return 'Not admin!';
                }
            }
        });
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
    declareReady(idToken, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedulerService = new scheduler_service_1.SchedulerService();
            const gameData = yield this.getGameData(idToken, gameId);
            // TO-DO Restore to registration clause after troubleshooting && gameData.gameStatus === GameStatus.REGISTRATION
            if (gameData.isAdmin) {
                yield schedulerService.prepareGameStart(gameData);
            }
        });
    }
    getGameStats(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            const countryStats = yield connection_1.db.gameRepo.getGameStats(gameId, gameState.turnId);
            return { countries: countryStats };
        });
    }
}
exports.GameService = GameService;
//# sourceMappingURL=game-service.js.map