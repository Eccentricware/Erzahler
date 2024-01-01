import express from 'express';
import { TurnOrders } from '../../models/objects/order-objects';
import { OrdersService } from '../services/orders-service';

export const ordersRouter = express.Router();
const ordersService = new OrdersService();

ordersRouter.get(`/:gameId/orders`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  ordersService.getTurnOrders(idToken, gameId)
    .then((orders: TurnOrders | undefined) => {
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
