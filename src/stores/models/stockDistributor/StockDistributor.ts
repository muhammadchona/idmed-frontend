import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import StockDistributorBatch from '../stockDistributorBatch/StockDistributorBatch';
import { v4 as uuidv4 } from 'uuid';

export default class StockDistributor extends Model {
  static entity = 'stockDistributors';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      orderNumber: this.attr(''),
      creation_date: this.attr(''),
      syncStatus: this.attr(''),
      notes: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      stockDistributorBatchs: this.hasMany(
        StockDistributorBatch,
        'stockDistributor_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };

  static getClassName() {
    return 'stockDistributor';
  }
}
