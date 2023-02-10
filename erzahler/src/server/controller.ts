import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
// import { serviceAccount } from '/home/ubox/personal/blitzkarte/Erzahler/erzahler/src/secrets/firebase-service-account';
import { gameRouter } from './routes/game-router';
import { userRouter } from './routes/user-router';
import { assignmentRouter } from './routes/assignment-router';
import { SchedulerService } from './services/scheduler-service';
import { ordersRouter } from './routes/orders-router';
import { mapRouter } from './routes/maps-router';
import { optionsRouter } from './routes/options-router';

const erzhaler = express();
const port = 8000;
const schedulerService: SchedulerService = new SchedulerService();

// const ordersService: OrdersService = new OrdersService();
// ordersService.saveOptionsForNextTurn(33);

erzhaler.use(cors());
erzhaler.use(bodyParser.json({ limit: '5mb' }));
initializeApp({
  credential: applicationDefault()
});
erzhaler.use('/assignments', assignmentRouter);
erzhaler.use('/games', gameRouter);
erzhaler.use('/maps', mapRouter);
erzhaler.use('/options', optionsRouter);
erzhaler.use('/orders', ordersRouter);
erzhaler.use('/user', userRouter);

erzhaler.get('/check-status', (request, response) => {
  response.send(true);
});

schedulerService.syncDeadlines();

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});
