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

  static async apiSave(adjustment) {
    return await this.api().post('/stockReferenceAdjustment', adjustment);
  }

  static async apiRemove(id) {
    return await this.api().delete(`/stockReferenceAdjustment/${id}`);
  }

  static async apiUpdate(adjustment) {
    return await this.api().patch('/stockReferenceAdjustment', adjustment);
  }

  static async apiGetAll() {
    return await this.api().get('/stockReferenceAdjustment');
  }
}
