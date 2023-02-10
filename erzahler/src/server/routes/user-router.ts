import express from 'express';
import { db } from '../../database/connection';
import { AccountService } from '../services/accountService';

export const userRouter = express.Router();
const accountService = new AccountService();

userRouter.get('/check-username/:username', (request, response) => {
  const { username } = request.params;
  db.accountsRepo
    .checkUsernameAvailable(username)
    .then((usernameAvailable: any) => {
      response.send(usernameAvailable);
    })
    .catch((error: Error) => response.send(error.message));
});

userRouter.get('/profile', (request, response) => {
  const idToken: string = <string>request.headers.idtoken;

  accountService
    .getUserProfile(idToken)
    .then((userProfile: any) => {
      response.send(userProfile);
    })
    .catch((error: Error) => {
      response.send(error.message);
    });
});

userRouter.post('/register', (request, response) => {
  const { idToken, username } = request.body;

  accountService
    .attemptAddUserToDatabase(idToken, username)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send(error.message);
    });
});

userRouter.post('/add-provider', (request, response) => {
  const { idToken, username } = request.body;

  accountService
    .addAdditionalProvider(idToken, username)
    .then((result: any) => {
      response.send(result);
    })
    .catch((error: Error) => {
      response.send(error.message);
    });
});

userRouter.put('/update-settings', (request, response) => {
  const idToken = request.headers.idtoken;
  const data = request.body;

  accountService
    .updateUserSettings(<string>idToken, data)
    .then(() => {
      response.send({ success: true });
    })
    .catch((error: Error) => {
      response.send({ error: 'Update User Profile Controller Error: ' + error.message });
    });
});
