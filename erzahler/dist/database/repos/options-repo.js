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
exports.OptionsRepository = void 0;
const pg_1 = require("pg");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const get_air_adj_query_1 = require("../queries/orders/get-air-adj-query");
const get_at_risk_units_query_1 = require("../queries/orders/get-at-risk-units-query");
const get_empty_supply_centers_query_1 = require("../queries/orders/get-empty-supply-centers-query");
const get_nominatable_countries_query_1 = require("../queries/orders/get-nominatable-countries-query");
const get_order_options_query_1 = require("../queries/orders/get-order-options-query");
const get_transfer_build_options_query_1 = require("../queries/orders/get-transfer-build-options-query");
const get_transfer_options_query_1 = require("../queries/orders/get-transfer-options-query");
const get_transfer_tech_offer_options_query_1 = require("../queries/orders/get-transfer-tech-offer-options-query");
const get_transfer_tech_receive_options_query_1 = require("../queries/orders/get-transfer-tech-receive-options-query");
const get_unit_adjacent_info_query_1 = require("../queries/orders/get-unit-adjacent-info-query");
const get_active_centers_query_1 = require("../queries/orders/options-final/get-active-centers-query");
const get_nominations_query_1 = require("../queries/orders/options-final/get-nominations-query");
class OptionsRepository {
    /**
     * @param db
     * @param pgp
     */
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
        this.orderOptionsCols = new pgp.helpers.ColumnSet(['unit_id', 'order_type', 'secondary_unit_id', 'secondary_order_type', 'destinations', 'turn_id'], { table: 'order_options' });
    }
    //// Legacy Functions ////
    getUnitAdjacencyInfo(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitAdjacencyInfoResult = yield this.pool
                .query(get_unit_adjacent_info_query_1.getUnitAdjacentInfoQuery, [gameId, turnId])
                .then((results) => {
                return results.rows.map((result) => {
                    return {
                        unitId: result.unit_id,
                        unitName: result.unit_name,
                        unitType: result.unit_type,
                        nodeId: result.node_id,
                        nodeName: result.node_name,
                        provinceId: result.province_id,
                        provinceName: result.province_name,
                        adjacencies: result.adjacencies.map((adjacency) => {
                            return {
                                nodeId: adjacency.node_id,
                                provinceId: adjacency.province_id,
                                provinceName: adjacency.province_name
                            };
                        }),
                        moveTransported: [],
                        holdSupports: result.hold_supports &&
                            result.hold_supports.map((unit) => {
                                return { unitId: unit.unit_id, unitName: unit.unit_name };
                            }),
                        moveSupports: {},
                        transportSupports: {},
                        nukeTargets: [],
                        adjacentTransports: result.adjacent_transports &&
                            result.adjacent_transports.map((unit) => {
                                return { unitId: unit.unit_id, unitName: unit.unit_name };
                            }),
                        allTransports: {},
                        nukeRange: result.nuke_range,
                        adjacentTransportables: result.adjacent_transportables &&
                            result.adjacent_transportables.map((unit) => {
                                return { unitId: unit.unit_id, unitName: unit.unit_name };
                            }),
                        transportDestinations: result.transport_destinations &&
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
                console.log('unitAdjacencyInfoResultError: ' + error.message);
                const dud = [];
                return dud;
            });
            return unitAdjacencyInfoResult;
        });
    }
    getAirAdjacencies(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const airAdjArray = yield this.pool
                .query(get_air_adj_query_1.getAirAdjQuery, [gameId])
                .then((results) => {
                return results.rows.map((result) => {
                    return {
                        nodeId: result.node_id,
                        adjacencies: result.adjacencies.map((adjacency) => {
                            return {
                                nodeId: adjacency.node_id,
                                provinceId: adjacency.province_id,
                                provinceName: adjacency.province_name
                            };
                        }),
                        provinceName: result.province_name
                    };
                });
            });
            return airAdjArray;
        });
    }
    /**
     * Fetches options for a turn
     * @param turnId    - Turn's ID
     * @returns Promise<SavedOption[]>
     */
    getUnitOptions(currentTurnId, nextTurnId, countryId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const savedOptions = yield this.pool
                .query(get_order_options_query_1.getOrderOptionsQuery, [currentTurnId, nextTurnId, countryId])
                .then((result) => {
                return result.rows.map((result) => {
                    return {
                        unitId: result.unit_id,
                        unitType: result.unit_type,
                        unitCountryId: result.unit_country_id,
                        unitCountryName: result.unit_country_name,
                        unitCountryRank: result.unit_country_rank,
                        unitFlagKey: result.unit_flag_key,
                        provinceName: result.province_name,
                        nodeId: result.node_id,
                        unitLoc: result.unit_loc,
                        canHold: result.can_hold,
                        orderType: result.order_type,
                        secondaryUnitId: result.secondary_unit_id,
                        secondaryUnitType: result.secondary_unit_type,
                        secondaryUnitCountryName: result.secondary_unit_country_name,
                        secondaryUnitFlagKey: result.secondary_unit_flag_key,
                        secondaryProvinceName: result.secondary_province_name,
                        secondaryUnitLoc: result.secondary_unit_loc,
                        secondaryOrderType: result.secondary_order_type,
                        destinations: result.destinations[0] !== null
                            ? result.destinations.map((destination) => {
                                return {
                                    nodeId: destination.node_id,
                                    nodeName: this.formatDestinationNodeName(destination.node_name),
                                    loc: destination.loc
                                };
                            })
                            : undefined
                    };
                });
            });
            return savedOptions;
        });
    }
    getBuildTransferOptions(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferOptions = yield this.pool
                .query(get_transfer_build_options_query_1.getTransferBuildOptionsQuery, [gameId, turnId])
                .then((result) => result.rows.map((countryResult) => {
                return {
                    countryId: countryResult.country_id,
                    countryName: countryResult.country_name
                };
            }));
            return transferOptions;
        });
    }
    getTechOfferOptions(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferOptions = yield this.pool
                .query(get_transfer_tech_offer_options_query_1.getTechOfferOptionsQuery, [gameId, turnId])
                .then((result) => result.rows.map((countryResult) => {
                return {
                    countryId: countryResult.country_id,
                    countryName: countryResult.country_name
                };
            }));
            return transferOptions;
        });
    }
    getTechReceiveOptions(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferOptions = yield this.pool
                .query(get_transfer_tech_receive_options_query_1.getTechReceiveOptionsQuery, [gameId, turnId])
                .then((result) => result.rows.map((countryResult) => {
                return {
                    countryId: countryResult.country_id,
                    countryName: countryResult.country_name
                };
            }));
            return transferOptions;
        });
    }
    getTransferOptions(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferOptions = yield this.pool
                .query(get_transfer_options_query_1.getTransferOptionsQuery, [gameId, turnId])
                .then((result) => {
                return result.rows.map((game) => {
                    return {
                        gameId: game.game_id,
                        giveTech: game.give_tech.map((country) => {
                            return {
                                countryId: country.country_id,
                                countryName: country.country_name
                            };
                        }),
                        receiveTech: game.receive_tech.map((country) => {
                            return {
                                countryId: country.country_id,
                                countryName: country.country_name
                            };
                        }),
                        receiveBuilds: game.receive_builds.map((country) => {
                            return {
                                countryId: country.country_id,
                                countryName: country.country_name
                            };
                        })
                    };
                });
            })
                .catch((error) => {
                console.log('getTransferOptions Error: ' + error.message);
                return [];
            });
            return transferOptions;
        });
    }
    getAvailableBuildLocs(gameId, turnId, countryId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildLocs = yield this.pool
                .query(get_empty_supply_centers_query_1.getEmptySupplyCentersQuery, [gameId, turnId, countryId])
                .then((result) => result.rows.map((province) => {
                return {
                    countryId: province.country_id,
                    countryName: province.country_name,
                    provinceName: province.province_name,
                    cityLoc: province.city_loc,
                    landNodeId: province.land_node_id,
                    landNodeLoc: province.land_node_loc,
                    seaNodeId: province.sea_node_id,
                    seaNodeLoc: province.sea_node_loc,
                    seaNodeName: province.sea_node_name,
                    airNodeId: province.air_node_id,
                    airNodeLoc: province.air_node_loc
                };
            }))
                .catch((error) => {
                console.log('getAvailableBuildLocs Error: ' + error.message);
                return [];
            });
            return buildLocs;
        });
    }
    getAtRiskUnits(turnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            const atRiskUnits = yield this.pool
                .query(get_at_risk_units_query_1.getAtRiskUnitsQuery, [turnId, countryId])
                .then((result) => result.rows.map((unit) => {
                return {
                    unitId: unit.unit_id,
                    unitType: unit.unit_type,
                    loc: unit.loc,
                    provinceName: unit.province_name
                };
            }))
                .catch((error) => {
                console.log('getAtRiskUnits Error: ' + error.message);
                return [];
            });
            return atRiskUnits;
        });
    }
    getNominatableCountries(turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const nominatableCountries = yield this.pool
                .query(get_nominatable_countries_query_1.getNominatableCountriesQuery, [turnId])
                .then((result) => result.rows.map((country) => {
                return {
                    countryId: country.country_id,
                    countryName: country.country_name,
                    rank: country.rank
                };
            }))
                .catch((error) => {
                console.log('getNominatableCountries Error: ' + error.message);
                return [];
            });
            return nominatableCountries;
        });
    }
    getNominations(turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            const nominations = yield this.pool
                .query(get_nominations_query_1.getNominationsQuery, [turnId])
                .then((result) => result.rows.map((nomination) => {
                return {
                    nominationId: nomination.nomination_id,
                    signature: nomination.signature,
                    countries: nomination.countries.map((country) => {
                        return {
                            countryId: country.country_id,
                            countryName: country.country_name,
                            rank: country.rank
                        };
                    }),
                    votesRequired: nomination.votes_required
                };
            }))
                .catch((error) => {
                console.log('getNominations Error: ' + error.message);
                return [];
            });
            return nominations;
        });
    }
    formatDestinationNodeName(nodeName) {
        const nameSplit = nodeName.toUpperCase().split('_');
        return nameSplit.length === 3 ? nameSplit[0] + nameSplit[2] : nameSplit[0];
    }
    getActiveCountryCenters(turnId, countryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_active_centers_query_1.getActiveCountryCenters, [turnId, countryId]).then((result) => result.rows.map((loc) => {
                return {
                    nodeId: loc.node_id,
                    loc: loc.loc,
                    province: loc.province_name,
                    display: loc.province_name
                };
            }));
        });
    }
}
exports.OptionsRepository = OptionsRepository;
//# sourceMappingURL=options-repo.js.map