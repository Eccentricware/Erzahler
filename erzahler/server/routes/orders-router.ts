import express from "express";
import { SavedOption } from "../../models/objects/option-context-objects";
import { TurnOptions, TurnOrders } from "../../models/objects/scheduler/upcoming-turns-object";
import { OrdersService } from "../services/orders-service";

export const ordersRouter = express.Router();
const ordersService = new OrdersService();

ordersRouter.get(`/:gameId/options`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  ordersService.getTurnOptions(idToken, gameId)
    .then((options: TurnOptions) => {
      response.send(options);
    });
});

ordersRouter.get(`/:gameId/orders`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  ordersService.getTurnOrders(idToken, gameId)
    .then((orders: TurnOrders) => {
      response.send(orders);
    });
});