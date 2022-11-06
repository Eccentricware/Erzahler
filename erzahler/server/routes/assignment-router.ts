import express from "express";
import { AssignmentService } from "../services/assignmentService";

export const assignmentRouter = express.Router();
const assignmentService = new AssignmentService();

assignmentRouter.get(`/:gameId`, (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);

  assignmentService.getGameAssignments(idToken, gameId)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
})

assignmentRouter.post('/register', (request, response) => {
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
  const idToken = <string> request.headers.idtoken;
  const gameId = Number(request.body.gameId);
  const assignmentType = <string>request.body.assignmentType;

  assignmentService.removeUserAssignment(idToken, gameId, assignmentType)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
});