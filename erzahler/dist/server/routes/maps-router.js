"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRouter = void 0;
const express_1 = __importDefault(require("express"));
const map_service_1 = require("../services/map-service");
exports.mapRouter = express_1.default.Router();
const mapService = new map_service_1.MapService();
exports.mapRouter.get('/:gameId/current', (request, response) => {
    const gameId = Number(request.params.gameId);
    mapService
        .getCurrentMap(gameId)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
//# sourceMappingURL=maps-router.js.map