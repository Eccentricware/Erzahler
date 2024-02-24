import express from 'express';
import { TurnOrders } from '../../models/objects/order-objects';
import { OrdersService } from '../services/orders-service';
import { ValidationService } from '../services/validation-service';

export const ordersRouter = express.Router();
const ordersService = new OrdersService();
const validationService = new ValidationService();

ordersRouter.get(`/:gameId/orders`, (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `orders/:gameId/orders`,
    gameId: request.params.gameId,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    }
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { gameId, idToken } = validationResponse.sanitizedVariables;

  ordersService.getTurnOrders(idToken!, gameId!)
    .then((orders: TurnOrders | undefined) => {
      response.send(orders);
    });
});

ordersRouter.post(`/submit`, (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `orders/submit`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken } = validationResponse.sanitizedVariables;
  const orders = request.body.orders;

  if (!orders) {
    response.send({ success: false, error: 'No orders were included.' });
    return;
  }

  ordersService
    .saveOrders(idToken!, orders)
    .then((result) => response.send(result))
    .catch((error: Error) =>
      response.send({
        success: false,
        error: error.message
      })
    );
});
