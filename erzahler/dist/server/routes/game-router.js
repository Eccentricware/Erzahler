"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRouter = void 0;
const express_1 = __importDefault(require("express"));
const game_service_1 = require("../services/game-service");
exports.gameRouter = express_1.default.Router();
const gameService = new game_service_1.GameService();
exports.gameRouter.get('/check-name/:gameName', (request, response) => {
    const { gameName } = request.params;
    gameService
        .checkGameNameAvailability(gameName)
        .then((gameNameAvailable) => {
        response.send(gameNameAvailable);
    })
        .catch((error) => response.send('Game availability check error: ' + error.message));
});
exports.gameRouter.get('/search', (request, response) => {
    const idToken = request.headers.idtoken;
    gameService
        .findGames(idToken)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send('Game find error: ' + error.message);
    });
});
exports.gameRouter.get('/details/:gameId', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = Number(request.params.gameId);
    gameService
        .getGameData(idToken, gameId)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        console;
        response.send('Get game data error: ' + error.message);
    });
});
exports.gameRouter.post('/create', (request, response) => {
    gameService
        .newGame(request.body.gameData, request.body.idToken)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.gameRouter.put('/update', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameData = request.body.gameData;
    gameService
        .updateGameSettings(idToken, gameData)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.gameRouter.post('/declare-ready', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = request.body.gameId;
    gameService
        .declareReady(idToken, gameId)
        .then(() => {
        return {
            success: true
        };
    })
        .then(() => {
        return {
            success: false
        };
    });
});
exports.gameRouter.get('/stats/:gameId', (request, response) => {
    const gameId = Number(request.params.gameId);
    gameService
        .getGameStats(gameId)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: 'GetGameStatsError: ' + error.message });
    });
});
//# sourceMappingURL=game-router.js.map