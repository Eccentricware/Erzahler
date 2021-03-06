import express, { response } from 'express';
import { AccountService } from './services/accountService';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { GameService } from './services/gameService';
import { error } from 'console';
const serviceAccount = require('/home/ubox/personal/blitzkarte/Erzahler/erzahler/secrets/erzahler-e66cd-firebase-adminsdk-zgsbb-a50c7851d5.json');

const erzhaler = express();
const cors = require('cors');
const port: number = 8000;

erzhaler.use(cors());
erzhaler.use(bodyParser.json({limit: '5mb'}));
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const accountService = new AccountService();
const gameService = new GameService();

erzhaler.get('/check-status', (request, response) => {
  response.send(true);
});

erzhaler.post('/register-user', (request, response) => {
  let { idToken, username } = request.body;

  accountService.attemptAddUserToDatabase(idToken, username)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send(error.message);
    });
});

erzhaler.get('/check-username/:username', (request, response) => {
  const { username } = request.params;
  accountService.checkUsernameAvailable(username)
    .then((usernameAvailable: any) => {
      response.send(usernameAvailable);
    })
    .catch((error: Error) => response.send(error.message));
});

erzhaler.get('/get-user-profile/:idToken', (request, response) => {
  const { idToken } = request.params;

  accountService.getUserProfile(idToken)
    .then((userProfile: any) => {
      response.send(userProfile);
    })
    .catch((error: Error) => {
      response.send(error.message);
    })
});

erzhaler.post('/add-provider', (request, response) => {
  const { idToken, username } = request.body;

  accountService.addProvider(idToken, username)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send(error.message);
    });
});

erzhaler.post('/new-game', (request, response) => {
  gameService.newGame(request.body, <string>request.headers.idToken)
    .then((result: any) => {
      response.send({success: 'Success'});
    })
    .catch((error: Error) => {
      response.send({error: error.message});
    });
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});