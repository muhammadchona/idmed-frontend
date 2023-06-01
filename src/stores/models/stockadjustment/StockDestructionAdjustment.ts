import { StockAdjustment } from './StockAdjustmentHierarchy';
import DestroyedStock from '../stockdestruction/DestroyedStock';
import { v4 as uuidv4 } from 'uuid';

export class StockDestructionAdjustment extends StockAdjustment {
  static entity = 'stockDestructionAdjustments';
  static baseEntity = 'stockAdjustments';

  static fields() {
    return {
      ...super.fields(),
      id: this.string(() => uuidv4()),
      destruction_id: this.attr(null),
      // relationships
      destruction: this.belongsTo(DestroyedStock, 'destruction_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  }
}
