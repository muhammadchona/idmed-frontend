import { StockAdjustment } from './StockAdjustmentHierarchy';
import ReferedStockMoviment from '../stockrefered/ReferedStockMoviment';
import { v4 as uuidv4 } from 'uuid';

export class StockReferenceAdjustment extends StockAdjustment {
  static entity = 'stockReferenceAdjustments';
  static baseEntity = 'stockAdjustments';

  static fields() {
    return {
      ...super.fields(),
      id: this.string(() => uuidv4()),
      reference_id: this.attr(null),
      // relationships
      reference: this.belongsTo(ReferedStockMoviment, 'reference_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  }
}
