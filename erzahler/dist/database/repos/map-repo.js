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
exports.MapRepository = void 0;
const pg_1 = require("pg");
const dbCredentials_1 = require("../../secrets/dbCredentials");
const get_cities_query_1 = require("../queries/maps/get-cities-query");
const get_label_lines_query_1 = require("../queries/maps/get-label-lines-query");
const get_labels_query_1 = require("../queries/maps/get-labels-query");
const get_terrain_query_1 = require("../queries/maps/get-terrain-query");
const get_units_query_1 = require("../queries/maps/get-units-query");
class MapRepository {
    constructor(db, pgp) {
        this.db = db;
        this.pgp = pgp;
        this.pool = new pg_1.Pool(dbCredentials_1.victorCredentials);
    }
    getTerrain(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_terrain_query_1.getTerrainQuery, [gameId, turnId]).then((queryResult) => queryResult.rows.map((result) => {
                return {
                    province: result.province_name,
                    renderCategory: result.render_category,
                    type: result.terrain_type,
                    fill: result.color,
                    points: result.points,
                    bounds: {
                        top: result.top_bound,
                        left: result.left_bound,
                        right: result.right_bound,
                        bottom: result.bottom_bound
                    }
                };
            }));
        });
    }
    getCities(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_cities_query_1.getCitiesQuery, [gameId, turnId]).then((queryResult) => queryResult.rows.map((result) => {
                return {
                    loc: result.city_loc,
                    type: result.vote_type,
                    voteColor: result.vote_color,
                    statusColor: result.status_color,
                    strokeColor: result.stroke_color,
                    name: result.province_name
                };
            }));
        });
    }
    getLabels(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_labels_query_1.getLabelsQuery, [gameId]).then((queryResult) => queryResult.rows.map((result) => {
                return {
                    name: result.label_name,
                    province: result.province_name,
                    text: result.label_text,
                    type: result.label_type,
                    loc: result.loc,
                    fill: result.fill
                };
            }));
        });
    }
    getLabelLines(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_label_lines_query_1.getLabelLinesQuery, [gameId]).then((queryResult) => queryResult.rows.map((result) => {
                return {
                    name: result.label_line_name,
                    x1: result.x1,
                    x2: result.x2,
                    y1: result.y1,
                    y2: result.y2,
                    stroke: result.stroke
                };
            }));
        });
    }
    getUnits(gameId, turnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.pool.query(get_units_query_1.getUnitsQuery, [gameId, turnId]).then((queryResult) => queryResult.rows.map((result) => {
                return {
                    name: result.unit_name,
                    type: result.unit_type,
                    loc: result.loc,
                    countryKey: result.flag_key,
                    status: result.unit_status
                };
            }));
        });
    }
}
exports.MapRepository = MapRepository;
//# sourceMappingURL=map-repo.js.map