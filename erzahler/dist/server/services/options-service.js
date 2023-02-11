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
exports.OptionsService = void 0;
const connection_1 = require("../../database/connection");
const order_display_enum_1 = require("../../models/enumeration/order-display-enum");
const turn_status_enum_1 = require("../../models/enumeration/turn-status-enum");
const turn_type_enum_1 = require("../../models/enumeration/turn-type-enum");
const unit_enum_1 = require("../../models/enumeration/unit-enum");
const accountService_1 = require("./accountService");
const data_structure_service_1 = require("./data-structure-service");
class OptionsService {
    saveOptionsForNextTurn(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            const optionsContext = yield this.processUnitOrderOptions(gameState);
            yield this.saveUnitOrderOptions(optionsContext, turnId ? turnId : optionsContext.turnId);
        });
    }
    processUnitOrderOptions(gameState) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitInfo = yield this.getUnitAdjacencyInfo(gameState.gameId, gameState.turnId);
            const optionsCtx = {
                gameId: gameState.gameId,
                unitInfo: unitInfo,
                unitIdToIndexLib: {},
                sharedAdjProvinces: {},
                potentialConvoyProvinces: {},
                validConvoyAssistProvinces: [],
                transportPaths: {},
                transports: {},
                transportables: {},
                transportDestinations: {},
                turnId: gameState.turnId
            };
            this.sortAdjacencyInfo(optionsCtx);
            this.processTransportPaths(optionsCtx);
            this.processMoveSupport(optionsCtx);
            this.processNukeOptions(gameState, optionsCtx);
            return optionsCtx;
        });
    }
    sortAdjacencyInfo(optionsCtx) {
        // Holds can be pulled at get options
        // Organizes data for all ops, but completes adjacency options
        optionsCtx.unitInfo.forEach((unit, index) => {
            optionsCtx.unitIdToIndexLib[unit.unitId] = index;
            // Standard move support
            unit.adjacencies.forEach((adjacency) => {
                if (optionsCtx.sharedAdjProvinces[adjacency.provinceId]) {
                    optionsCtx.sharedAdjProvinces[adjacency.provinceId].push({
                        unitId: unit.unitId,
                        nodeId: adjacency.nodeId,
                        transported: false
                    });
                }
                else {
                    optionsCtx.sharedAdjProvinces[adjacency.provinceId] = [
                        {
                            unitId: unit.unitId,
                            nodeId: adjacency.nodeId,
                            transported: false
                        }
                    ];
                }
            });
            // Transport Option Extraction
            if (unit.adjacentTransportables) {
                unit.adjacentTransportables.forEach((transportable) => {
                    if (optionsCtx.transportables[transportable.unitId]) {
                        optionsCtx.transportables[transportable.unitId].push(unit.unitId);
                    }
                    else {
                        optionsCtx.transportables[transportable.unitId] = [unit.unitId];
                    }
                });
            }
            if (unit.adjacentTransports) {
                unit.adjacentTransports.forEach((transport) => {
                    if (optionsCtx.transports[unit.unitId]) {
                        optionsCtx.transports[unit.unitId].push(transport.unitId);
                    }
                    else {
                        optionsCtx.transports[unit.unitId] = [transport.unitId];
                    }
                });
            }
            if (unit.transportDestinations) {
                optionsCtx.transportDestinations[unit.unitId] = unit.transportDestinations.map((destination) => {
                    return destination.nodeId;
                });
                unit.transportDestinations.forEach((destination) => {
                    if (!optionsCtx.potentialConvoyProvinces[destination.nodeId]) {
                        optionsCtx.potentialConvoyProvinces[destination.nodeId] = {
                            provinceId: unit.provinceId,
                            nodeId: destination.nodeId
                        };
                    }
                });
            }
        });
    }
    processMoveSupport(optionsCtx) {
        for (const province in optionsCtx.sharedAdjProvinces) {
            if (optionsCtx.sharedAdjProvinces[province].length > 1) {
                const unitsInReach = optionsCtx.sharedAdjProvinces[province];
                unitsInReach.forEach((commandedUnit, commandIdx) => {
                    unitsInReach.forEach((supportedUnit, supportIdx) => {
                        if (commandIdx !== supportIdx) {
                            const cmdUnitDetails = this.getDetailedUnit(optionsCtx, commandedUnit.unitId);
                            if (supportedUnit.transported) {
                                if (cmdUnitDetails.transportSupports[supportedUnit.unitId]) {
                                    cmdUnitDetails.transportSupports[supportedUnit.unitId].push(supportedUnit.nodeId);
                                }
                                else {
                                    cmdUnitDetails.transportSupports[supportedUnit.unitId] = [supportedUnit.nodeId];
                                }
                            }
                            else {
                                if (cmdUnitDetails.moveSupports[supportedUnit.unitId]) {
                                    cmdUnitDetails.moveSupports[supportedUnit.unitId].push(supportedUnit.nodeId);
                                }
                                else {
                                    cmdUnitDetails.moveSupports[supportedUnit.unitId] = [supportedUnit.nodeId];
                                }
                            }
                        }
                    });
                });
            }
        }
    }
    processTransportPaths(optionsCtx) {
        this.startPaths(optionsCtx);
        for (const transportedUnitId in optionsCtx.transportPaths) {
            this.extendPath(optionsCtx, optionsCtx.transportPaths[transportedUnitId], Number(transportedUnitId));
        }
    }
    startPaths(optionsCtx) {
        for (const transportableId in optionsCtx.transportables) {
            const firstPathLink = {
                transports: [],
                destinations: [],
                contributions: {},
                transportOptions: optionsCtx.transports[transportableId],
                nextTransportLink: {}
            };
            optionsCtx.transportPaths[transportableId] = firstPathLink;
        }
    }
    extendPath(optionsCtx, currentPathLink, transportedUnitId) {
        currentPathLink.transportOptions.forEach((transportId) => {
            const nextTransports = currentPathLink.destinations.slice();
            nextTransports.push(transportId);
            const nextDestinations = currentPathLink.destinations.slice();
            nextDestinations.push(...optionsCtx.transportDestinations[transportId]);
            let nextTransportOptions = [];
            if (optionsCtx.transports[transportId]) {
                nextTransportOptions = optionsCtx.transports[transportId].filter((optionId) => !nextTransports.includes(optionId));
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nextContributions = (0, data_structure_service_1.copyObjectOfArrays)(currentPathLink.contributions);
            for (const transport in nextContributions) {
                nextContributions[transport].push(...optionsCtx.transportDestinations[transportId]);
            }
            nextContributions[transportId] = optionsCtx.transportDestinations[transportId].slice();
            const nextTransportLink = {
                destinations: nextDestinations,
                nextTransportLink: {},
                transportOptions: nextTransportOptions,
                transports: nextTransports,
                contributions: nextContributions
            };
            if (nextTransportOptions.length > 0) {
                currentPathLink.nextTransportLink[transportId] = nextTransportLink;
                this.extendPath(optionsCtx, currentPathLink.nextTransportLink[transportId], transportedUnitId);
            }
            else {
                const transportedUnit = this.getDetailedUnit(optionsCtx, transportedUnitId);
                (0, data_structure_service_1.mergeArrays)(transportedUnit.moveTransported, nextDestinations);
                for (const transportId in nextContributions) {
                    const transportingUnit = this.getDetailedUnit(optionsCtx, Number(transportId));
                    if (transportedUnit.allTransports[transportedUnitId]) {
                        (0, data_structure_service_1.mergeArrays)(transportingUnit.allTransports[transportedUnitId], nextContributions[transportId]);
                    }
                    else {
                        transportingUnit.allTransports[transportedUnitId] = [...nextContributions[transportId]];
                    }
                    this.addConvoysToSharedAdjProvinces(optionsCtx, nextContributions[transportId], transportedUnitId);
                }
            }
        });
    }
    addConvoysToSharedAdjProvinces(optionsCtx, contributions, transportedUnitId) {
        contributions.forEach((contributionId) => {
            const convoyProvince = optionsCtx.potentialConvoyProvinces[contributionId];
            const adjProvince = optionsCtx.sharedAdjProvinces[convoyProvince.provinceId];
            const doesNotHaveUnit = adjProvince.filter((adjProvince) => adjProvince.unitId === transportedUnitId).length === 0;
            if (doesNotHaveUnit) {
                optionsCtx.sharedAdjProvinces[convoyProvince.provinceId].push({
                    nodeId: contributionId,
                    unitId: transportedUnitId,
                    transported: true
                });
            }
        });
    }
    getDetailedUnit(optionsCtx, unitId) {
        return optionsCtx.unitInfo[optionsCtx.unitIdToIndexLib[unitId]];
    }
    getUnitAdjacencyInfo(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitOtions = yield connection_1.db.optionsRepo.getUnitAdjacencyInfo(gameId, turnId);
            return unitOtions;
        });
    }
    processNukeOptions(gameState, optionsCtx) {
        return __awaiter(this, void 0, void 0, function* () {
            const airAdjArray = yield connection_1.db.optionsRepo.getAirAdjacencies(gameState.gameId);
            const nukeTargetLib = {};
            const unlimitedRangeTargets = [];
            airAdjArray.forEach((nukeTarget, index) => {
                nukeTargetLib[nukeTarget.provinceName] = index;
                unlimitedRangeTargets.push(nukeTarget.nodeId);
            });
            optionsCtx.unitInfo
                .filter((unit) => unit.unitType === unit_enum_1.UnitType.NUKE)
                .forEach((unit) => {
                if (unit.nukeRange === 0) {
                    unit.nukeTargets = unlimitedRangeTargets;
                }
                else if (unit.nukeRange) {
                    unit.nukeTargets = this.processLimitedNukeTargets(airAdjArray, nukeTargetLib, unit);
                }
            });
        });
    }
    processLimitedNukeTargets(airAdjArray, nukeTargetLib, unit) {
        const nukeTargets = airAdjArray[nukeTargetLib[unit.provinceName]].adjacencies.map((target) => {
            return target.provinceName;
        });
        let rangeProcessed = 1;
        while (rangeProcessed < unit.nukeRange && nukeTargets.length < airAdjArray.length) {
            const targetsToAdd = [];
            nukeTargets.forEach((target) => {
                (0, data_structure_service_1.mergeArrays)(targetsToAdd, airAdjArray[nukeTargetLib[target]].adjacencies.map((target) => target.provinceName));
            });
            (0, data_structure_service_1.mergeArrays)(nukeTargets, targetsToAdd);
            rangeProcessed++;
        }
        return nukeTargets.map((target) => {
            return airAdjArray[nukeTargetLib[target]].nodeId;
        });
    }
    /**
     * Takes a finalized OptionsContext and assigned it to the provided turnId
     *
     * @param optionsContext
     * @param turnId
     */
    saveUnitOrderOptions(optionsContext, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderOptions = [];
            optionsContext.unitInfo.forEach((unit) => {
                if (unit.adjacencies.length > 0) {
                    orderOptions.push(this.formatStandardMovement(unit, optionsContext.turnId));
                }
                if (unit.moveTransported.length > 0) {
                    orderOptions.push(this.formatTransportedMovement(unit, optionsContext.turnId));
                }
                if (unit.holdSupports && unit.holdSupports.length > 0) {
                    orderOptions.push(...this.formatSupportHold(unit, optionsContext.turnId));
                }
                if (Object.keys(unit.moveSupports).length > 0) {
                    orderOptions.push(...this.formatSupportMoveStandard(unit, optionsContext.turnId));
                }
                if (Object.keys(unit.transportSupports).length > 0) {
                    orderOptions.push(...this.formatSupportMoveTransported(unit, optionsContext.turnId));
                }
                if (Object.keys(unit.allTransports).length > 0) {
                    orderOptions.push(...this.formatTransport(unit, optionsContext.turnId));
                }
                if (unit.nukeTargets.length > 0) {
                    orderOptions.push(this.formatNuke(unit, optionsContext.turnId));
                }
            });
            if (orderOptions.length > 0) {
                // await db.ordersRepo.saveOrderOptions(orderOptions, turnId);
                this.saveDefaultOrders(optionsContext.gameId);
            }
        });
    }
    formatStandardMovement(unit, turnId) {
        const stdMovementDestinations = unit.adjacencies.map((adjacency) => adjacency.nodeId);
        const stdMovementOptions = {
            unitId: unit.unitId,
            orderType: order_display_enum_1.OrderDisplay.MOVE,
            secondaryUnitId: undefined,
            destinations: stdMovementDestinations,
            turnId: turnId
        };
        return stdMovementOptions;
    }
    formatTransportedMovement(unit, turnId) {
        return {
            unitId: unit.unitId,
            orderType: order_display_enum_1.OrderDisplay.MOVE_CONVOYED,
            destinations: unit.moveTransported,
            turnId: turnId
        };
    }
    formatSupportHold(unit, turnId) {
        let holdSupportOptions = [];
        if (unit.holdSupports) {
            holdSupportOptions = unit.holdSupports.map((secondaryUnit) => {
                return {
                    unitId: unit.unitId,
                    orderType: order_display_enum_1.OrderDisplay.SUPPORT,
                    secondaryUnitId: secondaryUnit.unitId,
                    secondaryOrderType: order_display_enum_1.OrderDisplay.HOLD,
                    turnId: turnId
                };
            });
        }
        return holdSupportOptions;
    }
    formatSupportMoveStandard(unit, turnId) {
        const moveSupports = [];
        for (const supportedId in unit.moveSupports) {
            moveSupports.push({
                unitId: unit.unitId,
                orderType: order_display_enum_1.OrderDisplay.SUPPORT,
                secondaryUnitId: Number(supportedId),
                secondaryOrderType: order_display_enum_1.OrderDisplay.MOVE,
                destinations: unit.moveSupports[supportedId],
                turnId: turnId
            });
        }
        return moveSupports;
    }
    formatSupportMoveTransported(unit, turnId) {
        const moveConvoyedSupport = [];
        for (const supportedId in unit.transportSupports) {
            moveConvoyedSupport.push({
                unitId: unit.unitId,
                orderType: order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED,
                secondaryUnitId: Number(supportedId),
                secondaryOrderType: order_display_enum_1.OrderDisplay.MOVE_CONVOYED,
                destinations: unit.transportSupports[supportedId],
                turnId: turnId
            });
        }
        return moveConvoyedSupport;
    }
    formatTransport(unit, turnId) {
        const transportOptions = [];
        for (const transportedId in unit.allTransports) {
            transportOptions.push({
                unitId: unit.unitId,
                orderType: unit.unitType === unit_enum_1.UnitType.FLEET ? order_display_enum_1.OrderDisplay.CONVOY : order_display_enum_1.OrderDisplay.AIRLIFT,
                secondaryUnitId: Number(transportedId),
                secondaryOrderType: order_display_enum_1.OrderDisplay.MOVE,
                destinations: unit.allTransports[transportedId],
                turnId: turnId
            });
        }
        return transportOptions;
    }
    formatNuke(unit, turnId) {
        return {
            unitId: unit.unitId,
            orderType: order_display_enum_1.OrderDisplay.NUKE,
            destinations: unit.nukeTargets,
            turnId: turnId
        };
    }
    saveDefaultOrders(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            const upcomingTurns = yield connection_1.db.schedulerRepo.getUpcomingTurns(gameId);
            const pendingTurn = upcomingTurns.filter((turn) => turn.turnStatus === turn_status_enum_1.TurnStatus.PENDING)[0];
            const preliminaryTurn = upcomingTurns.filter((turn) => turn.turnStatus === turn_status_enum_1.TurnStatus.PRELIMINARY)[0];
            if (pendingTurn && !pendingTurn.defaultsReady) {
                this.saveTurnDefaults(pendingTurn, gameState.turnId);
            }
            if (preliminaryTurn && !preliminaryTurn.defaultsReady) {
                this.saveTurnDefaults(preliminaryTurn, gameState.turnId);
            }
        });
    }
    saveTurnDefaults(upcomingTurn, currentTurnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderSetLibrary = {};
            const newOrderSets = yield connection_1.db.ordersRepo.insertTurnOrderSets(currentTurnId, upcomingTurn.turnId);
            newOrderSets.forEach((orderSet) => (orderSetLibrary[orderSet.countryId] = orderSet.orderSetId));
            const unitOptions = yield connection_1.db.optionsRepo.getUnitOptions(currentTurnId, upcomingTurn.turnId);
            const preppedOrderLibrary = {};
            const defaultOrders = [];
            if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(upcomingTurn.turnType)) {
                unitOptions.forEach((option) => {
                    if (!preppedOrderLibrary[option.unitId]) {
                        preppedOrderLibrary[option.unitId] = {
                            unitId: option.unitId,
                            orderType: order_display_enum_1.OrderDisplay.HOLD,
                            destinationId: undefined,
                            countryId: Number(option.unitCountryId)
                        };
                    }
                });
            }
            else if (upcomingTurn.turnType === turn_type_enum_1.TurnType.FALL_ORDERS) {
                unitOptions.forEach((option) => {
                    if (!preppedOrderLibrary[option.unitId]) {
                        if (option.canHold) {
                            preppedOrderLibrary[option.unitId] = {
                                unitId: option.unitId,
                                orderType: order_display_enum_1.OrderDisplay.HOLD,
                                destinationId: undefined,
                                countryId: Number(option.unitCountryId)
                            };
                        }
                        else if (option.orderType === order_display_enum_1.OrderDisplay.MOVE) {
                            preppedOrderLibrary[option.unitId] = {
                                unitId: option.unitId,
                                orderType: order_display_enum_1.OrderDisplay.MOVE,
                                destinationId: option.destinations[0].nodeId,
                                countryId: Number(option.unitCountryId)
                            };
                        }
                    }
                });
            }
            else if ([turn_type_enum_1.TurnType.SPRING_RETREATS, turn_type_enum_1.TurnType.FALL_RETREATS].includes(upcomingTurn.turnType)) {
                // Basic retreats for testing, may be necessary to flesh out in detail later
                unitOptions.forEach((option) => {
                    if (!preppedOrderLibrary[option.unitId]) {
                        if (option.orderType === order_display_enum_1.OrderDisplay.MOVE) {
                            preppedOrderLibrary[option.unitId] = {
                                unitId: option.unitId,
                                orderType: order_display_enum_1.OrderDisplay.MOVE,
                                destinationId: option.destinations[0].nodeId,
                                countryId: Number(option.unitCountryId)
                            };
                        }
                    }
                });
            }
            for (const unitId in preppedOrderLibrary) {
                defaultOrders.push({
                    orderSetId: orderSetLibrary[preppedOrderLibrary[unitId].countryId],
                    orderedUnitId: preppedOrderLibrary[unitId].unitId,
                    orderType: preppedOrderLibrary[unitId].orderType,
                    destinationId: preppedOrderLibrary[unitId].destinationId
                });
            }
            connection_1.db.ordersRepo.saveDefaultOrders(defaultOrders).then((success) => {
                connection_1.db.ordersRepo.setTurnDefaultsPrepped(upcomingTurn.turnId);
            });
        });
    }
    getTurnOptions(idToken, gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountService = new accountService_1.AccountService();
            const userId = yield accountService.getUserIdFromToken(idToken);
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            let playerCountry = undefined;
            const playerCountries = yield connection_1.db.assignmentRepo.getUserAssignments(gameId, userId);
            if (playerCountries.length > 0) {
                const countryStates = yield connection_1.db.gameRepo.getCountryState(gameId, playerCountries[0].countryId);
                playerCountry = countryStates[0];
            }
            if (playerCountry === undefined) {
                return 'User is not assigned an active country';
            }
            let pendingTurn = undefined;
            let preliminaryTurn = undefined;
            const upcomingTurns = yield connection_1.db.schedulerRepo.getUpcomingTurns(gameId);
            if (upcomingTurns.length === 0) {
                console.log(`GameId ${gameId} has no upcoming turns!`);
            }
            else if (upcomingTurns.length > 0) {
                pendingTurn = upcomingTurns[0];
            }
            if (upcomingTurns.length === 2) {
                preliminaryTurn = upcomingTurns[1];
            }
            else if (upcomingTurns.length > 2) {
                console.log(`GameId ${gameId} has too many turns! (${upcomingTurns.length})`);
            }
            const turnOptions = {
                playerId: userId,
                countryId: playerCountry.countryId,
                countryName: playerCountry.name
            };
            if (pendingTurn) {
                turnOptions.pending = {
                    id: pendingTurn.turnId,
                    name: pendingTurn.turnName,
                    deadline: pendingTurn.deadline
                };
                // Move back after dev
                turnOptions.votes = {
                    turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                    options: yield this.getVotingOptions(pendingTurn.turnId)
                };
                ////
                // Units
                if ([
                    turn_type_enum_1.TurnType.SPRING_ORDERS,
                    turn_type_enum_1.TurnType.ORDERS_AND_VOTES,
                    turn_type_enum_1.TurnType.SPRING_RETREATS,
                    turn_type_enum_1.TurnType.FALL_ORDERS,
                    turn_type_enum_1.TurnType.FALL_RETREATS
                ].includes(pendingTurn.turnType)) {
                    turnOptions.units = {
                        turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                        options: this.finalizeUnitOptions(yield connection_1.db.optionsRepo.getUnitOptions(gameState.turnId, pendingTurn.turnId, playerCountry.countryId))
                    };
                }
                // Transfers
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
                    if (playerCountry.builds > 0) {
                        const buildTransferOptions = yield connection_1.db.optionsRepo.getBuildTransferOptions(gameId, gameState.turnId);
                        buildTransferOptions.unshift({ countryId: 0, countryName: '--Keep Builds--' });
                        turnOptions.buildTransfers = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            options: buildTransferOptions,
                            builds: playerCountry.builds
                        };
                    }
                    if (playerCountry.nukeRange !== null) {
                        const techTransferOptions = yield connection_1.db.optionsRepo.getTechOfferOptions(gameId, gameState.turnId);
                        techTransferOptions.unshift({ countryId: 0, countryName: '--Do Not Offer Tech--' });
                        turnOptions.receiveTechOptions = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            options: techTransferOptions
                        };
                    }
                    else {
                        const techTransferOptions = yield connection_1.db.optionsRepo.getTechReceiveOptions(gameId, gameState.turnId);
                        techTransferOptions.unshift({ countryId: 0, countryName: '--Do Not Request Tech--' });
                        turnOptions.offerTechOptions = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            options: techTransferOptions
                        };
                    }
                }
                // Adjustments
                if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
                    if (playerCountry.adjustments >= 0) {
                        const buildLocsResult = yield connection_1.db.optionsRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
                        const buildLocs = {
                            land: [],
                            sea: [],
                            air: []
                        };
                        buildLocsResult.forEach((loc) => {
                            if (loc.seaNodeName && loc.seaNodeName.split('_').length > 2 && loc.seaNodeId && loc.seaNodeLoc) {
                                if (buildLocs.land.filter((landLoc) => landLoc.nodeId === loc.landNodeId).length === 0) {
                                    buildLocs.land.push({
                                        province: loc.provinceName,
                                        display: loc.provinceName,
                                        nodeId: loc.landNodeId,
                                        loc: loc.landNodeLoc
                                    });
                                    buildLocs.air.push({
                                        province: loc.provinceName,
                                        display: loc.provinceName,
                                        nodeId: loc.airNodeId,
                                        loc: loc.airNodeLoc
                                    });
                                }
                                const locDisplay = loc.seaNodeName.toUpperCase().split('_');
                                buildLocs.sea.push({
                                    province: loc.provinceName,
                                    display: locDisplay[0] + ' ' + locDisplay[2],
                                    nodeId: loc.seaNodeId,
                                    loc: loc.seaNodeLoc
                                });
                            }
                            else {
                                buildLocs.land.push({
                                    province: loc.provinceName,
                                    display: loc.provinceName,
                                    nodeId: loc.landNodeId,
                                    loc: loc.landNodeLoc
                                });
                                if (loc.seaNodeId && loc.seaNodeLoc)
                                    buildLocs.sea.push({
                                        province: loc.provinceName,
                                        display: loc.provinceName,
                                        nodeId: loc.seaNodeId,
                                        loc: loc.seaNodeLoc
                                    });
                                buildLocs.air.push({
                                    province: loc.provinceName,
                                    display: loc.provinceName,
                                    nodeId: loc.airNodeId,
                                    loc: loc.airNodeLoc
                                });
                            }
                        });
                        turnOptions.builds = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            locations: buildLocs,
                            builds: playerCountry.adjustments
                        };
                    }
                    else {
                        turnOptions.disbands = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            options: yield this.getDisbandOptions(gameState, pendingTurn, playerCountry)
                        };
                    }
                }
                // Nominations
                if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(pendingTurn.turnType)) {
                    turnOptions.nominations = {
                        turnStatus: pendingTurn.turnStatus,
                        options: yield this.getNominationOptions(gameState.gameId, gameState.turnId, turn_status_enum_1.TurnStatus.PENDING)
                    };
                }
                // Votes
                if ([turn_type_enum_1.TurnType.VOTES, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(pendingTurn.turnType)) {
                    turnOptions.votes = {
                        turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                        options: yield this.getVotingOptions(pendingTurn.turnId)
                    };
                }
            }
            if (preliminaryTurn) {
                turnOptions.preliminary = {
                    id: preliminaryTurn.turnId,
                    name: preliminaryTurn.turnName,
                    deadline: preliminaryTurn.deadline
                };
                // Units
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES, turn_type_enum_1.TurnType.FALL_ORDERS].includes(preliminaryTurn.turnType)) {
                    turnOptions.units = {
                        turnStatus: turn_status_enum_1.TurnStatus.PRELIMINARY,
                        options: this.finalizeUnitOptions(yield connection_1.db.optionsRepo.getUnitOptions(gameState.turnId, preliminaryTurn.turnId, playerCountry.countryId))
                    };
                }
                // Transfers
                if ([turn_type_enum_1.TurnType.SPRING_ORDERS, turn_type_enum_1.TurnType.ORDERS_AND_VOTES].includes(preliminaryTurn.turnType)) {
                    if (playerCountry.builds > 0) {
                        turnOptions.buildTransfers = {
                            turnStatus: turn_status_enum_1.TurnStatus.PRELIMINARY,
                            options: yield connection_1.db.optionsRepo.getBuildTransferOptions(gameId, gameState.turnId),
                            builds: playerCountry.builds
                        };
                    }
                    if (playerCountry.nukeRange) {
                        turnOptions.offerTechOptions = {
                            turnStatus: turn_status_enum_1.TurnStatus.PRELIMINARY,
                            options: yield connection_1.db.optionsRepo.getTechOfferOptions(gameId, gameState.turnId)
                        };
                    }
                    else {
                        turnOptions.offerTechOptions = {
                            turnStatus: turn_status_enum_1.TurnStatus.PRELIMINARY,
                            options: yield connection_1.db.optionsRepo.getTechReceiveOptions(gameId, gameState.turnId)
                        };
                    }
                }
                // Adjustments
                if ([turn_type_enum_1.TurnType.ADJUSTMENTS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
                    if (playerCountry.adjustments >= 0) {
                        const buildLocsResult = yield connection_1.db.optionsRepo.getAvailableBuildLocs(gameId, gameState.turnId, playerCountry.countryId);
                        const buildLocs = {
                            land: [],
                            sea: [],
                            air: []
                        };
                        buildLocsResult.forEach((loc) => {
                            if (loc.seaNodeName && loc.seaNodeName.split('_').length > 2 && loc.seaNodeId && loc.seaNodeLoc) {
                                if (buildLocs.land.filter((landLoc) => landLoc.nodeId === loc.landNodeId).length === 0) {
                                    buildLocs.land.push({
                                        province: loc.provinceName,
                                        display: loc.provinceName,
                                        nodeId: loc.landNodeId,
                                        loc: loc.landNodeLoc
                                    });
                                    buildLocs.air.push({
                                        province: loc.provinceName,
                                        display: loc.provinceName,
                                        nodeId: loc.airNodeId,
                                        loc: loc.airNodeLoc
                                    });
                                }
                                const locDisplay = loc.seaNodeName.toUpperCase().split('_');
                                buildLocs.sea.push({
                                    province: loc.provinceName,
                                    display: locDisplay[0] + ' ' + locDisplay[2],
                                    nodeId: loc.seaNodeId,
                                    loc: loc.seaNodeLoc
                                });
                            }
                            else {
                                buildLocs.land.push({
                                    province: loc.provinceName,
                                    display: loc.provinceName,
                                    nodeId: loc.landNodeId,
                                    loc: loc.landNodeLoc
                                });
                                if (loc.seaNodeId && loc.seaNodeLoc)
                                    buildLocs.sea.push({
                                        province: loc.provinceName,
                                        display: loc.provinceName,
                                        nodeId: loc.seaNodeId,
                                        loc: loc.seaNodeLoc
                                    });
                                buildLocs.air.push({
                                    province: loc.provinceName,
                                    display: loc.provinceName,
                                    nodeId: loc.airNodeId,
                                    loc: loc.airNodeLoc
                                });
                            }
                        });
                        turnOptions.builds = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            locations: buildLocs,
                            builds: playerCountry.adjustments
                        };
                    }
                    else {
                        turnOptions.disbands = {
                            turnStatus: turn_status_enum_1.TurnStatus.PENDING,
                            options: yield this.getDisbandOptions(gameState, preliminaryTurn, playerCountry)
                        };
                    }
                }
                // Nominations
                if ([turn_type_enum_1.TurnType.NOMINATIONS, turn_type_enum_1.TurnType.ADJ_AND_NOM].includes(preliminaryTurn.turnType)) {
                    turnOptions.nominations = {
                        turnStatus: preliminaryTurn.turnStatus,
                        options: yield this.getNominationOptions(gameState.gameId, gameState.turnId, turn_status_enum_1.TurnStatus.PENDING)
                    };
                }
            }
            return turnOptions;
        });
    }
    finalizeUnitOptions(options) {
        const unitOptionsLibrary = {};
        const unitOptionsFormatted = [];
        options.forEach((option) => {
            if (!unitOptionsLibrary[option.unitId]) {
                unitOptionsLibrary[option.unitId] = this.newUnitEssentialsKit(option);
            }
            const unit = unitOptionsLibrary[option.unitId];
            if (option.orderType === order_display_enum_1.OrderDisplay.MOVE) {
                this.finalizeStandardMovement(option, unit);
            }
            if (option.orderType === order_display_enum_1.OrderDisplay.MOVE_CONVOYED) {
                this.finalizeTransportedMovement(option, unit);
            }
            if (option.orderType === order_display_enum_1.OrderDisplay.SUPPORT) {
                if (!unit.orderTypes.includes(order_display_enum_1.OrderDisplay.SUPPORT)) {
                    unit.orderTypes.push(order_display_enum_1.OrderDisplay.SUPPORT);
                }
                if (!option.destinations) {
                    this.finalizeHoldSupport(option, unit);
                }
                else {
                    this.finalizeMoveSupport(option, unit);
                }
            }
            if (option.orderType === order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED) {
                this.finalizeMoveConvoyedSupport(option, unit);
            }
            if (option.orderType === order_display_enum_1.OrderDisplay.CONVOY) {
                this.finalizeConvoys(option, unit);
            }
            if (option.orderType === order_display_enum_1.OrderDisplay.AIRLIFT) {
                this.finalizeAirlifts(option, unit);
            }
            if (option.orderType === order_display_enum_1.OrderDisplay.NUKE) {
                this.finalizeNukeTargets(option, unit);
            }
        });
        this.transposeUnitOptions(unitOptionsLibrary, unitOptionsFormatted);
        return unitOptionsFormatted;
    }
    finalizeStandardMovement(option, unit) {
        unit.orderTypes.push(order_display_enum_1.OrderDisplay.MOVE);
        unit.moveDestinations = this.sortDestinations(option.destinations);
    }
    finalizeTransportedMovement(option, unit) {
        unit.orderTypes.push(order_display_enum_1.OrderDisplay.MOVE_CONVOYED);
        unit.moveTransportedDestinations = this.sortDestinations(option.destinations);
    }
    finalizeNukeTargets(option, unit) {
        unit.orderTypes.push(order_display_enum_1.OrderDisplay.NUKE);
        unit.nukeTargets = this.sortDestinations(option.destinations);
    }
    finalizeHoldSupport(option, unit) {
        if (option.secondaryUnitId && option.secondaryUnitLoc) {
            if (unit.supportStandardDestinations[option.secondaryUnitId]) {
                unit.supportStandardDestinations[option.secondaryUnitId].unshift(this.newUnitHoldNode(option.secondaryUnitLoc));
            }
            else {
                unit.supportStandardUnits.push(this.newSecondaryUnit(option));
                unit.supportStandardDestinations[option.secondaryUnitId] = [this.newUnitHoldNode(option.secondaryUnitLoc)];
            }
        }
        else {
            console.log(`Unit ${option.unitId} is attempting a support an invalid secondaryUnit: ` +
                `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
        }
    }
    finalizeMoveSupport(option, unit) {
        if (option.secondaryUnitId && option.secondaryUnitLoc) {
            if (unit.supportStandardDestinations[option.secondaryUnitId]) {
                unit.supportStandardDestinations[option.secondaryUnitId].push(...this.sortDestinations(option.destinations));
            }
            else {
                unit.supportStandardUnits.push(this.newSecondaryUnit(option));
                unit.supportStandardDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);
            }
        }
        else {
            console.log(`Unit ${option.unitId} is attempting a support an invalid secondaryUnit: ` +
                `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
        }
    }
    finalizeMoveConvoyedSupport(option, unit) {
        if (option.secondaryUnitId && option.secondaryUnitLoc) {
            if (!unit.orderTypes.includes(order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED)) {
                unit.orderTypes.push(order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED);
            }
            unit.supportTransportedUnits.push(this.newSecondaryUnit(option));
            unit.supportTransportedDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);
        }
        else {
            console.log(`Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: ` +
                `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
        }
    }
    finalizeConvoys(option, unit) {
        if (option.secondaryUnitId && option.secondaryUnitLoc) {
            if (!unit.orderTypes.includes(order_display_enum_1.OrderDisplay.CONVOY)) {
                unit.orderTypes.push(order_display_enum_1.OrderDisplay.CONVOY);
            }
            unit.transportableUnits.push(this.newSecondaryUnit(option));
            unit.transportDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);
        }
        else {
            console.log(`Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: ` +
                `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
        }
    }
    finalizeAirlifts(option, unit) {
        if (option.secondaryUnitId && option.secondaryUnitLoc) {
            if (!unit.orderTypes.includes(order_display_enum_1.OrderDisplay.AIRLIFT)) {
                unit.orderTypes.push(order_display_enum_1.OrderDisplay.AIRLIFT);
            }
            unit.transportableUnits.push(this.newSecondaryUnit(option));
            unit.transportDestinations[option.secondaryUnitId] = this.sortDestinations(option.destinations);
        }
        else {
            console.log(`Unit ${option.unitId} is attempting a convoyed support an invalid secondaryUnit: ` +
                `ID: ${option.secondaryUnitId} | loc: ${option.secondaryUnitLoc}`);
        }
    }
    newUnitEssentialsKit(option) {
        return {
            unitId: option.unitId,
            unitType: option.unitType,
            unitDisplay: `${option.unitType} ${option.provinceName}`,
            unitLoc: option.unitLoc,
            nodeId: option.nodeId,
            orderTypes: option.canHold ? [order_display_enum_1.OrderDisplay.HOLD] : [],
            moveDestinations: [],
            moveTransportedDestinations: [],
            nukeTargets: [],
            supportStandardUnits: [],
            supportStandardDestinations: {},
            supportTransportedUnits: [],
            supportTransportedDestinations: {},
            transportableUnits: [],
            transportDestinations: {}
        };
    }
    newSecondaryUnit(option) {
        return {
            id: option.secondaryUnitId,
            displayName: `${option.secondaryUnitType} ${option.secondaryProvinceName}`,
            loc: option.secondaryUnitLoc
        };
    }
    /**
     * Returns {
     *   nodeId: 0,
     *   nodeName: OrderDisplay.HOLD,
     *   loc: loc
     * }
     * @param loc
     * @returns
     */
    newUnitHoldNode(loc) {
        return {
            nodeId: 0,
            nodeName: order_display_enum_1.OrderDisplay.HOLD,
            loc: loc
        };
    }
    sortActions(unit) {
        const orderTypes = [];
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.HOLD)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.HOLD);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.MOVE)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.MOVE);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.MOVE_CONVOYED)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.MOVE_CONVOYED);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.SUPPORT)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.SUPPORT);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.SUPPORT_CONVOYED);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.CONVOY)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.CONVOY);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.AIRLIFT)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.AIRLIFT);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.NUKE)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.NUKE);
        }
        if (unit.orderTypes.includes(order_display_enum_1.OrderDisplay.DISBAND)) {
            orderTypes.push(order_display_enum_1.OrderDisplay.DISBAND);
        }
        unit.orderTypes = orderTypes;
    }
    sortSecondaryUnits(units) {
        const nameToIndex = {};
        const sortArray = units.map((unit, index) => {
            nameToIndex[unit.displayName] = index;
            return unit.displayName.split(' ')[1];
        });
        const sortedArray = [];
        sortArray.sort().forEach((province) => {
            sortedArray.push(units[nameToIndex[province]]);
        });
        return sortedArray;
    }
    sortDestinations(destinations) {
        const nameToIndex = {};
        let hasHold = false;
        let holdNodeLoc = [];
        const sortArray = destinations.map((destination, index) => {
            if (destination.nodeId === 0) {
                hasHold = true;
                holdNodeLoc = destination.loc;
            }
            nameToIndex[destination.nodeName] = index;
            return destination.nodeName;
        });
        const sortedArray = [];
        if (hasHold) {
            sortedArray.push(this.newUnitHoldNode(holdNodeLoc));
        }
        sortArray.sort().forEach((nodeName) => {
            if (nodeName !== order_display_enum_1.OrderDisplay.HOLD) {
                sortedArray.push(destinations[nameToIndex[nodeName]]);
            }
        });
        return sortedArray;
    }
    transposeUnitOptions(unitOptionsLibrary, unitOptionsFormatted) {
        const sortArray = [];
        const nameToIndex = {};
        for (const unitId in unitOptionsLibrary) {
            this.sortActions(unitOptionsLibrary[unitId]);
            const province = unitOptionsLibrary[unitId].unitDisplay.split(' ')[1];
            sortArray.push(province);
            nameToIndex[province] = Number(unitId);
        }
        sortArray.sort();
        sortArray.forEach((provinceName) => {
            unitOptionsFormatted.push(unitOptionsLibrary[nameToIndex[provinceName]]);
        });
    }
    getDisbandOptions(gameState, turn, countryState) {
        return __awaiter(this, void 0, void 0, function* () {
            const disbandOptions = {
                disbandCount: countryState.adjustments * -1,
                cityCount: countryState.cityCount,
                unitCount: countryState.unitCount,
                units: yield connection_1.db.optionsRepo.getAtRiskUnits(gameState.turnId, countryState.countryId),
                nukesInProduction: countryState.nukesInProduction,
                nukeLocs: []
            };
            if (countryState.nukesInProduction > 0) {
                for (let index = 0; index < countryState.nukesInProduction; index++) {
                    disbandOptions.units.unshift({
                        unitId: index * -1,
                        unitType: unit_enum_1.UnitType.NUKE,
                        provinceName: 'Finished',
                        loc: [0, 0]
                    });
                }
                const cityDisbandList = yield connection_1.db.optionsRepo.getActiveCountryCenters(gameState.turnId, countryState.countryId);
                cityDisbandList.unshift({
                    nodeId: 0,
                    loc: [0, 0],
                    province: '---',
                    display: '---'
                });
                disbandOptions.nukeLocs = cityDisbandList;
            }
            return disbandOptions;
        });
    }
    getNominationOptions(gameId, turnId, turnStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const nominatableCountries = yield connection_1.db.optionsRepo.getNominatableCountries(turnId);
            const coaliationSchedule = yield connection_1.db.gameRepo.getCoalitionSchedule(gameId);
            nominatableCountries.forEach((country) => {
                country.penalty = coaliationSchedule.penalties[country.rank];
            });
            nominatableCountries.unshift({
                countryId: 0,
                countryName: '-- Select Country--',
                rank: '-',
                penalty: 0
            });
            return {
                victoryBase: coaliationSchedule.baseFinal,
                countries: nominatableCountries
            };
        });
    }
    getVotingOptions(turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const nominations = yield connection_1.db.optionsRepo.getNominations(turnId);
            const duplicateAlerts = [];
            const signatureCounts = {};
            const spliceIndeces = [];
            nominations.forEach((nomination, index) => {
                const countrySignature = nomination.countries
                    .map((country) => country.countryName)
                    .sort()
                    .join(', ');
                if (signatureCounts[countrySignature]) {
                    signatureCounts[countrySignature]++;
                    spliceIndeces.push(index);
                }
                else {
                    signatureCounts[countrySignature] = 1;
                }
            });
            for (const signature in signatureCounts) {
                if (signatureCounts[signature] > 1) {
                    duplicateAlerts.push(`${signature} was nominated ${signatureCounts[signature]} times!`);
                }
            }
            for (let index = spliceIndeces.length - 1; index >= 0; index--) {
                nominations.splice(spliceIndeces[index], 1);
            }
            return {
                duplicateAlerts: duplicateAlerts,
                nominations: nominations
            };
        });
    }
}
exports.OptionsService = OptionsService;
//# sourceMappingURL=options-service.js.map