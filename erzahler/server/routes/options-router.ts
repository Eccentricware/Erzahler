import express from "express";
import { OptionsFinal } from "../../models/objects/options-objects";
import { OptionsService } from "../services/options-service";

export const optionsRouter = express.Router();
const optionsService = new OptionsService();

optionsRouter.get(`/:gameId`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  optionsService.getTurnOptions(idToken, gameId)
    .then((options: OptionsFinal | string) => {
      response.send(options);
    });
});
