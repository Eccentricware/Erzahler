import express from 'express';
import { AccountService } from './services/accountService';
import bodyParser from 'body-parser';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../secrets/firebase';
import { getAuth } from 'firebase/auth';
import { error } from 'console';

const erzhaler = express();
const port: number = 8000;

erzhaler.use(bodyParser.json());
const accountService = new AccountService();

erzhaler.get('/', (request, response) => {
  const testFeedBack: string = `Who is up for an interactive story?`;
  response.send(testFeedBack);
});

erzhaler.post('/signup', (request, response) => {
  let { email, password, username } = request.body;

 accountService.createAccountWithUsernameAndEmail(username, email, password)
  .then((results: any) => {
    response.send(results);
  }).catch((error: Error) => {
    response.send(error.message);
  });

});

erzhaler.get('/api/accounts/check-email/:email', (request, response) => {
  const { email } = request.params;
  const emailAvailabilityCheck: any = accountService.checkEmailAvailability(email);
  emailAvailabilityCheck.then((emailAvailable: any) => {
    response.send(emailAvailable);
  })
    .catch((e: Error) => console.error(e.stack));
});

erzhaler.get('/api/accounts/check-username/:username', (request, response) => {
  const { username } = request.params;
  const usernameAvailabilityCheck: any = accountService.checkUsernameInDB(username);
  usernameAvailabilityCheck.then((usernameAvailable: any) => {
    response.send(usernameAvailable);
  })
    .catch((e: Error) => console.error(e.stack));
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});