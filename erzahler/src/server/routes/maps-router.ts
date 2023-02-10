import express from 'express';
import { MapService } from '../services/map-service';

export const mapRouter = express.Router();
const mapService = new MapService();

mapRouter.get('/:gameId/current', (request, response) => {
  const gameId = Number(request.params.gameId);

  mapService
    .getCurrentMap(gameId)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});
