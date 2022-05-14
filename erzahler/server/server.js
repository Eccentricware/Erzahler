"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const erzhaler = (0, express_1.default)();
const port = 8000;
erzhaler.get('/', (req, res) => {
    const testFeedBack = `Who is up for an interactive story?`;
    res.send(testFeedBack);
});
erzhaler.listen(port, () => {
    console.log(`Erzhaler is running on port ${port}`);
});
