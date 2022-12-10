import express from "express";
import { SavedOption } from "../../models/objects/option-context-objects";
import { TurnOptions } from "../../models/objects/scheduler/upcoming-turns-object";
import { OptionsService } from "../services/optionsService";

export const ordersRouter = express.Router();
const optionsService = new OptionsService();

ordersRouter.get(`/:gameId`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  optionsService.getOrderOptions(idToken, gameId)
    .then((options: TurnOptions) => {
      response.send(options);
    })
    .catch((error: Error) => {
      response.send('Get Orders Options Error: ' + error.message);
    });
});