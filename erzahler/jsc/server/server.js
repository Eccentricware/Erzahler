"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accountService_1 = require("./services/accountService");
const body_parser_1 = __importDefault(require("body-parser"));
const app_1 = require("firebase/app");
const firebase_1 = require("../secrets/firebase");
const erzhaler = (0, express_1.default)();
const port = 8000;
const firebaseApp = (0, app_1.initializeApp)(firebase_1.firebaseConfig);
const auth = getAuth(firebaseApp);
erzhaler.use(body_parser_1.default.json());
const accountService = new accountService_1.AccountService();
erzhaler.get('/', (request, response) => {
    const testFeedBack = `Who is up for an interactive story?`;
    response.send(testFeedBack);
});
erzhaler.post('/signup', (request, response) => {
    let { email, password, username } = request.body;
    const existingAccounts = accountService.createAccountWithUsernameAndEmail(username, email, password);
    existingAccounts.then((results) => {
        response.send(results);
    });
});
erzhaler.get('/api/accounts/check-email/:email', (request, response) => {
    const { email } = request.params;
    const emailAvailabilityCheck = accountService.checkEmailAvailability(email);
    emailAvailabilityCheck.then((emailAvailable) => {
        response.send(emailAvailable);
    })
        .catch((e) => console.error(e.stack));
});
erzhaler.get('/api/accounts/check-username/:username', (request, response) => {
    const { username } = request.params;
    const usernameAvailabilityCheck = accountService.checkUsernameAvailability(username);
    usernameAvailabilityCheck.then((usernameAvailable) => {
        response.send(usernameAvailable);
    })
        .catch((e) => console.error(e.stack));
});
erzhaler.listen(port, () => {
    console.log(`Erzhaler is running on port ${port}`);
});
