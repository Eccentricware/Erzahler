import express from 'express';
import { MapService } from '../services/map-service';
import { terminalLog } from '../utils/general';

export const mapRouter = express.Router();
const mapService = new MapService();

mapRouter.get('/:gameId/current', (request, response) => {
  const gameId = Number(request.params.gameId);

  if (gameId > 0) {
    mapService
      .getMap(gameId)
      .then((result: any) => {
        response.send(result);
      })
      .catch((error: Error) => {
        response.send({ error: error.message });
      });
  } else {
    terminalLog(`Invalid game ID: ${gameId}`);
    response.send({ error: 'Invalid game ID' });
  }
});
