import express from 'express';
import { SchedulerService } from '../services/scheduler-service';

export const schedulingRouter = express.Router();
const schedulingService = new SchedulerService();

schedulingRouter.get('/all-events', (request, response) => {
  schedulingService
    .getAllEvents()
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send('Get all events error: ' + error.message);
    });
});
