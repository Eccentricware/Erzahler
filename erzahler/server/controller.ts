import express, { response } from 'express';
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

// erzhaler.post('/verify-email', (request, response) => {
//   const { idToken } = request.body;

//   accountService.verifyEmail(idToken);
// })

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

// erzhaler.put('/update-email/:idToken', (request, response) => {
//   const { idToken } = request.params;
//   const { newEmail } = request.body;

//   accountService.updateUserEmail(idToken, newEmail);
// });

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});