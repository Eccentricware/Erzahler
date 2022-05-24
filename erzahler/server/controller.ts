import express from 'express';
import { AccountService } from './services/accountService';
import bodyParser from 'body-parser';

const erzhaler = express();
const cors = require('cors');
const port: number = 8000;

erzhaler.use(cors());
erzhaler.use(bodyParser.json());
const accountService = new AccountService();

erzhaler.get('/', (request, response) => {
  const testFeedBack: string = `Who is up for an interactive story?`;
  response.send(testFeedBack);
});

erzhaler.post('/api/register-by-email', (request, response) => {
  let { username, email, password } = request.body;

  accountService.createAccountWithUsernameAndEmail(username, email, password)
    .then((results: any) => {
      response.send(results);
    }).catch((error: Error) => {
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
  accountService.signInWithGoogle()
    .then((user: any) => {
      console.log('Final response user:', user);
      response.send(user);
    })
    .catch((error: Error) => {
      response.send(error.message);
    })
})

erzhaler.get('/api/username-available-check/:username', (request, response) => {
  const { username } = request.params;
  accountService.checkUsernameInDB(username)
    .then((usernameAvailable: any) => {
      response.send(usernameAvailable);
    })
    .catch((e: Error) => console.error(e.stack));
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});