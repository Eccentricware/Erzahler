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
exports.MapService = void 0;
const connection_1 = require("../../database/connection");
const render_category_enum_1 = require("../../models/enumeration/render-category-enum");
class MapService {
    getCurrentMap(gameId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameState = yield connection_1.db.gameRepo.getGameState(gameId);
            const terrain = yield connection_1.db.mapRepo.getTerrain(gameId, gameState.turnId);
            const seaTerrain = terrain.filter((terrain) => terrain.renderCategory === render_category_enum_1.RenderCategory.SEA);
            const landTerrain = terrain.filter((terrain) => terrain.renderCategory === render_category_enum_1.RenderCategory.LAND);
            const canalTerrain = terrain.filter((terrain) => terrain.renderCategory === render_category_enum_1.RenderCategory.CANAL);
            const lineTerrain = terrain.filter((terrain) => terrain.renderCategory === render_category_enum_1.RenderCategory.LINE);
            const cities = yield connection_1.db.mapRepo.getCities(gameId, gameState.turnId);
            const supplyCenters = cities.filter((city) => city.voteColor === null);
            const votingCenters = cities.filter((city) => city.voteColor !== null);
            const labels = yield connection_1.db.mapRepo.getLabels(gameId);
            const labelLines = yield connection_1.db.mapRepo.getLabelLines(gameId);
            const units = yield connection_1.db.mapRepo.getUnits(gameId, gameState.turnId);
            return {
                terrain: {
                    sea: seaTerrain,
                    land: landTerrain,
                    canal: canalTerrain,
                    line: lineTerrain
                },
                cities: {
                    supplyCenters: supplyCenters,
                    votingCenters: votingCenters
                },
                labels: labels,
                labelLines: labelLines,
                units: units
            };
        });
    }
}
exports.MapService = MapService;
//# sourceMappingURL=map-service.js.map