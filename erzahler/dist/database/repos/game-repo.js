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
exports.GameRepository = void 0;
const pg_1 = require("pg");
const game_details_builder_1 = require("../../models/classes/game-details-builder");
const game_summary_builder_1 = require("../../models/classes/game-summary-builder");
const country_enum_1 = require("../../models/enumeration/country-enum");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const formattingService_1 = require("../../server/services/formattingService");
const get_player_registration_status_1 = require("../queries/assignments/get-player-registration-status");
const check_game_name_availability_query_1 = require("../queries/game/check-game-name-availability-query");
const check_user_game_admin_query_1 = require("../queries/game/check-user-game-admin-query");
const get_coalition_schedule_query_1 = require("../queries/game/get-coalition-schedule-query");
const get_country_state_query_1 = require("../queries/game/get-country-state-query");
const get_game_details_query_1 = require("../queries/game/get-game-details-query");
const get_game_stats_query_1 = require("../queries/game/get-game-stats-query");
const get_games_query_1 = require("../queries/game/get-games-query");
const get_rules_in_game_query_1 = require("../queries/game/get-rules-in-game-query");
const insert_assignment_query_1 = require("../queries/game/insert-assignment-query");
const insert_coalition_schedule_query_1 = require("../queries/game/insert-coalition-schedule-query");
const insert_country_history_query_1 = require("../queries/game/insert-country-history-query");
const insert_country_query_1 = require("../queries/game/insert-country-query");
const insert_game_query_1 = require("../queries/game/insert-game-query");
const insert_initial_province_history_query_1 = require("../queries/game/insert-initial-province-history-query");
const insert_label_line_query_1 = require("../queries/game/insert-label-line-query");
const insert_label_query_1 = require("../queries/game/insert-label-query");
const insert_node_adjacency_query_1 = require("../queries/game/insert-node-adjacency-query");
const insert_node_query_1 = require("../queries/game/insert-node-query");
const insert_province_query_1 = require("../queries/game/insert-province-query");
const insert_rule_in_game_query_1 = require("../queries/game/insert-rule-in-game-query");
const insert_terrain_query_1 = require("../queries/game/insert-terrain-query");
const insert_turn_query_1 = require("../queries/game/insert-turn-query");
const insert_unit_history_query_1 = require("../queries/game/insert-unit-history-query");
const insert_unit_query_1 = require("../queries/game/insert-unit-query");
const update_game_settings_query_1 = require("../queries/game/update-game-settings-query");
const update_turn_query_1 = require("../queries/game/update-turn-query");
const get_game_state_query_1 = require("../queries/orders/get-game-state-query");
const gamesCols = [
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
];
class GameRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.formattingService = new formattingService_1.FormattingService();
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
    }
    getGameState(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameState = yield this.pool.query(get_game_state_query_1.getGameStateQuery, [gameId]).then((result) => {
                return result.rows.map((gameStateResult) => {
                    return {
                        gameId: gameStateResult.game_id,
                        turnId: gameStateResult.turn_id,
                        deadline: gameStateResult.deadline,
                        turnNumber: gameStateResult.turn_number,
                        turnName: gameStateResult.turn_name,
                        turnType: gameStateResult.turn_type,
                        turnStatus: gameStateResult.turn_status,
                        resolvedTime: gameStateResult.resolved_time,
                        pendingTurnId: gameStateResult.pending_turn_id,
                        pendingTurnType: gameStateResult.pending_turn_type,
                        preliminaryTurnId: gameStateResult.preliminary_turn_id,
                        preliminaryTurnType: gameStateResult.preliminary_turn_type,
                        deadlineMissed: gameStateResult.deadline_missed,
                        nominateDuringAdjustments: gameStateResult.nominate_during_adjustments,
                        voteDuringSpring: gameStateResult.vote_during_spring,
                        nominationTiming: gameStateResult.nomination_timing,
                        nominationYear: gameStateResult.nomination_year,
                        currentYear: gameStateResult.current_year,
                        yearNumber: gameStateResult.year_number,
                        highestRankedReq: gameStateResult.highest_ranked_req,
                        allVotesControlled: gameStateResult.all_votes_controlled,
                        unitsInRetreat: gameStateResult.unit_in_retreat,
                        defaultNukeRange: gameStateResult.default_nuke_range
                    };
                })[0];
            });
            return gameState;
        });
    }
    insertGame(settingsArray) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.query(insert_game_query_1.insertNewGameQuery, settingsArray);
        });
    }
    insertRulesInGame(rules, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            return rules.map((rule) => __awaiter(this, void 0, void 0, function* () {
                return yield this.pool.query(insert_rule_in_game_query_1.insertRuleInGameQuery, [gameName, rule.key, rule.enabled]).catch((error) => {
                    console.log('Rule In Games Error:', error.message);
                });
            }));
        });
    }
    insertCoalitionScheduleQuery(gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool
                .query(insert_coalition_schedule_query_1.insertCoalitionScheduleQuery, [
                50,
                1,
                undefined,
                9,
                6,
                3,
                1,
                0,
                undefined,
                undefined,
                undefined,
                'ABB',
                undefined,
                gameName
            ])
                .catch((error) => {
                console.log('Add Coalition Error:', error.message);
            });
        });
    }
    insertAssignment(userId, countryId, assignmentType, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(insert_assignment_query_1.insertAssignmentQuery, [userId, null, 'Creator', gameName]).catch((error) => {
                console.log('New Assignment Error:', error.message);
            });
        });
    }
    insertTurn(turnArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.query(insert_turn_query_1.insertTurnQuery, turnArgs);
        });
    }
    insertProvinces(provinces, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const provincePromises = [];
            for (const provinceName in provinces) {
                provincePromises.push(this.pool
                    .query(insert_province_query_1.insertProvinceQuery, [
                    provinces[provinceName].name,
                    provinces[provinceName].fullName,
                    provinces[provinceName].type,
                    provinces[provinceName].voteType,
                    provinces[provinceName].cityLoc,
                    gameName
                ])
                    .catch((error) => {
                    console.log('Insert Province Error:', error.message);
                }));
            }
            return provincePromises;
        });
    }
    insertProvinceHistories(provinces, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const provinceHistoryPromises = [];
            for (const provinceName in provinces) {
                provinceHistoryPromises.push(this.pool
                    .query(insert_initial_province_history_query_1.insertInitialProvinceHistoryQuery, [
                    provinces[provinceName].status,
                    provinces[provinceName].voteColor,
                    provinces[provinceName].statusColor,
                    provinces[provinceName].strokeColor,
                    provinces[provinceName].country,
                    provinces[provinceName].owner,
                    gameName,
                    provinces[provinceName].name
                ])
                    .catch((error) => {
                    console.log('Insert Province History Error:', error.message);
                }));
            }
            return provinceHistoryPromises;
        });
    }
    insertTerrain(terrain, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            return terrain.map((terrain) => __awaiter(this, void 0, void 0, function* () {
                return this.pool
                    .query(insert_terrain_query_1.insertTerrainQuery, [
                    terrain.type,
                    terrain.renderCategory,
                    terrain.points,
                    terrain.bounds.top,
                    terrain.bounds.left,
                    terrain.bounds.right,
                    terrain.bounds.bottom,
                    terrain.start,
                    terrain.end,
                    gameName,
                    terrain.province
                ])
                    .catch((error) => {
                    console.log('Insert Terrain Error:', error.message);
                });
            }));
        });
    }
    insertNodes(nodes, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodePromises = [];
            for (const nodeName in nodes) {
                nodePromises.push(this.pool
                    .query(insert_node_query_1.insertNodeQuery, [
                    nodes[nodeName].name,
                    nodes[nodeName].type,
                    nodes[nodeName].loc,
                    gameName,
                    nodes[nodeName].province
                ])
                    .catch((error) => {
                    console.log('Insert Node Error:', error.message);
                }));
            }
            return nodePromises;
        });
    }
    insertNodeAdjacencies(links, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const nodeAdjacencyPromises = [];
            for (const linkName in links) {
                nodeAdjacencyPromises.push(this.pool
                    .query(insert_node_adjacency_query_1.insertNodeAdjacencyQuery, [gameName, links[linkName].alpha.name, links[linkName].omega.name])
                    .catch((error) => {
                    console.log('Insert Node Adjacency Error:', error.message);
                }));
            }
            return nodeAdjacencyPromises;
        });
    }
    insertCountries(countries, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const newCountryPromises = [];
            for (const countryName in countries) {
                newCountryPromises.push(this.pool
                    .query(insert_country_query_1.insertCountryQuery, [
                    countries[countryName].name,
                    countries[countryName].rank,
                    countries[countryName].color,
                    countries[countryName].keyName,
                    gameName
                ])
                    .catch((error) => {
                    console.log('Insert Country Error:', error.message);
                }));
            }
            return newCountryPromises;
        });
    }
    insertCountryHistories(countries, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const countryHistoryPromises = [];
            for (const countryName in countries) {
                countryHistoryPromises.push(this.pool
                    .query(insert_country_history_query_1.insertCountryHistoryQuery, [
                    countries[countryName].rank !== country_enum_1.CountryRank.N ? country_enum_1.CountryStatus.ACTIVE : country_enum_1.CountryStatus.NPC,
                    countries[countryName].cities.length,
                    countries[countryName].units.length,
                    countries[countryName].bankedBuilds,
                    countries[countryName].nuke,
                    countries[countryName].adjustments,
                    gameName,
                    countries[countryName].name
                ])
                    .catch((error) => {
                    console.log('Insert Country History Error:', error.message);
                }));
            }
            return countryHistoryPromises;
        });
    }
    insertUnits(units, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
            const unitPromises = [];
            for (const unitName in units) {
                unitPromises.push(this.pool
                    .query(insert_unit_query_1.insertUnitQuery, [units[unitName].fullName, units[unitName].type, gameName, units[unitName].country])
                    .catch((error) => {
                    console.log('Insert Unit Error:', error.message);
                }));
            }
            return unitPromises;
        });
    }
    insertUnitHistories(units, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            const initialHistoryPromises = [];
            for (const unitName in units) {
                initialHistoryPromises.push(this.pool
                    .query(insert_unit_history_query_1.insertUnitHistoryQuery, ['Active', gameName, units[unitName].fullName, units[unitName].node])
                    .catch((error) => {
                    console.log('Insert Unit History Error:', error.message);
                }));
            }
            return initialHistoryPromises;
        });
    }
    insertLabels(labels, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            labels.forEach((label) => __awaiter(this, void 0, void 0, function* () {
                yield this.pool
                    .query(insert_label_query_1.insertLabelQuery, [label.name, label.type, label.loc, label.text, label.fill, gameName, label.province])
                    .catch((error) => {
                    console.log('Insert Label Error:', error.message);
                });
            }));
        });
    }
    insertLabelLines(labelLines, gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            labelLines.forEach((labelLine) => __awaiter(this, void 0, void 0, function* () {
                yield this.pool
                    .query(insert_label_line_query_1.insertLabelLineQuery, [
                    labelLine.name,
                    labelLine.x1,
                    labelLine.x2,
                    labelLine.y1,
                    labelLine.y2,
                    labelLine.stroke,
                    gameName,
                    labelLine.province
                ])
                    .catch((error) => {
                    console.log('Insert Label Line Error:', error.message);
                });
            }));
        });
    }
    updateGameSettings(gameSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(update_game_settings_query_1.updateGameSettingsQuery, gameSettings).catch((error) => {
                console.log('Update Game Error: ' + error.message);
            });
        });
    }
    updateTurn(gameStart, turnStatus, turnNumber, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(update_turn_query_1.updateTurnQuery, [gameStart, turnStatus, turnNumber, gameId]).catch((error) => {
                console.log('Update Turn Error: ' + error.message);
            });
        });
    }
    checkGameNameAvailable(gameName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(check_game_name_availability_query_1.checkGameNameAvailabilityQuery, [gameName]);
        });
    }
    getGames(timeZone, meridiemTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_games_query_1.getGamesQuery, [timeZone])
                .then((gamesResults) => {
                return gamesResults.rows.map((game) => {
                    return new game_summary_builder_1.GameSummaryBuilder(game, timeZone, meridiemTime);
                });
            })
                .catch((error) => {
                console.log('Get Games Query Error', error.message);
            });
        });
    }
    isGameAdmin(uid, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.pool.query(check_user_game_admin_query_1.checkUserGameAdminQuery, [uid, gameId])).rows.length > 0;
        });
    }
    getGameDetails(gameId, userId, timeZone, meridiemTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_game_details_query_1.getGameDetailsQuery, [gameId, userId, timeZone])
                .then((gameDataResults) => {
                return new game_details_builder_1.GameDetailsBuilder(gameDataResults.rows[0], timeZone, meridiemTime);
            })
                .catch((error) => console.log('Get Game Data Results Error: ' + error.message));
        });
    }
    getRulesInGame(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_rules_in_game_query_1.getRulesInGameQuery, [gameId])
                .then((ruleDataResults) => {
                return ruleDataResults.rows.map((rule) => this.formattingService.convertKeysSnakeToCamel(rule));
            })
                .catch((error) => console.log('Get Rule Data Results Error: ' + error.message));
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
    getCountryState(gameId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_country_state_query_1.getCountryStateQuery, [gameId, countryId]).then((queryResult) => queryResult.rows.map((countryResult) => {
                return {
                    countryId: countryResult.country_id,
                    name: countryResult.country_name,
                    cityCount: countryResult.city_count,
                    unitCount: countryResult.unit_count,
                    retreating: countryResult.in_retreat,
                    builds: countryResult.banked_builds,
                    nukeRange: countryResult.nuke_range,
                    adjustments: countryResult.adjustments,
                    nukesInProduction: countryResult.nukes_in_production
                };
            }));
        });
    }
    getGameStats(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_game_stats_query_1.getGameStatsQuery, [gameId, turnId]).then((queryResult) => queryResult.rows.map((country) => {
                return {
                    id: country.country_id,
                    name: country.country_name,
                    rank: country.rank,
                    cityCount: country.city_count,
                    votes: country.vote_count,
                    bankedBuilds: country.banked_builds,
                    nuke: country.nuke_range,
                    adjustments: country.adjustments
                };
            }));
        });
    }
    getCoalitionSchedule(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const coalitionSchedules = yield this.pool.query(get_coalition_schedule_query_1.getCoalitionScheduleQuery, [gameId]).then((result) => result.rows.map((schedule) => {
                return {
                    baseFinal: schedule.base_final,
                    penalties: {
                        a: schedule.penalty_a,
                        b: schedule.penalty_b,
                        c: schedule.penalty_c,
                        d: schedule.penalty_d,
                        e: schedule.penalty_e,
                        f: schedule.penalty_f,
                        g: schedule.penalty_g
                    }
                };
            }));
            return coalitionSchedules[0];
        });
    }
}
exports.GameRepository = GameRepository;
//# sourceMappingURL=game-repo.js.map