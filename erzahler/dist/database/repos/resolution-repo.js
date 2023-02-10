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
exports.ResolutionRepository = void 0;
const pg_1 = require("pg");
const unit_enum_1 = require("../../models/enumeration/unit-enum");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const get_transfer_validation_data_query_1 = require("../queries/resolution/get-transfer-validation-data-query");
const get_transport_network_validation_query_1 = require("../queries/resolution/get-transport-network-validation-query");
const get_unit_orders_for_resolution_query_1 = require("../queries/resolution/get-unit-orders-for-resolution-query");
class ResolutionRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
    }
    /**
     *
     * @param currentTurnId
     * @param orderTurnId
     * @returns
     */
    getUnitOrdersForResolution(currentTurnId, orderTurnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool
                .query(get_unit_orders_for_resolution_query_1.getUnitOrdersForResolutionQuery, [currentTurnId, orderTurnId])
                .then((result) => result.rows.map((order) => {
                return {
                    orderId: order.order_id,
                    orderType: order.order_type,
                    orderSuccess: false,
                    power: 1,
                    supportCut: false,
                    description: '',
                    primaryResolution: '',
                    secondaryResolution: '',
                    valid: order.valid,
                    supportSuccess: false,
                    unit: {
                        id: order.ordered_unit_id,
                        type: order.unit_type,
                        status: order.unit_status,
                        countryId: order.country_id,
                        countryName: order.country,
                        canCapture: [unit_enum_1.UnitType.ARMY, unit_enum_1.UnitType.FLEET].includes(order.unit_type)
                    },
                    origin: {
                        nodeId: order.node_id,
                        provinceId: order.province_id,
                        provinceName: order.province,
                        provinceType: order.province_type,
                        voteType: order.vote_type,
                        provinceStatus: order.province_status,
                        controllerId: order.controller_id,
                        capitalOwnerId: order.capital_owner_id
                    },
                    secondaryUnit: {
                        id: order.secondary_unit_id,
                        type: order.secondary_unit_type,
                        countryId: order.secondary_country_id,
                        country: order.secondary_country,
                        canCapture: [unit_enum_1.UnitType.ARMY, unit_enum_1.UnitType.FLEET].includes(order.secondary_unit_type)
                    },
                    destination: {
                        nodeId: order.destination_id,
                        provinceId: order.destination_province_id,
                        provinceName: order.destination_province_name,
                        provinceType: order.destination_province_type,
                        voteType: order.destination_vote_type,
                        provinceStatus: order.destination_province_status,
                        controllerId: order.destination_controller_id,
                        capitalOwnerId: order.destination_capital_owner_id
                    }
                };
            }))
                .catch((error) => {
                console.log('Get Unit Orders For Resolution Error: ' + error.message);
                return [];
            });
        });
    }
    /**
     * Returns potential transports, and destinations.
     * @param turnId
     * @returns
     */
    getTransportNetworkInfo(turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitAdjacencyInfoResult = yield this.pool
                .query(get_transport_network_validation_query_1.getTransportNetworkValidation, [turnId])
                .then((results) => {
                return results.rows.map((result) => {
                    return {
                        unitId: result.unit_id,
                        transportables: result.adjacent_transportables &&
                            result.adjacent_transportables.map((unit) => {
                                return {
                                    unitId: unit.unit_id,
                                    unitName: unit.unit_name
                                };
                            }),
                        transports: result.adjacent_transports &&
                            result.adjacent_transports.map((unit) => {
                                return {
                                    unitId: unit.unit_id,
                                    unitName: unit.unit_name
                                };
                            }),
                        destinations: result.transport_destinations &&
                            result.transport_destinations.map((destination) => {
                                return {
                                    nodeId: destination.node_id,
                                    nodeName: destination.node_name,
                                    provinceId: destination.province_id
                                };
                            })
                    };
                });
            })
                .catch((error) => {
                console.log('getTransportNetworkInfo: ' + error.message);
                return [];
            });
            return unitAdjacencyInfoResult;
        });
    }
    getTransferResourceValidation(turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_transfer_validation_data_query_1.getTransferValidationDataQuery, [turnId]).then((result) => result.rows.map((country) => {
                return {
                    countryId: country.country_id,
                    countryName: country.country_name,
                    bankedBuilds: country.banked_builds,
                    buildsRemaining: country.banked_builds,
                    nukeRange: country.nuke_range
                };
            }));
        });
    }
}
exports.ResolutionRepository = ResolutionRepository;
//# sourceMappingURL=resolution-repo.js.map