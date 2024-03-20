import express from 'express';
import { HistoryService } from '../services/history-service';
import { ValidationService } from '../services/validation-service';

export const historyRouter = express.Router();
const historyService = new HistoryService();
const validationService = new ValidationService();

historyRouter.get('/stats/:gameId', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `history/stats/:gameId`,
    gameId: request.params.gameId
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const gameId = validationResponse.sanitizedVariables.gameId;

  historyService
    .getGameStats(gameId!)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: 'GetGameStatsError: ' + error.message });
    });
});

historyRouter.get('/results/:gameId/:turnNumber', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `history/results/:gameId/:turnNumber`,
    gameId: request.params.gameId,
    turnNumber: request.params.turnNumber
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { gameId, turnNumber } = validationResponse.sanitizedVariables;

  historyService
    .getTurnHistory(gameId!, turnNumber!)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: 'GetTurnHistoryError: ' + error.message });
    });
});
