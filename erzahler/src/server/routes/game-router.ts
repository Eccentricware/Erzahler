import express from 'express';
import { GameService } from '../services/game-service';
import { GameFinderParameters } from '../../models/objects/games/game-finder-query-objects';
import { ValidationService } from '../services/validation-service';
import { terminalLog } from '../utils/general';

export const gameRouter = express.Router();
const gameService = new GameService();
const validationService = new ValidationService();

gameRouter.get('/check-name/:gameName', (request, response) => {
  const { gameName } = request.params;

  if (gameName === '') {
    terminalLog(`Invalid request to games/check-name/:gameName: Game name cannot be empty.`)
    response.send({
      success: false,
      message: 'Game name cannot be empty.'
    });

    return;
  }

  gameService
    .checkGameNameAvailability(gameName)
    .then((gameNameAvailable: boolean) => {
      response.send(gameNameAvailable);
    })
    .catch((error: Error) => response.send('Game availability check error: ' + error.message));
});

gameRouter.get('/search', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `games/search`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: true
    }
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const idToken = validationResponse.sanitizedVariables.idToken;
  const { playing, creator, administrator } = request.query;

  const parameters: GameFinderParameters = {
    playing: playing === 'true',
    creator: creator === 'true',
    administrator: administrator === 'true'
  };

  gameService
    .findGames(idToken!, parameters)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send('Game find error: ' + error.message);
    });
});

gameRouter.get('/details/:gameId', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `games/details/:gameId`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: true
    },
    gameId: request.params.gameId
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken, gameId } = validationResponse.sanitizedVariables;

  gameService
    .getGameData(idToken!, gameId!)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      console;
      response.send('Get game data error: ' + error.message);
    });
});

gameRouter.post('/create', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `games/create`,
    idToken: {
      value: request.body.idToken,
      guestAllowed: false
    }
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken } = validationResponse.sanitizedVariables;

  gameService
    .newGame(request.body.gameData, idToken!)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

gameRouter.put('/update', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `games/update`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    }
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const idToken = validationResponse.sanitizedVariables.idToken;
  const gameData = request.body.gameData;

  gameService
    .updateGameSettings(idToken!, gameData)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

gameRouter.post('/declare-ready', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `games/declare-ready`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
    gameId: request.body.gameId
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken, gameId } = validationResponse.sanitizedVariables;

  gameService
    .declareReady(idToken!, gameId!)
    .then(() => {
      response.send({ success: true });
    })
    .catch(() => {
      response.send({ success: false });
    });
});