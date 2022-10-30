import express from "express";
import { AssignmentService } from "../services/assignmentService";

export const assignmentRouter = express.Router();
const assignmentService = new AssignmentService();

assignmentRouter.post('/register/:gameId/:assignmentType', (request, response) => {
  const idToken = <string>request.headers.idtoken;
  const gameId = Number(request.params.gameId);
  const assignmentType = <string>request.params.assignmentType;

  assignmentService.addPlayerAssignment(idToken, gameId, assignmentType)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
});