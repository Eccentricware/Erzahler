import pgPromise from "pg-promise";

export interface TableDef {
  name: string;
  dbCols: string[];
  options: pgPromise.IColumnSetOptions;
}

/** Table defs in one place for dynamic importing in mastere repo */
export const tableDefsList: TableDef[] = [
  {
    name: 'orderSets',
    dbCols: [
      'country_id',
      'turn_id',
      'message_id',
      'submission_time',
      'order_set_type',
      'order_set_name'
    ],
    options: { table: 'order_sets' }
  }
]