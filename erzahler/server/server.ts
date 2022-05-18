import express from 'express';
import { createAccountWithUsernameAndEmail } from './services/accounts';

const erzhaler = express();
const bodyParser = require('body-parser');
const port: number = 8000;

erzhaler.use(bodyParser.json());

erzhaler.get('/', (request, response) => {
  const testFeedBack: string = `Who is up for an interactive story?`;
  response.send(testFeedBack);
});

erzhaler.post('/signup', (request, response) => {
  let { email, password, username } = request.body;
  const accounts: any = createAccountWithUsernameAndEmail(username, email, password);
  accounts.then((results: any) => {
    response.send(results);
  });
});

erzhaler.listen(port, () => {
  console.log(`Erzhaler is running on port ${port}`);
});