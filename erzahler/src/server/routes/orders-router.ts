import { error } from 'console';
import express from 'express';
import { db } from '../../database/connection';
import { SavedOption } from '../../models/objects/option-context-objects';
import { OptionsFinal } from '../../models/objects/options-objects';
import { TurnOrders } from '../../models/objects/order-objects';
import { AccountService } from '../services/account-service';
import { AssignmentService } from '../services/assignment-service';
import { OrdersService } from '../services/orders-service';

export const ordersRouter = express.Router();
const ordersService = new OrdersService();

ordersRouter.get(`/:gameId/orders`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  ordersService.getTurnOrders(idToken, gameId)
    .then((orders: TurnOrders) => {
      response.send(orders);
    });
});

ordersRouter.post(`/submit`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const orders = request.body.orders;

  ordersService
    .saveOrders(idToken, orders)
    .then(() => response.send({ success: true }))
    .catch((error: Error) =>
      response.send({
        success: false,
        error: error.message
      })
    );
});
