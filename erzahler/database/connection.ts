import pgPromise, { IDatabase, IInitOptions, IMain } from "pg-promise";
import { victorCredentials } from "../secrets/dbCredentials";
import { GameRepository } from "./repos/game-repo";
import { OptionsRepository } from "./repos/options-repo";

interface IExtensions {
  optionsRepo: OptionsRepository;
  gameRepo: GameRepository;
}

const initOptions: IInitOptions<IExtensions> = {
  extend(obj: IDatabase<IExtensions> & IExtensions, dc: any) {
    obj.optionsRepo = new OptionsRepository(obj, pgp);
    obj.gameRepo = new GameRepository(obj, pgp);
  }
}

const pgp: IMain = pgPromise(initOptions);

const db: IDatabase<IExtensions> & IExtensions = pgp(victorCredentials);

export {db, pgp};