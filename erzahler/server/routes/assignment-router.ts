import express from "express";
import { AssignmentService } from "../services/assignmentService";

export const assignmentRouter = express.Router();
const assignmentService = new AssignmentService();

assignmentRouter.get(`/:gameId`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  console.log('idToken', idToken);

  assignmentService.getGameAssignments(idToken, gameId)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
})

assignmentRouter.post('/register', (request, response) => {
  console.log('Seeing register request');
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.body.gameId);
  const assignmentType = <string>request.body.assignmentType;

  assignmentService.addUserAssignment(idToken, gameId, assignmentType)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
});

assignmentRouter.post('/unregister', (request, response) => {
  console.log('Seeing unregister request');
  const idToken = <string> request.headers.idtoken;
  const gameId = Number(request.body.gameId);
  const assignmentType = <string>request.body.assignmentType;

  console.log(<string> request.headers.idtoken);
  console.log(Number(request.body.gameId));
  console.log(<string>request.body.assignmentType);

  assignmentService.removeUserAssignment(idToken, gameId, assignmentType)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
});

assignmentRouter.post('/assign-player', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = request.body.gameId;
  const userId = request.body.userId;
  const countryId = request.body.countryId;

  assignmentService.assignPlayer(idToken, gameId, userId, countryId)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });;
})