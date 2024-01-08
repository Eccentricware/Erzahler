import pgPromise, { IDatabase, IInitOptions, IMain } from 'pg-promise';
import { envCredentials } from '../secrets/dbCredentials';
import { AccountsRepository } from './repos/accounts-repo';
import { AssignmentRepository } from './repos/assignments-repo';
import { GameRepository } from './repos/game-repo';
import { MapRepository } from './repos/map-repo';
import { OptionsRepository } from './repos/options-repo';
import { OrdersRepository } from './repos/orders-repo';
import { ResolutionRepository } from './repos/resolution-repo';
import { SchedulerRepository } from './repos/scheduler-repo';
import { HistoryRepository } from './repos/history-repo';

interface IExtensions {
  accountsRepo: AccountsRepository;
  assignmentRepo: AssignmentRepository;
  gameRepo: GameRepository;
  historyRepo: HistoryRepository;
  mapRepo: MapRepository;
  optionsRepo: OptionsRepository;
  ordersRepo: OrdersRepository;
  resolutionRepo: ResolutionRepository;
  schedulerRepo: SchedulerRepository;
}

const initOptions: IInitOptions<IExtensions> = {
  extend(obj: IDatabase<IExtensions> & IExtensions) {
    // , dc: any
    obj.accountsRepo = new AccountsRepository(obj, pgp);
    obj.assignmentRepo = new AssignmentRepository(obj, pgp);
    obj.gameRepo = new GameRepository(obj, pgp);
    obj.historyRepo = new HistoryRepository(obj, pgp);
    obj.mapRepo = new MapRepository(obj, pgp);
    obj.optionsRepo = new OptionsRepository(obj, pgp);
    obj.ordersRepo = new OrdersRepository(obj, pgp);
    obj.resolutionRepo = new ResolutionRepository(obj, pgp);
    obj.schedulerRepo = new SchedulerRepository(obj, pgp);
  }
};

const pgp: IMain = pgPromise(initOptions);

const db: IDatabase<IExtensions> & IExtensions = pgp(envCredentials);

export { db, pgp };
