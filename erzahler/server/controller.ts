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
console.log('Before Initialize')
initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
console.log('After initialize');

const accountService = new AccountService();

erzhaler.get('/', (request, response) => {
  const testFeedBack: string = `Who is up for an interactive story?`;
  response.send(testFeedBack);
});

erzhaler.post('/register-user', (request, response) => {
  let { idToken, username, email, password } = request.body;

  accountService.addUserWithEmail(idToken, username, email)
    .then((result: any) => {
      response.send(result);

    })
    .catch((error: Error) => {
      response.send(error.message);
    });
});

erzhaler.get('/api/email-available-check/:email', (request, response) => {
  const { email } = request.params;
  accountService.checkEmailAvailability(email)
    .then((emailAvailable: any) => {
      response.send(emailAvailable);
    })
    .catch((e: Error) => console.error(e.stack));
});

erzhaler.post('/api/sign-in-with-google', (request, response) => {
  // accountService.signInWithGoogle()
  //   .then((user: any) => {
  //     console.log('Final response user:', user);
  //     response.send(user);
  //   })
  //   .catch((error: Error) => {
  //     response.send(error.message);
  //   })
});

erzhaler.get('/check-username/:username', (request, response) => {
  const { username } = request.params;
  accountService.checkUsernameInDB(username)
    .then((usernameAvailable: any) => {
      console.log(usernameAvailable);
      response.send(usernameAvailable);
    })
    .catch((e: Error) => console.error(e.stack));
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});