import { ColumnSet, IDatabase, IMain } from "pg-promise";
import { TableDef, tableDefsList } from "./table-defs";

export class MasterRepoository {
  tableDefs: Record<string, ColumnSet<unknown>> = {};
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.setTableDefs(tableDefsList);
  }

  setTableDefs(tableDefsList: TableDef[]) {
    tableDefsList.forEach(tableDef => {
      this.tableDefs[tableDef.name] = new this.pgp.helpers.ColumnSet(
        tableDef.dbCols,
        tableDef.options
      );
    });
  }
}