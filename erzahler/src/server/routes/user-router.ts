import express from 'express';
import { db } from '../../database/connection';
import { UserProfile } from '../../models/objects/user-profile-object';
import { AccountService } from '../services/account-service';
import { terminalLog } from '../utils/general';

export const userRouter = express.Router();
const accountService = new AccountService();

userRouter.get('/report-guest/:guestId', (request, response) => {
  const guestId = request.params.guestId;
  terminalLog(`Guest reporting: ${guestId}`);
  response.send({ message: 'Thanks for visiting! Just reporting a random number to help with guest metrics.' });
});

userRouter.get('/check-username/:username', (request, response) => {
  const { username } = request.params;
  db.accountsRepo
    .checkUsernameAvailable(username)
    .then((usernameAvailable: any) => {
      terminalLog(`Username availability check: ${username}`);
      response.send(usernameAvailable);
    })
    .catch((error: Error) => {
      terminalLog(`Username availability check FAILED: ${username}`);
      response.send(error.message);
    });
});

userRouter.get('/profile', (request, response) => {
  const idToken: string = <string>request.headers.idtoken;

  accountService
    .getUserProfile(idToken)
    .then((userProfile: UserProfile | undefined) => {
      if (userProfile) {
        terminalLog(`Get Profile: ${userProfile.username}`);
        response.send(userProfile);
      } else {
        terminalLog(`No User Profile for idToken (${idToken})`);
        response.send({ succes: false, message: `idToken ${idToken} does not return a user profile`});
      }
    })
    .catch((error: Error) => {
      terminalLog(`Get Profile FAILURE: ${idToken}`);
      response.send({error: error.message});
    });
});

userRouter.post('/register', (request, response) => {
  const { idToken, username } = request.body;

  accountService
    .attemptAddUserToDatabase(idToken, username)
    .then((result: any) => {
      terminalLog(`User Registered: ${username}`);
      response.send(result);
    })
    .catch((error: Error) => {
      terminalLog(`User Registration Failure: ${username}`);
      response.send(error.message);
    });
});

userRouter.post('/add-provider', (request, response) => {
  const { oldIdToken, newIdToken } = request.body;

  accountService
    .addAdditionalProvider(oldIdToken, newIdToken)
    .then((result: any) => {
      terminalLog(`${result.username} added a provider: ${result.providerType}`);
      response.send(result);
    })
    .catch((error: Error) => {
      terminalLog(`Someone tried to add a provider`);
      response.send(error.message);
    });
});

userRouter.put('/update-settings', (request, response) => {
  const idToken = request.headers.idtoken;
  const data = request.body;

  accountService
    .updateUserSettings(<string>idToken, data)
    .then((result: any) => {
      terminalLog(`Profile Updated: ${result.username}`);
      response.send({ success: true });
    })
    .catch((error: Error) => {
      terminalLog(`Profile Update Failed`);
      response.send({ error: 'Update User Profile Controller Error: ' + error.message });
    });
});
