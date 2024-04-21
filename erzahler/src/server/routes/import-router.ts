import express from 'express';
import { ImportService } from '../services/import-service';
import { ValidationService } from '../services/validation-service';

export const importRouter = express.Router();
const importService = new ImportService();
const validationService = new ValidationService();

importRouter.post('/game', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `import/game`,
    gameId: request.body.gameId,
    environment: request.body.environment,
    magicWord: request.body.magicWord
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { gameId, environment, magicWord, gameName } = validationResponse.sanitizedVariables;

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  if (!environment) {
    response.send({ error: 'Environment is required.' });
    return;
  }

  if (!magicWord) {
    response.send({ error: 'You are missing something you are not supposed to have.' });
    return;
  }



  importService
    .importGame(gameId, environment, magicWord, gameName)
    .then(() => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: 'ImportGameError: ' + error.message });
    });
});
