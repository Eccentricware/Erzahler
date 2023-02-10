"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app_1 = require("firebase-admin/app");
// import { serviceAccount } from '/home/ubox/personal/blitzkarte/Erzahler/erzahler/src/secrets/firebase-service-account';
const game_router_1 = require("./routes/game-router");
const user_router_1 = require("./routes/user-router");
const assignment_router_1 = require("./routes/assignment-router");
const scheduler_service_1 = require("./services/scheduler-service");
const orders_router_1 = require("./routes/orders-router");
const maps_router_1 = require("./routes/maps-router");
const options_router_1 = require("./routes/options-router");
const erzhaler = (0, express_1.default)();
const port = 8000;
const schedulerService = new scheduler_service_1.SchedulerService();
// const ordersService: OrdersService = new OrdersService();
// ordersService.saveOptionsForNextTurn(33);
erzhaler.use((0, cors_1.default)());
erzhaler.use(body_parser_1.default.json({ limit: '5mb' }));
(0, app_1.initializeApp)({
    credential: (0, app_1.applicationDefault)()
});
erzhaler.use('/assignments', assignment_router_1.assignmentRouter);
erzhaler.use('/games', game_router_1.gameRouter);
erzhaler.use('/maps', maps_router_1.mapRouter);
erzhaler.use('/options', options_router_1.optionsRouter);
erzhaler.use('/orders', orders_router_1.ordersRouter);
erzhaler.use('/user', user_router_1.userRouter);
erzhaler.get('/check-status', (request, response) => {
    response.send(true);
});
schedulerService.syncDeadlines();
erzhaler.listen(port, () => {
    console.log(`Erzhaler is running on port ${port}`);
});
//# sourceMappingURL=controller.js.map