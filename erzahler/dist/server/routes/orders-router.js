"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ordersRouter = void 0;
const express_1 = __importDefault(require("express"));
const orders_service_1 = require("../services/orders-service");
exports.ordersRouter = express_1.default.Router();
const ordersService = new orders_service_1.OrdersService();
exports.ordersRouter.get(`/:gameId/orders`, (request, response) => {
    const idToken = request.headers.idtoken;
    const gameId = Number(request.params.gameId);
    ordersService.getTurnOrders(idToken, gameId).then((orders) => {
        response.send(orders);
    });
});
exports.ordersRouter.post(`/submit`, (request, response) => {
    const idToken = request.headers.idtoken;
    const orders = request.body.orders;
    ordersService
        .saveOrders(idToken, orders)
        .then(() => response.send({ success: true }))
        .catch((error) => response.send({
        success: false,
        error: error.message
    }));
});
//# sourceMappingURL=orders-router.js.map