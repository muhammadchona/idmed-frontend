import { Model } from 'pinia-orm';
import { Clinic } from '../clinic/ClinicHierarchy';
import { StockDestructionAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import { v4 as uuidv4 } from 'uuid';

export default class DestroyedStock extends Model {
  static entity = 'destroyedStocks';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      notes: this.attr(''),
      date: this.attr(null),
      updateStatus: this.attr('P'),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      adjustments: this.hasMany(StockDestructionAdjustment, 'destruction_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
