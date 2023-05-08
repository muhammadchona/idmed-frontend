import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import db from 'src/stores/localbase';

export default class StockCenter extends Model {
  static entity = 'stockCenters';

  static fields() {
    return {
      id: this.attr(null),
      name: this.attr(''),
      prefered: this.boolean(false),
      code: this.attr(''),
      syncStatus: this.attr(''),
      clinic_id: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/stockCenter?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(stockCenter) {
    return db.newDb().collection('stockCenters').add(stockCenter);
  }

  static localDbGetById(id) {
    return db.newDb().collection('stockCenters').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('stockCenters').get();
  }

  static localDbUpdate(stockCenter) {
    return db
      .newDb()
      .collection('stockCenters')
      .doc({ id: stockCenter.id })
      .set(stockCenter);
  }

  static localDbUpdateAll(stockCenters) {
    return db.newDb().collection('stockCenters').set(stockCenters);
  }

  static localDbDelete(stockCenter) {
    return db
      .newDb()
      .collection('stockCenters')
      .doc({ id: stockCenter.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('stockCenters').delete();
  }
}
