import { Model } from 'pinia-orm';
import { StockAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import db from 'src/stores/localbase';

export default class StockOperationType extends Model {
  static entity = 'stockOperationTypes';

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

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/stockOperationType?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(stockOperationType) {
    return db.newDb().collection('stockOperationTypes').add(stockOperationType);
  }

  static localDbGetById(id) {
    return db.newDb().collection('stockOperationTypes').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('stockOperationTypes').get();
  }

  static localDbUpdate(stockOperationType) {
    return db
      .newDb()
      .collection('stockOperationTypes')
      .doc({ id: stockOperationType.id })
      .set(stockOperationType);
  }

  static localDbUpdateAll(stockOperationTypes) {
    return db
      .newDb()
      .collection('stockOperationTypes')
      .set(stockOperationTypes);
  }

  static localDbDelete(stockOperationType) {
    return db
      .newDb()
      .collection('stockOperationTypes')
      .doc({ id: stockOperationType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('stockOperationTypes').delete();
  }
}
