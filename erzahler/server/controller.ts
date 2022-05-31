import express from 'express';
import { AccountService } from './services/accountService';
import bodyParser from 'body-parser';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import admin from 'firebase-admin';
const serviceAccount = require('/home/ubox/personal/Blitzkarte/Erzahler/erzahler/secrets/erzahler-e66cd-firebase-adminsdk-zgsbb-f93fded183.json');

const erzhaler = express();
const cors = require('cors');
const port: number = 8000;

erzhaler.use(cors());
erzhaler.use(bodyParser.json());
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const accountService = new AccountService();

erzhaler.get('/', (request, response) => {
  const testFeedBack: string = `Who is up for an interactive story?`;
  response.send(testFeedBack);
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
      console.log(usernameAvailable);
      response.send(usernameAvailable);
    })
    .catch((error: Error) => response.send(error.message));
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});