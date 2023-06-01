import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import Stock from '../stock/Stock';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class StockEntrance extends Model {
  static entity = 'stockEntrances';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      orderNumber: this.attr(''),
      dateReceived: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      stocks: this.hasMany(Stock, 'entrance_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  }
     
  static async syncStockEntrance(stockEntrance) {
    if (stockEntrance.syncStatus === 'R') await this.apiSave(stockEntrance);
    if (stockEntrance.syncStatus === 'U') await this.apiUpdate(stockEntrance);
  }

  static getClassName() {
    return 'stockEntrance';
  }
}
