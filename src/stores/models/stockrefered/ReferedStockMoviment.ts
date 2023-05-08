import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import { StockReferenceAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class StockReferedStockMoviment extends Model {
  static entity = 'referedStockMoviments';

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

  static async apiSave(referedStockMoviment) {
    return await this.api().post('/referedStockMoviment', referedStockMoviment);
  }

  static async apiRemove(id) {
    return await this.api().delete(`/referedStockMoviment/${id}`);
  }

  static async apiUpdate(referedStockMoviment) {
    return await this.api().patch(
      '/referedStockMoviment',
      referedStockMoviment
    );
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/referedStockMoviment?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(referedStockMoviment) {
    return db
      .newDb()
      .collection('referedStockMoviments')
      .add(referedStockMoviment);
  }

  static localDbGetById(id) {
    return db.newDb().collection('referedStockMoviments').doc({ id: id }).get();
  }

  static async localDbGetAll() {
    return await db.newDb().collection('referedStockMoviments').get();
  }

  static localDbUpdate(referedStockMoviment) {
    return db
      .newDb()
      .collection('referedStockMoviments')
      .doc({ id: referedStockMoviment.id })
      .set(referedStockMoviment);
  }

  static localDbUpdateAll(referedStockMoviments) {
    return db
      .newDb()
      .collection('referedStockMoviments')
      .set(referedStockMoviments);
  }

  static localDbDelete(referedStockMoviment) {
    return db
      .newDb()
      .collection('referedStockMoviments')
      .doc({ id: referedStockMoviment.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('referedStockMoviments').delete();
  }

  static localDbDeleteById(id) {
    return db
      .newDb()
      .collection('referedStockMoviments')
      .doc({ id: id })
      .delete();
  }

  static async syncReferedStock(referedStock) {
    if (referedStock.syncStatus === 'R') await this.apiSave(referedStock);
    if (referedStock.syncStatus === 'U') await this.apiUpdate(referedStock);
  }
}
