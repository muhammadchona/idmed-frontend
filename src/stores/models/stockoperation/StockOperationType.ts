import { Model } from 'pinia-orm';
import { StockAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';

export default class StockOperationType extends Model {
  static entity = 'stockOperationTypes';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      adjustments: this.hasMany(StockAdjustment, 'operation_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  }

}
