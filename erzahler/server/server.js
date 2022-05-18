"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accounts_1 = require("./services/accounts");
const erzhaler = (0, express_1.default)();
const bodyParser = require('body-parser');
const port = 8000;
erzhaler.use(bodyParser.json());
erzhaler.get('/', (request, response) => {
    const testFeedBack = `Who is up for an interactive story?`;
    response.send(testFeedBack);
});
erzhaler.post('/signup', (request, response) => {
    let { email, password, username } = request.body;
    const accounts = (0, accounts_1.createAccountWithUsernameAndEmail)(username, email, password);
    accounts.then((results) => {
        response.send(results);
    });
});
erzhaler.listen(port, () => {
    console.log(`Erzhaler is running on port ${port}`);
});
