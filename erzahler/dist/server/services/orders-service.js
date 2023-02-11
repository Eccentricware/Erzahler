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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const unit_enum_1 = require("../../models/enumeration/unit-enum");
const connection_1 = require("../../database/connection");
const accountService_1 = require("./accountService");
const turn_type_enum_1 = require("../../models/enumeration/turn-type-enum");
const turn_status_enum_1 = require("../../models/enumeration/turn-status-enum");
const assignment_type_enum_1 = require("../../models/enumeration/assignment-type-enum");
const country_enum_1 = require("../../models/enumeration/country-enum");
const assert_1 = __importDefault(require("assert"));
class OrdersService {
    getTurnOrders(idToken, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Identify user
            const accountService = new accountService_1.AccountService();
            const userId = yield accountService.getUserIdFromToken(idToken);
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            // Identify Player Type (Player, Admin, Spectator)
            const playerAssignments = yield connection_1.db.assignmentRepo.getUserAssignments(gameId, userId);
            // Identify Turn Type
            const playerCountries = playerAssignments.filter((assignment) => assignment.assignmentType === assignment_type_enum_1.AssignmentType.PLAYER);
            const adminAssignments = playerAssignments.filter((assignment) => {
                return (assignment.blindAdministrators === false &&
                    ((assignment.assignmentType &&
                        [assignment_type_enum_1.AssignmentType.ADMINISTRATOR, assignment_type_enum_1.AssignmentType.CREATOR].includes(assignment.assignmentType)) ||
                        assignment.username === 'Zeldark'));
            });
            const adminVision = adminAssignments.length > 0;
            const orders = {
                gameId: gameId,
                userId: userId,
                render: 'pending',
                countryId: 0
            };
            if (playerCountries.length > 0) {
                orders.role === 'player';
                const countryStates = yield connection_1.db.gameRepo.getCountryState(gameId, playerCountries[0].countryId);
                const playerCountry = countryStates[0];
                orders.countryId = playerCountry.countryId;
                let pendingTurn = undefined;
                let preliminaryTurn = undefined;
                const upcomingTurns = yield connection_1.db.schedulerRepo.getUpcomingTurns(gameId);
                if (upcomingTurns.length === 0) {
                    console.log(`GameId ${gameId} has no upcoming turns!`);
                }
                if (upcomingTurns.length > 0) {
                    pendingTurn = upcomingTurns[0];
                }
                if (upcomingTurns.length === 2) {
                    preliminaryTurn = upcomingTurns[1];
                }
                if (upcomingTurns.length > 2) {
                    console.log(`GameId ${gameId} has too many upcoming turns! (${upcomingTurns.length})`);
                }
                if (pendingTurn) {
                    // Standard Unit Movement
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {
                        orders.units = yield connection_1.db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
                        if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
                            orders.pendingDefault = false;
                        }
                        else {
                            orders.pendingDefault = true;
                        }
                    }
                    // Retreating Unit Movement
                    if ([turn_type_enum_1.TurnType.SPRING_RETREATS, turn_type_enum_1.TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
                        if (playerCountry.countryStatus === country_enum_1.CountryStatus.RETREAT) {
                            orders.units = yield connection_1.db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
                            if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
                                orders.pendingDefault = false;
                            }
                            else {
                                orders.pendingDefault = true;
                            }
                        }
                        else {
                            orders.render === 'preliminary';
                        }
                    }
                    // Transfers
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
                        const techTransferOrders = yield connection_1.db.ordersRepo.getTechTransferPartner(pendingTurn.turnId, gameState.turnId, playerCountry.countryId);
                        orders.techTransfer = techTransferOrders[0];
                        const pendingBuildTransferOrders = yield connection_1.db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, pendingTurn.turnId);
                        orders.buildTransfers = pendingBuildTransferOrders;
                    }
                    // Adjustments
                    if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
                        if (playerCountry.adjustments >= 0) {
                            const pendingBuildOrders = yield connection_1.db.ordersRepo.getBuildOrders(gameState.turnId, pendingTurn.turnId, playerCountry.countryId);
                            orders.builds = pendingBuildOrders[0];
                        }
                        else {
                            orders.disbands = yield this.prepareDisbandOrders(gameState.turnId, pendingTurn.turnId, playerCountry.countryId);
                        }
                    }
                    // Nominations
                    if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
                        orders.nomination = yield this.getNominationOrder(pendingTurn.turnId, playerCountry.countryId);
                    }
                    // Votes
                    if ([turn_type_enum_1.TurnType.VOTES, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
                        orders.votes = {
                            nominations: yield connection_1.db.ordersRepo.getVotes(pendingTurn.turnId, playerCountry.countryId)
                        };
                    }
                }
                if (preliminaryTurn) {
                    // Units
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)) {
                        orders.units = yield connection_1.db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, preliminaryTurn.turnId, gameState.turnId);
                        if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
                            orders.preliminaryDefault = false;
                        }
                        else {
                            orders.preliminaryDefault = true;
                        }
                    }
                    // Transfers
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
                        const techTransferOrders = yield connection_1.db.ordersRepo.getTechTransferPartner(preliminaryTurn.turnId, gameState.turnId, playerCountry.countryId);
                        orders.techTransfer = techTransferOrders[0];
                        const pendingBuildTransferOrders = yield connection_1.db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, preliminaryTurn.turnId);
                        orders.buildTransfers = pendingBuildTransferOrders;
                    }
                    // Adjustments
                    if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
                        if (playerCountry.adjustments >= 0) {
                            const pendingBuildOrders = yield connection_1.db.ordersRepo.getBuildOrders(gameState.turnId, preliminaryTurn.turnId, playerCountry.countryId);
                            orders.builds = pendingBuildOrders[0];
                        }
                        else {
                            orders.disbands = yield this.prepareDisbandOrders(gameState.turnId, preliminaryTurn.turnId, playerCountry.countryId);
                        }
                    }
                    // Nominations
                    if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
                        orders.nomination = yield this.getNominationOrder(preliminaryTurn.turnId, playerCountry.countryId);
                    }
                }
            }
            else if (adminVision) {
                let playerCountry;
                if (playerCountries[0]) {
                    const countryStates = yield connection_1.db.gameRepo.getCountryState(gameId, playerCountries[0].countryId);
                    playerCountry = countryStates[0];
                }
                else {
                    playerCountry = {
                        countryId: 0,
                        name: 'Administrator',
                        unitCount: -1,
                        cityCount: -1,
                        builds: -1,
                        nukeRange: -1,
                        adjustments: -1,
                        countryStatus: 'Administrator',
                        retreating: false,
                        nukesInProduction: 0
                    };
                }
                let pendingTurn = undefined;
                let preliminaryTurn = undefined;
                const upcomingTurns = yield connection_1.db.schedulerRepo.getUpcomingTurns(gameId);
                if (upcomingTurns.length === 0) {
                    console.log(`GameId ${gameId} has no upcoming turns!`);
                }
                if (upcomingTurns.length > 0) {
                    pendingTurn = upcomingTurns[0];
                }
                if (upcomingTurns.length === 2) {
                    preliminaryTurn = upcomingTurns[1];
                }
                if (upcomingTurns.length > 2) {
                    console.log(`GameId ${gameId} has too many upcoming turns! (${upcomingTurns.length})`);
                }
                if (pendingTurn) {
                    // Standard Unit Movement
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.FALL_ORDERS].includes(pendingTurn.turnType)) {
                        orders.units = yield connection_1.db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
                        if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
                            orders.pendingDefault = false;
                        }
                        else {
                            orders.pendingDefault = true;
                        }
                    }
                    // Retreating Unit Movement
                    if ([turn_type_enum_1.TurnType.SPRING_RETREATS, turn_type_enum_1.TurnType.FALL_RETREATS].includes(pendingTurn.turnType)) {
                        if (playerCountry.countryStatus === country_enum_1.CountryStatus.RETREAT) {
                            orders.units = yield connection_1.db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, pendingTurn.turnId, gameState.turnId);
                            if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
                                orders.pendingDefault = false;
                            }
                            else {
                                orders.pendingDefault = true;
                            }
                        }
                        else {
                            orders.render === 'preliminary';
                        }
                    }
                    // Transfers
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
                        const techTransferOrders = yield connection_1.db.ordersRepo.getTechTransferPartner(pendingTurn.turnId, gameState.turnId, playerCountry.countryId);
                        orders.techTransfer = techTransferOrders[0];
                        const pendingBuildTransferOrders = yield connection_1.db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, pendingTurn.turnId);
                        orders.buildTransfers = pendingBuildTransferOrders;
                    }
                    // Adjustments
                    if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
                        if (playerCountry.adjustments >= 0) {
                            const pendingBuildOrders = yield connection_1.db.ordersRepo.getBuildOrders(pendingTurn.turnId, gameState.turnId, playerCountry.countryId);
                            orders.builds = pendingBuildOrders[0];
                        }
                        else {
                            // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
                        }
                    }
                    // Nominations
                    if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
                        // const pendingNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.turnId);
                    }
                    // Votes
                    if ([turn_type_enum_1.TurnType.VOTES, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
                        // const pendingNominations: Nomination[] = await db.ordersRepo.getNominations(gameState.turnId);
                    }
                }
                if (preliminaryTurn) {
                    // Units
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)) {
                        orders.units = yield connection_1.db.ordersRepo.getTurnUnitOrders(playerCountry.countryId, preliminaryTurn.turnId, gameState.turnId);
                        if (orders.units.length > 0 && orders.units[0].orderStatus !== 'Default') {
                            orders.preliminaryDefault = false;
                        }
                        else {
                            orders.preliminaryDefault = true;
                        }
                    }
                    // Transfers
                    if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
                        const techTransferOrders = yield connection_1.db.ordersRepo.getTechTransferPartner(preliminaryTurn.turnId, gameState.turnId, playerCountry.countryId);
                        orders.techTransfer = techTransferOrders[0];
                        const pendingBuildTransferOrders = yield connection_1.db.ordersRepo.getBuildTransferOrders(playerCountry.countryId, preliminaryTurn.turnId);
                        orders.buildTransfers = pendingBuildTransferOrders;
                    }
                    // Adjustments
                    if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
                        // const preliminaryBuildLocs: BuildLoc[] = await db.ordersRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
                        // const preliminaryAtRiskUnits: AtRiskUnit[] = await db.ordersRepo.getAtRiskUnits(gameState.turnId, playerCountry.countryId);
                    }
                    // Nominations
                    if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
                        // const preliminaryNominatableCountries: NominatableCountry[] = await db.ordersRepo.getNominatableCountries(gameState.turnId);
                    }
                }
            }
            return orders;
        });
    }
    getOrderSets(gameId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            const countryOrderSets = yield connection_1.db.ordersRepo.getCountryOrderSets(gameId, gameState.turnId, countryId);
            const pendingOrderSet = countryOrderSets.find((orderSet) => orderSet.turnStatus === turn_status_enum_1.TurnStatus.PENDING);
            const preliminaryOrderSet = countryOrderSets.find((orderSet) => orderSet.turnStatus === turn_status_enum_1.TurnStatus.PRELIMINARY);
            const turnIds = {};
            if (pendingOrderSet) {
                // Standard Unit Movement
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.FALL_ORDERS].includes(pendingOrderSet.turnType)) {
                    turnIds.units = pendingOrderSet.orderSetId;
                }
                // Retreating Unit Movement
                if ([turn_type_enum_1.TurnType.SPRING_RETREATS, turn_type_enum_1.TurnType.FALL_RETREATS].includes(pendingOrderSet.turnType) &&
                    pendingOrderSet.inRetreat) {
                    turnIds.retreats = pendingOrderSet.orderSetId;
                }
                // Transfers
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingOrderSet.turnType)) {
                    turnIds.transfers = pendingOrderSet.orderSetId;
                }
                // Adjustments
                if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingOrderSet.turnType)) {
                    if (pendingOrderSet.adjustments >= 0) {
                        turnIds.builds = pendingOrderSet.orderSetId;
                    }
                    else {
                        turnIds.disbands = pendingOrderSet.orderSetId;
                    }
                }
                // Nominations
                if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingOrderSet.turnType)) {
                    turnIds.nomination = pendingOrderSet.orderSetId;
                }
                // Votes
                if ([turn_type_enum_1.TurnType.VOTES, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingOrderSet.turnType)) {
                    turnIds.votes = pendingOrderSet.orderSetId;
                }
            }
            if (preliminaryOrderSet) {
                // Standard Unit Movement
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.FALL_ORDERS].includes(preliminaryOrderSet.turnType)) {
                    turnIds.units = preliminaryOrderSet.orderSetId;
                }
                // Transfers
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS].includes(preliminaryOrderSet.turnType)) {
                    turnIds.transfers = preliminaryOrderSet.orderSetId;
                }
                // Nominations
                if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryOrderSet.turnType)) {
                    turnIds.nomination = preliminaryOrderSet.orderSetId;
                }
            }
            return turnIds;
        });
    }
    saveOrders(idToken, orders) {
        return __awaiter(this, void 0, void 0, function* () {
            // Identify user
            const accountService = new accountService_1.AccountService();
            const userId = yield accountService.getUserIdFromToken(idToken);
            const userAssigned = yield connection_1.db.assignmentRepo.confirmUserIsCountry(orders.gameId, userId, orders.countryId);
            if (userAssigned) {
                const orderSetIds = yield this.getOrderSets(orders.gameId, orders.countryId);
                // orderSetIds.votes = 542;
                if (orderSetIds.votes && orders.votes) {
                    connection_1.db.ordersRepo.saveVotes(orderSetIds.votes, orders.votes.nominations);
                }
                if (orderSetIds.units && orders.units) {
                    orders.units.forEach((unit) => __awaiter(this, void 0, void 0, function* () {
                        (0, assert_1.default)(orderSetIds.units);
                        yield connection_1.db.ordersRepo.saveUnitOrder(orderSetIds.units, unit);
                    }));
                }
                if (orderSetIds.transfers && orders.techTransfer && orders.buildTransfers) {
                    yield connection_1.db.ordersRepo.saveTransfers(orderSetIds.transfers, orders.techTransfer, orders.buildTransfers);
                }
                // if (orderSetIds.retreats && orders.units) {
                //   orders.units.forEach((unit: Order) => {
                //     assert(orderSetIds.units);
                //     db.ordersRepo.saveUnitOrder(orderSetIds.units, unit);
                //   });
                // }
                if (orderSetIds.builds && orders.builds) {
                    connection_1.db.ordersRepo.saveBuildOrders(orderSetIds.builds, orders.builds);
                }
                if (orderSetIds.units && orders.disbands) {
                    connection_1.db.ordersRepo.saveDisbandOrders(orderSetIds.units, orders.disbands);
                }
                if (orderSetIds.nomination && orders.nomination) {
                    connection_1.db.ordersRepo.saveNominationOrder(orderSetIds.nomination, orders.nomination.countryIds);
                }
            }
        });
    }
    prepareDisbandOrders(currentTurnId, pendingTurnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const disbandOrders = yield connection_1.db.ordersRepo.getDisbandOrders(currentTurnId, pendingTurnId, countryId);
            if (disbandOrders.nukeLocs.length > 0) {
                disbandOrders.nukeBuildDetails = yield connection_1.db.ordersRepo.getNukesReadyLocs(pendingTurnId, countryId);
                if (disbandOrders.nukeBuildDetails && disbandOrders.nukeBuildDetails.length < disbandOrders.nukeLocs.length) {
                    while (disbandOrders.nukeBuildDetails.length < disbandOrders.nukeLocs.length) {
                        disbandOrders.nukeBuildDetails.unshift({
                            unitId: disbandOrders.nukeBuildDetails.length * -1,
                            nodeId: 0,
                            province: '---',
                            display: '---',
                            loc: [0, 0]
                        });
                    }
                    if (disbandOrders.unitDisbandingDetailed.length < disbandOrders.unitsDisbanding.length) {
                        disbandOrders.nukeBuildDetails.forEach((nuke, index) => {
                            if (nuke.nodeId === 0) {
                                disbandOrders.unitDisbandingDetailed.unshift({
                                    unitId: index * -1,
                                    unitType: unit_enum_1.UnitType.NUKE,
                                    provinceName: nuke.province,
                                    loc: nuke.loc
                                });
                            }
                        });
                    }
                }
            }
            return disbandOrders;
        });
    }
    getNominationOrder(turnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const countryDetails = yield connection_1.db.ordersRepo.getNominationOrder(turnId, countryId);
            const countryIds = countryDetails.map((country) => country.countryId);
            if (countryIds.length > 0) {
                return {
                    countryDetails: countryDetails,
                    countryIds: countryIds,
                    coalitionSignature: `${countryDetails[0].rank}${countryDetails[1].rank}${countryDetails[2].rank}`.toUpperCase()
                };
            }
            else {
                return {
                    countryDetails: [],
                    countryIds: [0, 0, 0],
                    coalitionSignature: '---'
                };
            }
        });
    }
}
exports.OrdersService = OrdersService;
//# sourceMappingURL=orders-service.js.map