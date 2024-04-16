import express from 'express';
import { AssignmentService } from '../services/assignment-service';
import { ValidationService } from '../services/validation-service';

export const assignmentRouter = express.Router();
const assignmentService = new AssignmentService();
const validationService = new ValidationService();

assignmentRouter.get(`/:gameId`, (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `assignments/:gameId`,
    gameId: request.params.gameId,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: true
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

  assignmentService
    .getGameAssignments(idToken, gameId)
    .then((result) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.post('/register', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `assignments/register`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
    gameId: request.body.gameId,
    assignmentType: request.body.assignmentType
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken, gameId, assignmentType } = validationResponse.sanitizedVariables;

  if (!idToken) {
    response.send({ error: 'ID Token is required.' });
    return;
  }

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  if (!assignmentType) {
    response.send({ error: 'Assignment Type is required.' });
    return;
  }

  assignmentService
    .registerUser(idToken, gameId, assignmentType)
    .then((result) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.post('/unregister', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `assignments/unregister`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
    gameId: request.body.gameId,
    assignmentType: request.body.assignmentType
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken, gameId, assignmentType } = validationResponse.sanitizedVariables;

  if (!idToken) {
    response.send({ error: 'ID Token is required.' });
    return;
  }

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  if (!assignmentType) {
    response.send({ error: 'Assignment Type is required.' });
    return;
  }

  assignmentService
    .unregisterUser(idToken, gameId, assignmentType)
    .then((result) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.post('/assign-player', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `assignments/assign-player`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
    gameId: request.body.gameId,
    playerId: request.body.userId,
    countryId: request.body.countryId
  });

  if (!validationResponse.valid) {
    response.send({ error: validationResponse.errors });
    return;
  }

  const { idToken, gameId, playerId, countryId } = validationResponse.sanitizedVariables;

  if (!idToken) {
    response.send({ error: 'ID Token is required.' });
    return;
  }

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  if (!playerId) {
    response.send({ error: 'Player ID is required.' });
    return;
  }

  if (!countryId) {
    response.send({ error: 'Country ID is required.' });
    return;
  }

  assignmentService
    .assignPlayer(idToken, gameId, playerId, countryId)
    .then(() => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.put('/lock-assignment', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `assignments/lock-assignment`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
    gameId: request.body.gameId,
    playerId: request.body.userId
  });

  const { idToken, gameId, playerId } = validationResponse.sanitizedVariables;

  if (!idToken) {
    response.send({ error: 'ID Token is required.' });
    return;
  }

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  if (!playerId) {
    response.send({ error: 'Player ID is required.' });
    return;
  }

  assignmentService
    .lockAssignment(idToken, gameId, playerId)
    .then(() => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.put('/unlock-assignment', (request, response) => {
  const validationResponse = validationService.validateRequest({
    route: `assignments/unlock-assignment`,
    idToken: {
      value: <string>request.headers.idtoken,
      guestAllowed: false
    },
    gameId: request.body.gameId,
    playerId: request.body.userId
  });

  const { idToken, gameId, playerId } = validationResponse.sanitizedVariables;

  if (!idToken) {
    response.send({ error: 'ID Token is required.' });
    return;
  }

  if (!gameId) {
    response.send({ error: 'Game ID is required.' });
    return;
  }

  if (!playerId) {
    response.send({ error: 'Player ID is required.' });
    return;
  }

  assignmentService
    .unlockAssignment(idToken, gameId, playerId)
    .then(() => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});
