import express from 'express';
import { OptionsFinal } from '../../models/objects/options-objects';
import { OptionsService } from '../services/options-service';
import { ValidationService } from '../services/validation-service';

export const optionsRouter = express.Router();
const optionsService = new OptionsService();
const validationService = new ValidationService();

optionsRouter.get(`/:gameId`, (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `options/:gameId`,
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

  if (!idToken) {
    response.send({ error: 'ID Token is required.' });
    return;
  }

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  optionsService.getTurnOptions(idToken, gameId).then((options: OptionsFinal | string) => {
    response.send(options);
  });
});
