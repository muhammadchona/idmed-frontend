import { Model } from 'pinia-orm';
import { date } from 'quasar';
import Clinic from '../clinic/Clinic';
import { InventoryStockAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Inventory extends Model {
  static entity = 'inventorys';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      startDate: this.attr(null),
      endDate: this.attr(null),
      open: this.boolean(true),
      generic: this.boolean(true),
      sequence: this.number(0),
      drugs: this.attr([]),
      syncStatus: this.attr(''),
      clinic_id: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      adjustments: this.hasMany(InventoryStockAdjustment, 'inventory_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  }
 

  static getClassName() {
    return 'Inventory';
  }
}
