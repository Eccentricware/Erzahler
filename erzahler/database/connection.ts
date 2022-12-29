import pgPromise, { IDatabase, IInitOptions, IMain } from "pg-promise";
import { victorCredentials } from "../secrets/dbCredentials";
import { AccountsRepository } from "./repos/accounts-repo";
import { AssignmentRepository } from "./repos/assignments-repo";
import { GameRepository } from "./repos/game-repo";
import { OptionsRepository } from "./repos/options-repo";

interface IExtensions {
  optionsRepo: OptionsRepository;
  gameRepo: GameRepository;
  accountsRepo: AccountsRepository;
  assignmentRepo: AssignmentRepository;
}

const initOptions: IInitOptions<IExtensions> = {
  extend(obj: IDatabase<IExtensions> & IExtensions, dc: any) {
    obj.optionsRepo = new OptionsRepository(obj, pgp);
    obj.gameRepo = new GameRepository(obj, pgp);
    obj.accountsRepo = new AccountsRepository(obj, pgp);
    obj.assignmentRepo = new AssignmentRepository(obj, pgp);
  }
}

const pgp: IMain = pgPromise(initOptions);

const db: IDatabase<IExtensions> & IExtensions = pgp(victorCredentials);

export {db, pgp};