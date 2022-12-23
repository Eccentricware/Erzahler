import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { gameRouter } from './routes/game-router';
import { userRouter } from './routes/user-router';
import { assignmentRouter } from './routes/assignment-router';
import cors from 'cors';
import { SchedulerService } from './services/schedulerService';
import { OptionsService } from './services/optionsService';
import pgp from 'pg-promise'
import { victorCredentials } from '../secrets/dbCredentials';

const serviceAccount = require('/home/ubox/personal/blitzkarte/Erzahler/erzahler/secrets/erzahler-e66cd-firebase-adminsdk-zgsbb-a50c7851d5.json');
const erzhaler = express();
const port: number = 8000;
const schedulerService: SchedulerService = new SchedulerService();

const optionsService: OptionsService = new OptionsService();
optionsService.saveOptionsForNextTurns(14);

erzhaler.use(cors());
erzhaler.use(bodyParser.json({limit: '5mb'}));
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
erzhaler.use('/games', gameRouter);
erzhaler.use('/user', userRouter);
erzhaler.use('/assignments', assignmentRouter);

erzhaler.get('/check-status', (request, response) => {
  response.send(true);
});

schedulerService.syncDeadlines();

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});