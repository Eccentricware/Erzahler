"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgp = exports.db = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const dbCredentials_1 = require("../secrets/dbCredentials");
const accounts_repo_1 = require("./repos/accounts-repo");
const assignments_repo_1 = require("./repos/assignments-repo");
const game_repo_1 = require("./repos/game-repo");
const map_repo_1 = require("./repos/map-repo");
const options_repo_1 = require("./repos/options-repo");
const orders_repo_1 = require("./repos/orders-repo");
const resolution_repo_1 = require("./repos/resolution-repo");
const scheduler_repo_1 = require("./repos/scheduler-repo");
const initOptions = {
    extend(obj) {
        // , dc: any
        obj.accountsRepo = new accounts_repo_1.AccountsRepository(obj, pgp);
        obj.assignmentRepo = new assignments_repo_1.AssignmentRepository(obj, pgp);
        obj.gameRepo = new game_repo_1.GameRepository(obj, pgp);
        obj.mapRepo = new map_repo_1.MapRepository(obj, pgp);
        obj.optionsRepo = new options_repo_1.OptionsRepository(obj, pgp);
        obj.ordersRepo = new orders_repo_1.OrdersRepository(obj, pgp);
        obj.resolutionRepo = new resolution_repo_1.ResolutionRepository(obj, pgp);
        obj.schedulerRepo = new scheduler_repo_1.SchedulerRepository(obj, pgp);
    }
};
const pgp = (0, pg_promise_1.default)(initOptions);
exports.pgp = pgp;
const db = pgp(dbCredentials_1.victorCredentials);
exports.db = db;
//# sourceMappingURL=connection.js.map