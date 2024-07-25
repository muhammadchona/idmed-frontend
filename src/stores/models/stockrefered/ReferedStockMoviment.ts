import { Model } from 'pinia-orm';
import { Clinic } from '../clinic/ClinicHierarchy';
import { StockReferenceAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import { v4 as uuidv4 } from 'uuid';

export default class StockReferedStockMoviment extends Model {
  static entity = 'referedStockMoviments';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      date: this.attr(null),
      orderNumber: this.attr(''),
      origin: this.attr(''),
      quantity: this.number(0),
      updateStatus: this.attr('P'),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      adjustments: this.hasMany(StockReferenceAdjustment, 'reference_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
