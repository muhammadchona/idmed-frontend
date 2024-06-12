import { Model } from 'pinia-orm';
import { Clinic } from '../clinic/ClinicHierarchy';
import Stock from '../stock/Stock';
import { v4 as uuidv4 } from 'uuid';

export default class StockEntrance extends Model {
  static entity = 'stockEntrances';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      orderNumber: this.attr(''),
      dateReceived: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      notes: this.attr(''),
      creationDate: this.attr(''),
      isDistribution: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      stocks: this.hasMany(Stock, 'entrance_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };

  static getClassName() {
    return 'stockEntrance';
  }
}
