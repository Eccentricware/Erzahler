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
exports.OrdersRepository = void 0;
const pg_1 = require("pg");
const unit_enum_1 = require("../../models/enumeration/unit-enum");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const get_turn_unit_orders_1 = require("../queries/orders/get-turn-unit-orders");
const insert_turn_order_sets_1 = require("../queries/orders/insert-turn-order-sets");
const get_build_orders_query_1 = require("../queries/orders/orders-final/get-build-orders-query");
const get_build_transfer_orders_query_1 = require("../queries/orders/orders-final/get-build-transfer-orders-query");
const get_country_order_sets_query_1 = require("../queries/orders/orders-final/get-country-order-sets-query");
const get_disband_orders_query_1 = require("../queries/orders/orders-final/get-disband-orders-query");
const get_finished_nuke_orders_query_1 = require("../queries/orders/orders-final/get-finished-nuke-orders-query");
const get_nomination_order_query_1 = require("../queries/orders/orders-final/get-nomination-order-query");
const get_tech_transfer_order_query_1 = require("../queries/orders/orders-final/get-tech-transfer-order-query");
const get_votes_orders_query_1 = require("../queries/orders/orders-final/get-votes-orders-query");
const save_build_orders_query_1 = require("../queries/orders/orders-final/save-build-orders-query");
const save_disband_orders_query_1 = require("../queries/orders/orders-final/save-disband-orders-query");
const save_nomination_query_1 = require("../queries/orders/orders-final/save-nomination-query");
const save_transfer_orders_query_1 = require("../queries/orders/orders-final/save-transfer-orders-query");
const save_unit_order_query_1 = require("../queries/orders/orders-final/save-unit-order-query");
const save_votes_query_1 = require("../queries/orders/orders-final/save-votes-query");
const set_turn_defaults_prepared_query_1 = require("../queries/orders/set-turn-defaults-prepared-query");
class OrdersRepository {
    /**
     * @param db
     * @param pgp
     */
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
        this.orderSetCols = new pgp.helpers.ColumnSet(['country_id', 'turn_id', 'message_id', 'submission_time', 'order_set_type', 'order_set_name'], { table: 'order_sets' });
        this.orderCols = new pgp.helpers.ColumnSet([
            'order_set_id',
            'order_type',
            'ordered_unit_id',
            'secondary_unit_id',
            'destination_id',
            'order_status',
            'order_success'
        ], { table: 'orders' });
        this.orderOptionsCols = new pgp.helpers.ColumnSet(['unit_id', 'order_type', 'secondary_unit_id', 'secondary_order_type', 'destinations', 'turn_id'], { table: 'order_options' });
    }
    saveDefaultOrders(defaultOrders) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderValues = defaultOrders.map((order) => {
                return {
                    order_set_id: order.orderSetId,
                    order_type: order.orderType,
                    ordered_unit_id: order.orderedUnitId,
                    destination_id: order.destinationId,
                    secondary_unit_id: undefined,
                    order_status: 'Default',
                    order_success: undefined
                };
            });
            const query = this.pgp.helpers.insert(orderValues, this.orderCols);
            return this.db.query(query);
        });
    }
    //// Legacy Functions ////
    insertTurnOrderSets(currentTurnId, nextTurnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orderSets = yield this.pool
                .query(insert_turn_order_sets_1.insertTurnOrderSetsQuery, [nextTurnId, currentTurnId])
                .then((result) => result.rows.map((orderSetResult) => {
                return {
                    orderSetId: orderSetResult.order_set_id,
                    countryId: orderSetResult.country_id,
                    turnId: nextTurnId
                };
            }));
            return orderSets;
        });
    }
    setTurnDefaultsPrepped(turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(set_turn_defaults_prepared_query_1.setTurnDefaultsPreparedQuery, [turnId]);
        });
    }
    getTurnUnitOrders(countryId, orderTurnId, historyTurnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield this.pool
                .query(get_turn_unit_orders_1.getTurnUnitOrdersQuery, [countryId, orderTurnId, historyTurnId])
                .then((result) => result.rows.map((orderResult) => {
                return {
                    orderId: orderResult.order_id,
                    orderSetId: orderResult.order_set_id,
                    orderedUnitId: orderResult.ordered_unit_id,
                    loc: orderResult.ordered_unit_loc,
                    orderType: orderResult.order_type,
                    secondaryUnitId: orderResult.secondary_unit_id,
                    secondaryUnitLoc: orderResult.secondary_unit_loc,
                    destinationId: orderResult.destination_id,
                    eventLoc: orderResult.event_loc,
                    orderStatus: orderResult.order_status
                };
            }));
            return orders;
        });
    }
    getBuildTransferOrders(countryId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferBuildOrderResults = yield this.pool
                .query(get_build_transfer_orders_query_1.getBuildTransferOrdersQuery, [turnId, countryId])
                .then((result) => result.rows);
            const transferBuildOrders = [];
            transferBuildOrderResults.forEach((result) => {
                const tuples = result.build_transfer_tuples;
                const recipients = result.build_transfer_recipients;
                for (let index = 0; index < tuples.length; index += 2) {
                    const recipient = recipients.find((country) => country.country_id === tuples[index]);
                    if (recipient) {
                        transferBuildOrders.push({
                            playerCountryId: result.player_country_id,
                            playerCountryName: result.player_country_name,
                            countryId: recipient.country_id,
                            countryName: recipient.country_name,
                            builds: tuples[index + 1]
                        });
                    }
                }
            });
            return transferBuildOrders;
        });
    }
    getTechTransferPartner(nextTurnId, currentTurnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_tech_transfer_order_query_1.getTechTransferOrderQuery, [nextTurnId, currentTurnId, countryId])
                .then((result) => result.rows.map((order) => {
                return {
                    countryId: order.country_id,
                    countryName: order.country_name,
                    techPartnerId: order.tech_partner_id,
                    techPartnerName: order.tech_partner_name,
                    hasNukes: order.has_nukes,
                    success: false
                };
            }));
        });
    }
    getBuildOrders(currentTurnId, nextTurnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildOrdersResults = yield this.pool
                .query(get_build_orders_query_1.getBuildOrdersQuery, [nextTurnId, currentTurnId, countryId])
                .then((result) => result.rows);
            const buildOrders = [];
            buildOrdersResults.forEach((result) => {
                var _a;
                const builds = [];
                if (((_a = result.build_tuples) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    const buildTuples = result.build_tuples;
                    const buildLocs = result.build_locs;
                    for (let index = 0; index < buildTuples.length; index += 2) {
                        const buildLoc = buildLocs.find((loc) => loc.node_id === buildTuples[index]);
                        const buildTypeId = buildTuples[index + 1];
                        const buildType = this.resolveBuildType(buildTypeId);
                        if (buildLoc) {
                            builds.push({
                                typeId: buildTypeId,
                                buildType: buildType,
                                nodeId: buildLoc.node_id,
                                nodeName: buildLoc.node_name,
                                provinceName: buildLoc.province_name,
                                loc: buildLoc.loc
                            });
                        }
                    }
                }
                buildOrders.push({
                    countryId: result.country_id,
                    countryName: result.country_name,
                    bankedBuilds: result.banked_builds,
                    buildCount: result.builds,
                    nukeRange: result.nuke_range,
                    increaseRange: result.increase_range,
                    builds: builds
                });
            });
            const nukesReady = yield this.pool
                .query(get_finished_nuke_orders_query_1.getFinishedNukesOrdersQuery, [nextTurnId, countryId])
                .then((result) => result.rows.map((node) => {
                return {
                    typeId: 5,
                    buildType: unit_enum_1.BuildType.NUKE_FINISH,
                    nodeId: node.node_id,
                    nodeName: node.node_name,
                    loc: node.loc,
                    provinceName: node.province_name
                };
            }));
            buildOrders[0].nukesReady = nukesReady;
            return buildOrders;
        });
    }
    resolveBuildType(buildTypeId) {
        switch (buildTypeId) {
            case -3:
                return unit_enum_1.BuildType.NUKE_START;
            case -2:
                return unit_enum_1.BuildType.RANGE;
            case -1:
                return unit_enum_1.BuildType.DISBAND;
            case 0:
                return unit_enum_1.BuildType.BUILD;
            case 1:
                return unit_enum_1.BuildType.ARMY;
            case 2:
                return unit_enum_1.BuildType.FLEET;
            case 3:
                return unit_enum_1.BuildType.WING;
            case 4:
                return unit_enum_1.BuildType.NUKE_RUSH;
            case 5:
                return unit_enum_1.BuildType.NUKE_FINISH;
            default:
                return unit_enum_1.BuildType.BUILD;
        }
    }
    getDisbandOrders(currentTurnId, nextTurnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const disbandOrders = yield this.pool
                .query(get_disband_orders_query_1.getDisbandOrdersQuery, [currentTurnId, nextTurnId, countryId])
                .then((result) => result.rows.map((orderSet) => {
                return {
                    countryId: orderSet.country_id,
                    countryName: orderSet.country_name,
                    bankedBuilds: orderSet.banked_builds,
                    disbands: orderSet.disbands,
                    unitsDisbanding: orderSet.units_disbanding,
                    nukeLocs: orderSet.nuke_locs,
                    unitDisbandingDetailed: orderSet.unit_disbanding_detailed.map((unit, index) => {
                        return {
                            unitId: unit.unit_id,
                            unitType: unit.unit_type,
                            provinceName: unit.province_name,
                            loc: unit.loc
                        };
                    }),
                    nukeRange: orderSet.nuke_range,
                    increaseRange: orderSet.increase_range
                };
            }));
            return disbandOrders[0];
        });
    }
    getCountryOrderSets(gameId, turnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_country_order_sets_query_1.getCountryOrderSets, [gameId, turnId, countryId]).then((result) => result.rows.map((orderSet) => {
                return {
                    orderSetId: orderSet.order_set_id,
                    turnStatus: orderSet.turn_status,
                    turnType: orderSet.turn_type,
                    adjustments: orderSet.adjustments,
                    inRetreat: orderSet.in_retreat
                };
            }));
        });
    }
    saveUnitOrder(orderSetId, unit) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(save_unit_order_query_1.saveUnitOrderQuery, [
                unit.orderType,
                unit.secondaryUnitId,
                unit.destinationId,
                'Submitted',
                orderSetId,
                unit.orderedUnitId
            ]);
        });
    }
    saveTransfers(orderSetId, techTransfer, buildTransfers) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildRecipients = [];
            const tupleizedBuildRecipients = [];
            buildTransfers.forEach((transfer) => {
                buildRecipients.push(transfer.countryId);
                tupleizedBuildRecipients.push(transfer.countryId, transfer.builds);
            });
            yield this.pool
                .query(save_transfer_orders_query_1.saveTransferOrdersQuery, [
                techTransfer.techPartnerId,
                buildRecipients,
                tupleizedBuildRecipients,
                orderSetId
            ])
                .catch((error) => console.log('saveTransfers error: ' + error.message));
        });
    }
    saveBuildOrders(orderSetId, builds) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildLocs = [];
            const buildLocsTupleized = [];
            builds.builds.forEach((build) => {
                buildLocs.push(build.nodeId);
                buildLocsTupleized.push(build.nodeId, build.typeId);
            });
            let nukeLocs = [];
            if (builds.nukesReady) {
                nukeLocs = builds.nukesReady.map((nukeLoc) => nukeLoc.nodeId);
            }
            yield this.pool.query(save_build_orders_query_1.saveBuildOrdersQuery, [
                buildLocs,
                buildLocsTupleized,
                nukeLocs,
                builds.increaseRange,
                orderSetId
            ]);
        });
    }
    saveDisbandOrders(orderSetId, disbands) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(save_disband_orders_query_1.saveDisbandOrdersQuery, [
                disbands.unitsDisbanding,
                disbands.increaseRange,
                disbands.nukeLocs,
                orderSetId
            ]);
        });
    }
    getNukesReadyLocs(nextTurnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_finished_nuke_orders_query_1.getFinishedNukesOrdersQuery, [nextTurnId, countryId]).then((result) => result.rows.map((loc, index) => {
                return {
                    unitId: index * -1,
                    nodeId: loc.node_id,
                    province: loc.province_name,
                    display: loc.province_name,
                    loc: loc.loc
                };
            }));
        });
    }
    getNominationOrder(turnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_nomination_order_query_1.getNominationOrderQuery, [turnId, countryId]).then((result) => result.rows.map((country) => {
                return {
                    countryId: country.country_id,
                    countryName: country.country_name,
                    rank: country.rank
                };
            }));
        });
    }
    saveNominationOrder(orderSetId, nomination) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(save_nomination_query_1.saveNominationQuery, [nomination, orderSetId]);
        });
    }
    getVotes(turnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_votes_orders_query_1.getVotesOrdersQuery, [turnId, countryId])
                .then((result) => (result.rows[0].votes ? result.rows[0].votes : []));
        });
    }
    saveVotes(orderSetId, votes) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.query(save_votes_query_1.saveVotesQuery, [votes, orderSetId]);
        });
    }
}
exports.OrdersRepository = OrdersRepository;
//# sourceMappingURL=orders-repo.js.map