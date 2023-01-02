import express from "express";
import { SavedOption } from "../../models/objects/option-context-objects";
import { TurnOrders } from "../../models/objects/scheduler/upcoming-turns-object";
import { OrdersService } from "../services/orders-service";

export const ordersRouter = express.Router();
const ordersService = new OrdersService();

ordersRouter.get(`/:gameId`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  ordersService.getOrders(idToken, gameId)
    .then((options: TurnOrders) => {
      response.send(options);
    });
});