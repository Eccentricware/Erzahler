import express from 'express';
import { MapService } from '../services/map-service';
import { ValidationService } from '../services/validation-service';

export const mapRouter = express.Router();
const mapService = new MapService();
const validationService = new ValidationService();

mapRouter.get('/:gameId/current', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `maps/:gameId/current`,
    gameId: request.params.gameId
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const gameId = validationResponse.sanitizedVariables.gameId;

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  mapService
    .getMap(gameId)
    .then((result) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});
