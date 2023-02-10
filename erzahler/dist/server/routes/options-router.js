"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionsRouter = void 0;
const express_1 = __importDefault(require("express"));
const options_service_1 = require("../services/options-service");
exports.optionsRouter = express_1.default.Router();
const optionsService = new options_service_1.OptionsService();
exports.optionsRouter.get(`/:gameId`, (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = Number(request.params.gameId);
    optionsService.getTurnOptions(idToken, gameId).then((options) => {
        response.send(options);
    });
});
//# sourceMappingURL=options-router.js.map