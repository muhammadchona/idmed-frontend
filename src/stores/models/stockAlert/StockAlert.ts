import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';

export default class StockAlert extends Model {
  static entity = 'stockAlerts';

  static fields() {
    return {
      id: this.attr(null),
      drug: this.attr(''),
      balance: this.attr(''),
      avgConsuption: this.attr(''),
      state: this.attr(''),
    };
  }

  static async apiGetAlertStockMobile(clinicId, serviceCode) {
    return this.api().get(
      `/dashBoard/getStockAlert/${clinicId}/${serviceCode}`
    );
  }

  static localDbAdd(stockAlert) {
    return db.newDb().collection('stockAlert').add(stockAlert);
  }
}
