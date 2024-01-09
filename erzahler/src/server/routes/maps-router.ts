import express from 'express';
import { MapService } from '../services/map-service';
import { terminalLog } from '../utils/general';
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

  mapService
    .getMap(gameId!)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});
