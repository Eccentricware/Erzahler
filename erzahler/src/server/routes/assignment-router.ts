import express from 'express';
import { AssignmentService } from '../services/assignment-service';

export const assignmentRouter = express.Router();
const assignmentService = new AssignmentService();

assignmentRouter.get(`/:gameId`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  assignmentService
    .getGameAssignments(idToken, gameId)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.post('/register', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.body.gameId);
  const assignmentType = <string>request.body.assignmentType;

  assignmentService
    .registerUser(idToken, gameId, assignmentType)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.post('/unregister', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.body.gameId);
  const assignmentType = <string>request.body.assignmentType;

  console.log(<string>request.headers.idtoken);
  console.log(Number(request.body.gameId));
  console.log(<string>request.body.assignmentType);

  assignmentService
    .unregisterUser(idToken, gameId, assignmentType)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.post('/assign-player', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = request.body.gameId;
  const playerId = request.body.userId;
  const countryId = request.body.countryId;

  assignmentService
    .assignPlayer(idToken, gameId, playerId, countryId)
    .then((result: any) => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.put('/lock-assignment', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = request.body.gameId;
  const playerId = request.body.userId;

  assignmentService
    .lockAssignment(idToken, gameId, playerId)
    .then((result: any) => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});

assignmentRouter.put('/unlock-assignment', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = request.body.gameId;
  const playerId = request.body.userId;

  assignmentService
    .unlockAssignment(idToken, gameId, playerId)
    .then((result: any) => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: error.message });
    });
});
