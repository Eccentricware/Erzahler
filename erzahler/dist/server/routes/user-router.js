"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const connection_1 = require("../../database/connection");
const accountService_1 = require("../services/accountService");
exports.userRouter = express_1.default.Router();
const accountService = new accountService_1.AccountService();
exports.userRouter.get('/check-username/:username', (request, response) => {
    const { username } = request.params;
    connection_1.db.accountsRepo
        .checkUsernameAvailable(username)
        .then((usernameAvailable) => {
        response.send(usernameAvailable);
    })
        .catch((error) => response.send(error.message));
});
exports.userRouter.get('/profile', (request, response) => {
    const idToken = request.headers.idtoken;
    accountService
        .getUserProfile(idToken)
        .then((userProfile) => {
        response.send(userProfile);
    })
        .catch((error) => {
        response.send(error.message);
    });
});
exports.userRouter.post('/register', (request, response) => {
    const { idToken, username } = request.body;
    accountService
        .attemptAddUserToDatabase(idToken, username)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send(error.message);
    });
});
exports.userRouter.post('/add-provider', (request, response) => {
    const { idToken, username } = request.body;
    accountService
        .addAdditionalProvider(idToken, username)
        .then((result) => {
        response.send(result);
    })
        .catch((error) => {
        response.send(error.message);
    });
});
exports.userRouter.put('/update-settings', (request, response) => {
    const idToken = request.headers.idtoken;
    const data = request.body;
    accountService
        .updateUserSettings(idToken, data)
        .then(() => {
        response.send({ success: true });
    })
        .catch((error) => {
        response.send({ error: 'Update User Profile Controller Error: ' + error.message });
    });
});
//# sourceMappingURL=user-router.js.map