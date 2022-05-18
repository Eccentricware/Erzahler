// const pgPromise = require('pg-promise')();
const Pool = require('pg').Pool;

import { DBCredentials, victorCredentials } from '../secrets/dbCredentials';

const connection: DBCredentials = victorCredentials;

export const erzahlerDB = new Pool(victorCredentials);
// export const erzahlerDB = pgPromise(connection);