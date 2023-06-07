import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import { StockDestructionAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';
import api from 'src/services/api/apiService/apiService';

export default class DestroyedStock extends Model {
  static entity = 'destroyedStocks';

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

  static async apiSave(destroyedStock) {
    return await api().post('/destroyedStock', destroyedStock);
  }

  static async apiRemove(id) {
    return await api().delete(`/destroyedStock/${id}`);
  }

  static async apiUpdate(destroyedStock) {
    return await api().patch('/destroyedStock', destroyedStock);
  }

   async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/destroyedStock?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(destroyedStock) {
    return db.newDb().collection('destroyedStocks').add(destroyedStock);
  }

  static localDbGetById(id) {
    return db.newDb().collection('destroyedStocks').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('destroyedStocks').get();
  }

  static localDbUpdate(destroyedStock) {
    return db
      .newDb()
      .collection('destroyedStocks')
      .doc({ id: destroyedStock.id })
      .set(destroyedStock);
  }

  static localDbUpdateAll(destroyedStocks) {
    return db.newDb().collection('destroyedStocks').set(destroyedStocks);
  }

  static localDbDelete(destroyedStock) {
    return db
      .newDb()
      .collection('destroyedStocks')
      .doc({ id: destroyedStock.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('destroyedStocks').delete();
  }

  static async syncDestroyedStock(destroyedStock) {
    if (destroyedStock.syncStatus === 'R') await this.apiSave(destroyedStock);
    if (destroyedStock.syncStatus === 'U') await this.apiUpdate(destroyedStock);
  }
}
