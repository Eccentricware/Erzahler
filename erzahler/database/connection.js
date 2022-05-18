"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.erzahlerDB = void 0;
// const pgPromise = require('pg-promise')();
const Pool = require('pg').Pool;
const dbCredentials_1 = require("../secrets/dbCredentials");
const connection = dbCredentials_1.victorCredentials;
exports.erzahlerDB = new Pool(dbCredentials_1.victorCredentials);
// export const erzahlerDB = pgPromise(connection);
