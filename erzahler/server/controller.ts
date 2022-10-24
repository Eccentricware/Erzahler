import express from 'express';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { gameRouter } from './routes/game-router';
import { userRouter } from './routes/user-router';
const serviceAccount = require('/home/ubox/personal/blitzkarte/Erzahler/erzahler/secrets/erzahler-e66cd-firebase-adminsdk-zgsbb-a50c7851d5.json');

const erzhaler = express();
const cors = require('cors');
const port: number = 8000;

erzhaler.use(cors());
erzhaler.use(bodyParser.json({limit: '5mb'}));
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
erzhaler.use('/games', gameRouter);
erzhaler.use('/user', userRouter);

erzhaler.get('/check-status', (request, response) => {
  response.send(true);
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});