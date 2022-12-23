import { ColumnSet, IDatabase, IMain } from "pg-promise";
import { OrderOption } from "../../models/objects/option-context-objects";

export class OptionsRepository {
  orderOptionsCols: ColumnSet<unknown>
  /**
   * @param db
   * @param pgp
   */
  constructor(private db: IDatabase<any>, private pgp: IMain) {
    this.orderOptionsCols = new pgp.helpers.ColumnSet([
      'unit_id',
      'order_type',
      'secondary_unit_id',
      'destination_choices',
      'turn_id'
    ], {table: 'order_options'});
  }

  saveOrderOptions(orderOptions: OrderOption[]): Promise<void> {
    const orderOptionValues = orderOptions.map((option: OrderOption) => {
      return {
        unit_id: option.unitId,
        order_type: option.orderType,
        secondary_unit_id: option.secondaryUnitId,
        destination_choices: option.destinationChoices,
        turn_id: option.turnId
      }
    });

    const query = this.pgp.helpers.insert(orderOptionValues, this.orderOptionsCols)
    return this.db.query(query);
  }
}