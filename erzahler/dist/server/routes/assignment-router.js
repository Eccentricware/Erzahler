"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentRouter = void 0;
const express_1 = __importDefault(require("express"));
const assignmentService_1 = require("../services/assignmentService");
exports.assignmentRouter = express_1.default.Router();
const assignmentService = new assignmentService_1.AssignmentService();
exports.assignmentRouter.get(`/:gameId`, (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = Number(request.params.gameId);
    assignmentService
        .getGameAssignments(idToken, gameId)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.assignmentRouter.post('/register', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = Number(request.body.gameId);
    const assignmentType = request.body.assignmentType;
    assignmentService
        .registerUser(idToken, gameId, assignmentType)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.assignmentRouter.post('/unregister', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = Number(request.body.gameId);
    const assignmentType = request.body.assignmentType;
    console.log(request.headers.idtoken);
    console.log(Number(request.body.gameId));
    console.log(request.body.assignmentType);
    assignmentService
        .unregisterUser(idToken, gameId, assignmentType)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.assignmentRouter.post('/assign-player', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = request.body.gameId;
    const playerId = request.body.userId;
    const countryId = request.body.countryId;
    assignmentService
        .assignPlayer(idToken, gameId, playerId, countryId)
        .then((result) => {
        response.send({ success: true });
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.assignmentRouter.put('/lock-assignment', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = request.body.gameId;
    const playerId = request.body.userId;
    assignmentService
        .lockAssignment(idToken, gameId, playerId)
        .then((result) => {
        response.send({ success: true });
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
exports.assignmentRouter.put('/unlock-assignment', (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = request.body.gameId;
    const playerId = request.body.userId;
    assignmentService
        .unlockAssignment(idToken, gameId, playerId)
        .then((result) => {
        response.send({ success: true });
    })
        .catch((error) => {
        response.send({ error: error.message });
    });
});
//# sourceMappingURL=assignment-router.js.map