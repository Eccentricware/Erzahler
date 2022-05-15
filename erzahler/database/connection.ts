const pgPromise = require('pg-promise')();
import { DBCredentials, victorCredentials } from '../secrets/dbCredentials';

const connection: DBCredentials = victorCredentials;

const database = pgPromise(connection);

module.exports = database;