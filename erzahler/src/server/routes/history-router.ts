import express from "express";
import { HistoryService } from "../services/history-service";

export const historyRouter = express.Router();
const historyService = new HistoryService();

historyRouter.get('/stats/:gameId', (request, response) => {
  const gameId = Number(request.params.gameId);

  historyService
    .getGameStats(gameId)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: 'GetGameStatsError: ' + error.message });
    });
});

historyRouter.get('/results/:gameId/:turnNumber', (request, response) => {
  const gameId = Number(request.params.gameId);
  const turnNumber = Number(request.params.turnNumber);

  historyService.getTurnHistory(gameId, turnNumber).then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: 'GetTurnHistoryError: ' + error.message });
    });
});