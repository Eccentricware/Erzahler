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
exports.ResolutionService = void 0;
const connection_1 = require("../../database/connection");
const order_display_enum_1 = require("../../models/enumeration/order-display-enum");
const province_enums_1 = require("../../models/enumeration/province-enums");
const turn_status_enum_1 = require("../../models/enumeration/turn-status-enum");
const turn_type_enum_1 = require("../../models/enumeration/turn-type-enum");
const unit_enum_1 = require("../../models/enumeration/unit-enum");
const options_service_1 = require("./options-service");
class ResolutionService {
    constructor() {
        this.optionService = new options_service_1.OptionsService();
    }
    startGame(gameData, startDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            const optionsService = new options_service_1.OptionsService();
            const turnNameSplit = turn_type_enum_1.TurnType.SPRING_ORDERS.split(' ');
            const firstTurn = {
                gameId: gameData.gameId,
                turnNumber: 1,
                turnName: `${turnNameSplit[0]} ${gameData.stylizedStartYear + 1} ${turnNameSplit[1]}`,
                turnType: turn_type_enum_1.TurnType.SPRING_ORDERS,
                turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                yearNumber: 1,
                deadline: startDetails.firstTurn
            };
            const nextTurn = yield connection_1.db.schedulerRepo.insertTurn(firstTurn);
            if (nextTurn.turnId) {
                yield optionsService.saveOptionsForNextTurn(gameData.gameId, nextTurn.turnId);
            }
            // Alert service call
        });
    }
    resolveTurn(turn) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const turnsWithUnitOrders = [
                turn_type_enum_1.TurnType.ORDERS_AND_VOTES,
                turn_type_enum_1.TurnType.SPRING_ORDERS,
                turn_type_enum_1.TurnType.SPRING_RETREATS,
                turn_type_enum_1.TurnType.FALL_ORDERS,
                turn_type_enum_1.TurnType.FALL_RETREATS
            ];
            const turnsWithTransfers = [turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.SPRING_ORDERS]; // Can add a check for future Transfer in Fall rule and push turn type, if desired
            // const turnsWithAdjustments = [TurnType.ADJUSTMENTS, TurnType.ADJ_AND_NOM];
            // const turnsWithNominations = [TurnType.ADJ_AND_NOM, TurnType.NOMINATIONS];
            // const turnsWithVotes = [TurnType.ORDERS_AND_VOTES, TurnType.VOTES];
            const gameState = yield connection_1.db.gameRepo.getGameState(turn.gameId);
            const countryHistories = yield connection_1.db.gameRepo.getCountryState(turn.gameId, 0);
            const provinceHistories = [];
            if (turnsWithUnitOrders.includes(turn.turnType)) {
                const unitMovementResults = yield this.resolveUnitOrders(gameState, turn);
                // provinceHistories.push(...unitMovementResults.contestedProvinces)
                unitMovementResults.forEach((result) => {
                    const finalPosition = this.getFinalPosition(result);
                    let provinceHistory = provinceHistories.find((province) => province.provinceId === finalPosition.provinceId);
                    if (provinceHistory) {
                        provinceHistory.controllerId = this.resolveControllerId(result, finalPosition, turn);
                        provinceHistory.provinceStatus = this.resolveProvinceStatus(result, finalPosition, turn);
                    }
                    else {
                        provinceHistory = this.createProvinceHistory(result, finalPosition, turn);
                    }
                    if ([order_display_enum_1.OrderDisplay.DISBAND, order_display_enum_1.OrderDisplay.NUKE].includes(result.orderType) ||
                        result.unit.status === unit_enum_1.UnitStatus.NUKED) {
                        const countryHistory = countryHistories.find((country) => country.countryId === result.unit.countryId);
                        if (countryHistory) {
                            countryHistory.adjustments++;
                            countryHistory.unitCount--;
                        }
                    }
                    if (result.orderType === order_display_enum_1.OrderDisplay.NUKE) {
                        const targetCountry = countryHistories.find((country) => country.countryId === result.destination.controllerId);
                        if (targetCountry && result.destination.provinceStatus === province_enums_1.ProvinceStatus.ACTIVE) {
                            targetCountry.adjustments--;
                            targetCountry.cityCount--;
                        }
                    }
                    if ([order_display_enum_1.OrderDisplay.MOVE, order_display_enum_1.OrderDisplay.MOVE_CONVOYED].includes(result.orderType) &&
                        [unit_enum_1.UnitStatus.ACTIVE, unit_enum_1.UnitStatus.RETREAT].includes(result.unit.status) &&
                        [unit_enum_1.UnitType.ARMY, unit_enum_1.UnitType.FLEET, unit_enum_1.UnitType.WING].includes(result.unit.type) &&
                        result.orderSuccess === false) {
                        const bounceFound = provinceHistories.find((province) => province.provinceId === result.destination.provinceId);
                        if (!bounceFound) {
                            provinceHistories.push({
                                provinceId: result.destination.provinceId,
                                controllerId: result.destination.controllerId,
                                capitalOwnerId: result.destination.capitalOwnerId,
                                provinceStatus: result.destination.provinceStatus,
                                validRetreat: false
                            });
                        }
                    }
                    provinceHistories.push(provinceHistory);
                });
            }
            if (turnsWithTransfers.includes(turn.turnType)) {
                const transferResults = yield this.resolveTransfers(gameState, turn);
                (_a = transferResults.techTransferResults) === null || _a === void 0 ? void 0 : _a.forEach((result) => {
                    if (result.success && result.hasNukes) {
                        const partnerHistory = countryHistories.find((country) => country.countryId === result.techPartnerId);
                        if (partnerHistory) {
                            partnerHistory.nukeRange = gameState.defaultNukeRange;
                        }
                    }
                });
                (_b = transferResults.buildTransferResults) === null || _b === void 0 ? void 0 : _b.forEach((result) => {
                    if (result.builds > 0) {
                        const playerCountry = countryHistories.find((country) => country.countryId === result.playerCountryId);
                        const partnerCountry = countryHistories.find((country) => country.countryId === result.countryId);
                        if (playerCountry && partnerCountry) {
                            playerCountry.builds -= result.builds;
                            partnerCountry.builds += result.builds;
                        }
                    }
                });
            }
            // if (turnsWithAdjustments.includes(turn.turnType)) {
            //   this.resolveAdjustments(gameState, turn);
            // }
            // if (turnsWithNominations.includes(turn.turnType)) {
            //   this.resolveNominations(gameState, turn);
            // }
            // if (turnsWithVotes.includes(turn.turnType)) {
            //   this.resolveVotes(gameState, turn);
            // }
            console.log('Db Write Time!');
        });
    }
    resolveUnitOrders(gameState, turn) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitOptions = this.optionService.finalizeUnitOptions(yield connection_1.db.optionsRepo.getUnitOptions(gameState.turnId, turn.turnId, 0));
            const unitOrders = yield connection_1.db.resolutionRepo.getUnitOrdersForResolution(gameState.turnId, turn.turnId);
            const orderGroups = {
                transport: [],
                hold: [],
                invalid: [],
                move: [],
                moveTransported: [],
                nuke: [],
                support: []
            };
            // If transported unit attempts, add key with initial link
            // Recursively expand all potential paths given compliant transports
            const transportAttempts = {};
            // For changes to province histories after resolution
            // const provinceEvents: ProvinceEvents = {
            //   contested: [],
            //   nuked: []
            // };
            // const contestedProvinces: ProvinceHistoryInsert[] = [];
            const dependencies = {
                dependency: {},
                heads: []
            };
            // Order Possibility Verification
            unitOrders.forEach((order) => {
                this.sortAndValidateUnitOrder(order, unitOptions, orderGroups);
            });
            // Nukes detonate or invalidate if self-targetting
            // Will include MAD orders, some day
            orderGroups.nuke.forEach((order) => {
                this.resolveNuclearLaunch(order, unitOrders);
            });
            // Support Cuts and Compliance
            orderGroups.support
                .filter((order) => order.unit.status === unit_enum_1.UnitStatus.ACTIVE)
                .forEach((order) => {
                this.resolveSupport(order, unitOrders, dependencies);
            });
            // Convoy Compliance and success
            if (orderGroups.transport.length > 0 || orderGroups.moveTransported.length > 0) {
                const transportNetwork = yield connection_1.db.resolutionRepo.getTransportNetworkInfo(gameState.turnId);
                // Stores filter logic for DRY operation
                const activeMoveTransported = orderGroups.moveTransported.filter((order) => order.unit.status === unit_enum_1.UnitStatus.ACTIVE);
                const activeTransports = orderGroups.transport.filter((order) => order.unit.status === unit_enum_1.UnitStatus.ACTIVE);
                // Creates full paths of all fully compliant routes
                activeMoveTransported.forEach((moveTransportedOrder) => {
                    this.createTransportPaths(moveTransportedOrder, orderGroups.transport, transportNetwork, transportAttempts);
                });
                // Checks carried unit compliance and full path existence for transports
                activeTransports.forEach((transportOrder) => {
                    const attemptKey = `${transportOrder.secondaryUnit.id}-${transportOrder.destination.nodeId}`;
                    if (!transportAttempts[attemptKey]) {
                        transportOrder.valid = false;
                        transportOrder.primaryResolution = `Invalid Order: Noncompliance`;
                    }
                    else if (transportAttempts[attemptKey].paths.length === 0) {
                        transportOrder.valid = false;
                        transportOrder.primaryResolution = `Invalid Order: Insufficient Compliance`;
                    }
                    else {
                        this.checkTransportSuccess(transportOrder, orderGroups.move);
                    }
                });
            }
            // Movement
            const unresolvedMovement = orderGroups.move.filter((order) => order.unit.status === unit_enum_1.UnitStatus.ACTIVE);
            const moveTransported = orderGroups.moveTransported.filter((order) => order.unit.status === unit_enum_1.UnitStatus.ACTIVE);
            unresolvedMovement.push(...moveTransported);
            unresolvedMovement.forEach((order) => {
                this.resolveMovement(order, unitOrders, dependencies);
            });
            orderGroups.hold.forEach((holdOrder) => {
                this.resolveHold(holdOrder, unitOrders);
            });
            this.checkDependencies(dependencies, unitOrders);
            return unitOrders;
            // return <UnitMovementResults> {
            //   orderResults: unitOrders
            //   // contestedProvinces: contestedProvinces
            // };
        });
    }
    sortAndValidateUnitOrder(order, unitOptions, orderGroups) {
        const options = unitOptions.find((option) => option.unitId === order.unit.id);
        if (options === undefined) {
            console.log(`orderId ${order.orderId} with unitId ${order.unit.id} doesn't even have matching options. This should be impossible but here we are!`);
            this.invalidateOrder(order, `Incredibly Invalid`);
        }
        else if (!options.orderTypes.includes(order.orderType)) {
            this.invalidateOrder(order, `Invalid Order Type`);
        }
        else if (order.orderType === order_display_enum_1.OrderDisplay.HOLD) {
            orderGroups.hold.push(order);
        }
        else if (order.orderType === order_display_enum_1.OrderDisplay.MOVE) {
            const destinationIds = options.moveDestinations.map((destination) => destination.nodeId);
            if (!destinationIds.includes(order.destination.nodeId)) {
                this.invalidateOrder(order, `Invalid Destination`);
            }
            else {
                orderGroups.move.push(order);
            }
        }
        else if (order.orderType === order_display_enum_1.OrderDisplay.MOVE_CONVOYED) {
            const destinationIds = options.moveTransportedDestinations.map((destination) => destination.nodeId);
            if (!destinationIds.includes(order.destination.nodeId)) {
                this.invalidateOrder(order, `Invalid Destination`);
            }
            else {
                orderGroups.moveTransported.push(order);
            }
        }
        else if (order.orderType === order_display_enum_1.OrderDisplay.NUKE) {
            const targetIds = options.nukeTargets.map((destination) => destination.nodeId);
            if (!targetIds.includes(order.destination.nodeId)) {
                this.invalidateOrder(order, `Invalid Target`);
            }
            else {
                orderGroups.nuke.push(order);
            }
        }
        else if (order.orderType === order_display_enum_1.OrderDisplay.SUPPORT) {
            const supportableUnitIds = options.supportStandardUnits.map((unit) => unit.id);
            if (!supportableUnitIds.includes(order.secondaryUnit.id)) {
                this.invalidateOrder(order, 'Invalid Support Unit');
            }
            else {
                const supportDestinationIds = options.supportStandardDestinations[order.secondaryUnit.id].map((destination) => destination.nodeId);
                if (!supportDestinationIds.includes(order.destination.nodeId)) {
                    this.invalidateOrder(order, 'Invalid Support Destination');
                }
                else {
                    orderGroups.support.push(order);
                }
            }
        }
        else if (order.orderType === order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED) {
            const supportableUnitIds = options.supportTransportedUnits.map((unit) => unit.id);
            if (!supportableUnitIds.includes(order.secondaryUnit.id)) {
                this.invalidateOrder(order, 'Invalid Support Unit');
            }
            else {
                const supportDestinationIds = options.supportTransportedDestinations[order.secondaryUnit.id].map((destination) => destination.nodeId);
                if (!supportDestinationIds.includes(order.destination.nodeId)) {
                    this.invalidateOrder(order, 'Invalid Support Destination');
                }
                else {
                    orderGroups.support.push(order);
                }
            }
        }
        else if ([order_display_enum_1.OrderDisplay.AIRLIFT, order_display_enum_1.OrderDisplay.CONVOY].includes(order.orderType)) {
            const transportableUnitIds = options.transportableUnits.map((unit) => unit.id);
            if (!transportableUnitIds.includes(order.secondaryUnit.id)) {
                this.invalidateOrder(order, `Invalid ${order.orderType} Unit`);
            }
            else {
                const transportDestinationIds = options.transportDestinations[order.secondaryUnit.id].map((destination) => destination.nodeId);
                if (!transportDestinationIds.includes(order.destination.nodeId)) {
                    this.invalidateOrder(order, `Invalid ${order.orderType} Destination`);
                }
                else {
                    orderGroups.transport.push(order);
                }
            }
        }
        order.valid = true;
    }
    invalidateOrder(order, failureDescription) {
        order.valid = false;
        order.primaryResolution = failureDescription;
        // order.orderType = OrderDisplay.HOLD;
        // order.destination = {
        //   id: 0,
        //   provinceId: 0,
        //   provinceName: 'Invalid',
        //   nodeName: 'Invalid',
        //   nodeType: 'Invalid'
        // };
    }
    resolveNuclearLaunch(order, orders) {
        const victim = orders.find((victim) => victim.origin.provinceId === order.destination.provinceId);
        if (victim && victim.unit.countryId === order.unit.countryId) {
            order.valid = false;
            order.primaryResolution = `Invalid order: No self nuking`;
        }
        else {
            order.unit.status = unit_enum_1.UnitStatus.DETONATED;
        }
        if (victim && victim.unit.countryId !== order.unit.countryId) {
            victim.unit.status = unit_enum_1.UnitStatus.NUKED;
            victim.primaryResolution = `Invalid order: Nuked`;
        }
    }
    /**
     * Checks compliance, cuts, risk of self-dislodge.
     * @param order
     * @param orders
     */
    resolveSupport(order, orders, dependencies) {
        const supportedUnit = orders.find((unit) => unit.unit.id === order.secondaryUnit.id);
        if (supportedUnit) {
            if (supportedUnit.destination.nodeId !== order.destination.nodeId) {
                order.primaryResolution = `Invalid Order: Noncompliance`;
                return;
            }
            if (supportedUnit.unit.status === unit_enum_1.UnitStatus.NUKED) {
                order.valid = false;
                order.orderSuccess = false;
                order.primaryResolution = `Invalid Order: Supported Unit Nuked`;
                return;
            }
            const destinationNuked = orders.find((strike) => strike.orderType === order_display_enum_1.OrderDisplay.NUKE && strike.destination.provinceId === order.destination.provinceId);
            if (destinationNuked) {
                order.valid = false;
                order.orderSuccess = false;
                order.primaryResolution = `Invalid Order: Can't Support Into Nuclear Fallout`;
                return;
            }
            const validCuts = orders.filter((attack) => attack.destination.provinceId === order.origin.provinceId &&
                attack.unit.countryId !== order.unit.countryId &&
                attack.origin.provinceId !== supportedUnit.destination.provinceId);
            if (validCuts.length > 0) {
                order.primaryResolution = order.primaryResolution
                    ? `${order.primaryResolution}. Failed: Support Cut`
                    : 'Failed: Support Cut';
                order.supportCut = true;
            }
            if (!order.supportCut) {
                const defender = orders.find((defender) => defender.origin.provinceId === order.destination.provinceId);
                if (defender) {
                    if ([
                        order_display_enum_1.OrderDisplay.HOLD,
                        order_display_enum_1.OrderDisplay.AIRLIFT,
                        order_display_enum_1.OrderDisplay.CONVOY,
                        order_display_enum_1.OrderDisplay.SUPPORT,
                        order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED
                    ].includes(defender.orderType) &&
                        defender.unit.countryId === order.unit.countryId) {
                        order.valid = false;
                        order.primaryResolution = `Invalid Order: Can't Self-Dislodge`;
                    }
                    if ([order_display_enum_1.OrderDisplay.MOVE, order_display_enum_1.OrderDisplay.MOVE_CONVOYED].includes(defender.orderType) &&
                        defender.unit.countryId === order.unit.countryId &&
                        order.valid) {
                        this.setDependency(dependencies, order.orderId, defender.orderId, `Can't Self-Dislodge`);
                    }
                }
                if (order.valid && !order.supportCut) {
                    order.orderSuccess = true;
                    supportedUnit.power++;
                    order.primaryResolution = `Supported Unit Power: ${supportedUnit.power}`;
                }
            }
            else {
                this.resolveHold(order, orders, true);
            }
        }
    }
    setDependency(dependencies, orderId, dependendentId, explanation) {
        dependencies.dependency[dependendentId] = {
            orderId: orderId,
            explanation: explanation
        };
        const depIndex = dependencies.heads.indexOf(orderId);
        if (depIndex > -1) {
            dependencies.heads[depIndex] = dependendentId;
        }
        else {
            dependencies.heads.push(dependendentId);
        }
    }
    createTransportPaths(order, transportOrders, transportNetwork, transportAttempts) {
        var _a;
        const attemptId = `${order.unit.id}-${order.destination.nodeId}`;
        transportAttempts[attemptId] = {
            success: false,
            paths: []
        };
        const compliantTransportsIds = transportOrders
            .filter((transport) => transport.secondaryUnit.id === order.unit.id && transport.destination.nodeId === order.destination.nodeId)
            .map((transport) => transport.unit.id);
        const compliantTransports = transportNetwork.filter((transport) => compliantTransportsIds.includes(transport.unitId));
        let initialTransportIds = (_a = transportNetwork
            .find((transported) => transported.unitId === order.unit.id)) === null || _a === void 0 ? void 0 : _a.transports.map((transport) => transport.unitId);
        if (initialTransportIds === undefined) {
            initialTransportIds = [];
        }
        initialTransportIds.forEach((transportId) => {
            this.extendTransportPath(transportId, [], order, compliantTransports, transportAttempts[attemptId]);
        });
    }
    extendTransportPath(currentLinkId, committed, order, compliantTransports, transportAttempt) {
        const currentTransport = compliantTransports.find((transport) => transport.unitId === currentLinkId);
        if (currentTransport) {
            const newCommitted = committed.slice();
            newCommitted.push(currentLinkId);
            const destination = currentTransport.destinations.find((destination) => destination.nodeId === order.destination.nodeId);
            if (destination) {
                if (transportAttempt.paths) {
                    transportAttempt.paths.push({
                        transports: newCommitted,
                        success: true
                    });
                }
                else {
                    transportAttempt.paths = [
                        {
                            transports: newCommitted,
                            success: true
                        }
                    ];
                }
            }
            else {
                const nextTransports = this.getNextTransports(order.unit.id, newCommitted, compliantTransports);
                nextTransports.forEach((transportId) => {
                    this.extendTransportPath(transportId, newCommitted, order, compliantTransports, transportAttempt);
                });
            }
        }
    }
    getNextTransports(currentUnitId, committedTransportIds, compliantTransports) {
        var _a;
        const nextTransports = (_a = compliantTransports
            .find((transport) => transport.unitId === currentUnitId)) === null || _a === void 0 ? void 0 : _a.transports.filter((transport) => !committedTransportIds.includes(transport.unitId)).map((transport) => transport.unitId);
        return nextTransports ? nextTransports : [];
    }
    /**
     * Primary difference between convoy success and move success is that convoys are non-transported only.
     * This prevents.
     */
    checkTransportSuccess(transportOrder, moveStandardOrders) {
        const challengers = moveStandardOrders.filter((challengingOrder) => challengingOrder.destination.nodeId === transportOrder.origin.nodeId && challengingOrder.valid);
        if (challengers.length === 0) {
            transportOrder.orderSuccess = true;
            transportOrder.primaryResolution = `Success`;
            return;
        }
        const challenges = {};
        let maxPower = transportOrder.power;
        challengers.forEach((challenger) => {
            if (challenges[challenger.power]) {
                challenges[challenger.power].push(challenger.unit.id);
            }
            else {
                challenges[challenger.power] = [challenger.unit.id];
            }
            maxPower = challenger.power > maxPower ? challenger.power : maxPower;
        });
        const transportPowerSummary = this.createTransportPowerConflictSummary(transportOrder.power, challenges, maxPower);
        if (maxPower > transportOrder.power && challenges[maxPower].length === 1) {
            transportOrder.orderSuccess = false;
            transportOrder.primaryResolution = `Hold Failed: ${transportPowerSummary}`;
            transportOrder.unit.status = unit_enum_1.UnitStatus.RETREAT;
        }
        else if (maxPower > transportOrder.power) {
            transportOrder.orderSuccess = true;
            transportOrder.primaryResolution = `Hold Victory: Bouncing Challengers ${transportPowerSummary}`;
        }
        else if (maxPower === transportOrder.power) {
            transportOrder.orderSuccess = true;
            transportOrder.primaryResolution = `Hold Victory: ${transportPowerSummary}`;
        }
        challengers.forEach((challenger) => {
            this.resolveTransportChallenge(transportOrder.power, challenger, challenges, maxPower);
        });
    }
    createTransportPowerConflictSummary(transportOrderPower, challenges, maxPower) {
        let powerSummary = `${transportOrderPower}`;
        let currentPower = maxPower;
        while (currentPower > 0) {
            challenges[currentPower].forEach(() => {
                powerSummary += `v${currentPower}`;
            });
            currentPower--;
        }
        return powerSummary;
    }
    resolveTransportChallenge(transportOrderPower, challenger, challenges, maxPower) {
        const victory = challenger.power === maxPower && challenges[maxPower].length === 1;
        let summary = victory ? `Victory: ` : `Bounce: `;
        challenger.orderSuccess = victory;
        let currentPower = maxPower;
        while (currentPower > 0) {
            challenges[currentPower].forEach((challengerId) => {
                if (challenger.unit.id !== challengerId) {
                    summary += `v${currentPower}`;
                }
            });
            if (transportOrderPower === currentPower) {
                summary += `v${transportOrderPower}`;
            }
            currentPower--;
        }
        challenger.primaryResolution = summary;
    }
    resolveMovement(order, unitOrders, dependencies) {
        const nuclearStrike = unitOrders.find((strike) => strike.orderType === order_display_enum_1.OrderDisplay.NUKE && strike.destination.provinceId === order.destination.provinceId);
        if (nuclearStrike) {
            order.valid = false;
            order.orderSuccess = false;
            order.primaryResolution = `Invalid Order: Can't Enter Nuclear Fallout`;
            return;
        }
        const holdingChallenger = unitOrders.find((challenger) => challenger.origin.provinceId === order.destination.provinceId &&
            [order_display_enum_1.OrderDisplay.AIRLIFT, order_display_enum_1.OrderDisplay.CONVOY, order_display_enum_1.OrderDisplay.HOLD].includes(challenger.orderType) &&
            challenger.orderSuccess === null &&
            challenger.valid === true);
        const incomingChallengers = unitOrders.filter((challenger) => challenger.destination.provinceId === order.destination.provinceId &&
            [order_display_enum_1.OrderDisplay.MOVE, order_display_enum_1.OrderDisplay.MOVE_CONVOYED].includes(challenger.orderType) &&
            challenger.unit.id !== order.unit.id &&
            challenger.valid === true);
        if (holdingChallenger) {
            if (holdingChallenger.unit.countryId === order.unit.countryId) {
                order.valid = false;
                order.primaryResolution = `Invalid Order: Can't Self-Dislodge`;
                return;
            }
            incomingChallengers.push(holdingChallenger);
        }
        if (incomingChallengers.length > 0) {
            this.resolveMovementChallenge(order, incomingChallengers);
        }
        else {
            order.orderSuccess = true;
            order.primaryResolution = 'Success';
        }
        if (order.orderSuccess) {
            const leavingUnit = unitOrders.find((leavingUnit) => leavingUnit.origin.provinceId === order.destination.provinceId);
            if (leavingUnit && order.power === 1) {
                this.setDependency(dependencies, leavingUnit.orderId, order.orderId, `Failed: Bounce 1v1`);
            }
            else if (leavingUnit && leavingUnit.unit.countryId === order.unit.countryId) {
                this.setDependency(dependencies, leavingUnit.orderId, order.orderId, `Invalid Order: Can't Self-Dislodge`);
            }
        }
        else {
            this.resolveHold(order, unitOrders, true, 1);
        }
    }
    resolveMovementChallenge(movementOrder, challengers) {
        const challenges = {};
        let maxPower = movementOrder.power;
        challengers.forEach((challenger) => {
            if (challenges[challenger.power]) {
                challenges[challenger.power].push(challenger.power);
            }
            else {
                challenges[challenger.power] = [challenger.power];
            }
            maxPower = challenger.power > maxPower ? challenger.power : maxPower;
        });
        const victory = movementOrder.power === maxPower && !challenges[maxPower];
        let summary = victory ? `Victory: ${movementOrder.power}` : `Bounce: ${movementOrder.power}`;
        movementOrder.orderSuccess = victory;
        let currentPower = maxPower;
        while (currentPower > 0) {
            if (challenges[currentPower]) {
                challenges[currentPower].forEach(() => {
                    summary += `v${currentPower}`;
                });
            }
            currentPower--;
        }
        movementOrder.primaryResolution = summary;
    }
    checkDependencies(dependencies, unitOrders) {
        dependencies.heads.forEach((orderId) => {
            this.checkDependency(orderId, dependencies, unitOrders);
        });
    }
    /**
     * Checks holds and supports when attacked. Supporting check follows after support description.
     * @param holdOrder
     * @param unitOrders
     * @param supporting
     */
    resolveHold(holdOrder, unitOrders, secondary, power) {
        holdOrder.orderSuccess = secondary ? false : true;
        holdOrder.power = power ? power : holdOrder.power;
        // holdOrder.primaryResolution = 'Success';;
        const challenges = {};
        let maxPower = holdOrder.power;
        const challengers = unitOrders.filter((challenger) => challenger.destination.provinceId === holdOrder.origin.provinceId &&
            [order_display_enum_1.OrderDisplay.MOVE, order_display_enum_1.OrderDisplay.MOVE_CONVOYED].includes(challenger.orderType));
        challengers.forEach((challenger) => {
            if (challenges[challenger.power]) {
                challenges[challenger.power].push(challenger.power);
            }
            else {
                challenges[challenger.power] = [challenger.power];
            }
            maxPower = challenger.power > maxPower ? challenger.power : maxPower;
        });
        if (challengers.length > 0) {
            const victory = holdOrder.power === maxPower;
            let summary = victory ? `Victory: ` : `Dislodged: `;
            holdOrder.orderSuccess = victory;
            let currentPower = maxPower;
            while (currentPower > 0) {
                if (challenges[currentPower]) {
                    challenges[currentPower].forEach(() => {
                        summary += `v${currentPower}`;
                    });
                }
                currentPower--;
            }
            if (secondary) {
                holdOrder.secondaryResolution = summary;
            }
            else {
                holdOrder.primaryResolution = summary;
            }
        }
    }
    checkDependency(orderId, dependencies, unitOrders) {
        const independency = unitOrders.find((order) => order.orderId === orderId);
        if (independency) {
            const dependency = unitOrders.find((order) => order.orderId === dependencies.dependency[orderId].orderId);
            if (dependency) {
                if (!independency.orderSuccess) {
                    dependency.orderSuccess = false;
                    dependency.primaryResolution = dependencies.dependency[orderId].explanation;
                }
                if (dependencies.dependency[dependency.orderId]) {
                    this.checkDependency(dependency.orderId, dependencies, unitOrders);
                }
            }
        }
    }
    resolveTransfers(gameState, turn) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferResources = {
                countryResources: yield connection_1.db.resolutionRepo.getTransferResourceValidation(gameState.turnId),
                handshakes: {
                    offers: {},
                    requests: {}
                }
            };
            transferResources.techTransferResults = yield this.validateTechTransfers(turn.turnId, gameState.turnId, transferResources);
            transferResources.buildTransferResults = yield this.validateBuildTransfers(turn.turnId, transferResources);
            return transferResources;
        });
    }
    validateTechTransfers(nextTurnId, currentTurnId, transferResources) {
        return __awaiter(this, void 0, void 0, function* () {
            const techTransferOrders = yield connection_1.db.ordersRepo.getTechTransferPartner(nextTurnId, currentTurnId, 0);
            techTransferOrders.forEach((order) => {
                const partnerCountry = techTransferOrders.find((resource) => resource.countryId === order.techPartnerId);
                if (partnerCountry) {
                    const playerCountry = techTransferOrders.find((resource) => resource.countryId === order.countryId);
                    if (playerCountry) {
                        if (playerCountry.hasNukes && !partnerCountry.hasNukes) {
                            transferResources.handshakes.offers[playerCountry.countryId] = partnerCountry.countryId;
                            if (transferResources.handshakes.requests[partnerCountry.countryId] === playerCountry.countryId) {
                                playerCountry.success = true;
                                partnerCountry.success = true;
                            }
                        }
                        else if (!playerCountry.hasNukes && partnerCountry.hasNukes) {
                            transferResources.handshakes.requests[playerCountry.countryId] = partnerCountry.countryId;
                            if (transferResources.handshakes.offers[partnerCountry.countryId] === playerCountry.countryId) {
                                playerCountry.success = true;
                                partnerCountry.success = true;
                            }
                        }
                    }
                }
            });
            return techTransferOrders;
        });
    }
    validateBuildTransfers(turnId, transferResources) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildTransferOrders = yield connection_1.db.ordersRepo.getBuildTransferOrders(0, turnId);
            buildTransferOrders.forEach((transferOrder) => {
                const playerCountry = transferResources.countryResources.find((country) => country.countryId === transferOrder.playerCountryId);
                if (playerCountry) {
                    if (playerCountry.buildsRemaining >= transferOrder.builds) {
                        playerCountry.buildsRemaining -= transferOrder.builds;
                    }
                    else {
                        transferOrder.builds = playerCountry === null || playerCountry === void 0 ? void 0 : playerCountry.buildsRemaining;
                        playerCountry.buildsRemaining -= transferOrder.builds;
                    }
                }
            });
            return buildTransferOrders;
        });
    }
    // async resolveAdjustments(gameState: GameState, turn: UpcomingTurn): Promise<void> {
    // }
    // async resolveNominations(gameState: GameState, turn: UpcomingTurn): Promise<void> {
    // }
    // async resolveVotes(gameState: GameState, turn: UpcomingTurn): Promise<void> {
    // }
    getFinalPosition(result) {
        let finalPosition = result.origin;
        if ((result.unit.status === unit_enum_1.UnitStatus.ACTIVE ||
            result.unit.status === unit_enum_1.UnitStatus.RETREAT ||
            result.unit.status === unit_enum_1.UnitStatus.DETONATED) &&
            (result.orderType === order_display_enum_1.OrderDisplay.MOVE ||
                result.orderType === order_display_enum_1.OrderDisplay.MOVE_CONVOYED ||
                result.orderType === order_display_enum_1.OrderDisplay.NUKE) &&
            result.orderSuccess) {
            finalPosition = result.destination;
        }
        return finalPosition;
    }
    createProvinceHistory(result, finalPosition, turn) {
        return {
            provinceId: finalPosition.provinceId,
            controllerId: this.resolveControllerId(result, finalPosition, turn),
            capitalOwnerId: finalPosition.capitalOwnerId,
            provinceStatus: this.resolveProvinceStatus(result, finalPosition, turn),
            validRetreat: false
        };
    }
    resolveControllerId(result, finalPosition, turn) {
        if (([province_enums_1.ProvinceType.COAST, province_enums_1.ProvinceType.INLAND, province_enums_1.ProvinceType.ISLAND].includes(finalPosition.provinceType) &&
            turn.hasCaptures &&
            result.unit.canCapture) ||
            ([province_enums_1.ProvinceType.COAST, province_enums_1.ProvinceType.INLAND, province_enums_1.ProvinceType.ISLAND].includes(finalPosition.provinceType) &&
                finalPosition.provinceStatus === province_enums_1.ProvinceStatus.INERT)) {
            return result.unit.countryId;
        }
        else {
            return finalPosition.controllerId;
        }
    }
    resolveProvinceStatus(result, finalPosition, turn) {
        if (result.orderType === order_display_enum_1.OrderDisplay.NUKE && [province_enums_1.VoteType.CAPITAL, province_enums_1.VoteType.VOTE].includes(finalPosition.voteType)) {
            return province_enums_1.ProvinceStatus.NUKED;
        }
        else if (result.orderType === order_display_enum_1.OrderDisplay.NUKE) {
            return province_enums_1.ProvinceStatus.INERT;
        }
        if ([province_enums_1.ProvinceType.COAST, province_enums_1.ProvinceType.INLAND, province_enums_1.ProvinceType.ISLAND].includes(finalPosition.provinceType) && [
            province_enums_1.ProvinceStatus.ACTIVE,
            province_enums_1.ProvinceStatus.DORMANT,
            province_enums_1.ProvinceStatus.BOMBARDED
        ] &&
            turn.hasCaptures &&
            result.unit.canCapture) {
            return province_enums_1.ProvinceStatus.ACTIVE;
        }
        if ([province_enums_1.ProvinceType.COAST, province_enums_1.ProvinceType.INLAND, province_enums_1.ProvinceType.ISLAND].includes(finalPosition.provinceType) && [
            province_enums_1.ProvinceStatus.ACTIVE,
            province_enums_1.ProvinceStatus.DORMANT,
            province_enums_1.ProvinceStatus.BOMBARDED
        ] &&
            turn.hasCaptures &&
            result.unit.type === unit_enum_1.UnitType.WING) {
            return province_enums_1.ProvinceStatus.BOMBARDED;
        }
        return province_enums_1.ProvinceStatus.INERT;
    }
    getOrCreateProvinceHistory(provinceHistories, finalPosition) {
        let provinceHistory = provinceHistories.find((province) => province.provinceId === finalPosition.provinceId);
        if (provinceHistory === undefined) {
            provinceHistory = {
                // resolutionEvent: ResolutionEvent.PERPETUATION,
                provinceId: finalPosition.provinceId,
                controllerId: finalPosition.capitalOwnerId,
                capitalOwnerId: finalPosition.capitalOwnerId,
                provinceStatus: finalPosition.provinceStatus,
                validRetreat: true
            };
        }
        return provinceHistory;
    }
    prepareDbEntries() {
        const orders = [];
        const orderSets = [];
        const units = [];
        const unitHistories = [];
        const provinceHistories = [];
        const countryHistories = [];
        const turns = [];
    }
}
exports.ResolutionService = ResolutionService;
//# sourceMappingURL=resolutionService.js.map