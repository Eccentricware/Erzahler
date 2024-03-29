import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { gameRouter } from './routes/game-router';
import { userRouter } from './routes/user-router';
import { assignmentRouter } from './routes/assignment-router';
import { SchedulerService } from './services/scheduler-service';
import { ordersRouter } from './routes/orders-router';
import { mapRouter } from './routes/maps-router';
import { optionsRouter } from './routes/options-router';
import * as dotenv from 'dotenv';
import { schedulingRouter } from './routes/scheduling-router';
import { historyRouter } from './routes/history-router';
import { importRouter } from './routes/import-router';
// import { OptionsService } from './services/options-service';

dotenv.config();

const erzahler = express();
const port = 8000;
const schedulerService: SchedulerService = new SchedulerService();

// const optionsService: OptionsService = new OptionsService();
// optionsService.saveOptionsForTurn(33);

erzahler.use(cors());
erzahler.use(bodyParser.json({ limit: '5mb' }));
initializeApp({
  credential: applicationDefault()
});

erzahler.use('/assignments', assignmentRouter);
erzahler.use('/scheduling', schedulingRouter);
erzahler.use('/games', gameRouter);
erzahler.use('/history', historyRouter);
erzahler.use('/import', importRouter);
erzahler.use('/maps', mapRouter);
erzahler.use('/options', optionsRouter);
erzahler.use('/orders', ordersRouter);
erzahler.use('/user', userRouter);

erzahler.get('/check-status', (request, response) => {
  response.send(true);
});

erzahler.listen(port, () => {
  console.log(`Erzahler (${process.env.npm_package_version}) is running on port ${port}`);
});

schedulerService.checkIn(15);

schedulerService.syncDeadlines();
