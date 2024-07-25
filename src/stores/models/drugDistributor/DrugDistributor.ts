import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Clinic from '../clinic/Clinic';
import { v4 as uuidv4 } from 'uuid';
import StockDistributor from '../stockDistributor/StockDistributor';
import StockDistributorBatch from '../stockDistributorBatch/StockDistributorBatch';

export default class DrugDistributor extends Model {
  static entity = 'drugDistributors';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      quantity: this.number(0),
      stock_distributor_id: this.attr(null),
      drug_id: this.attr(null),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      enabled: this.boolean(false),
      status: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      stockDistributor: this.belongsTo(
        StockDistributor,
        'stock_distributor_id'
      ),
      stockDistributorBatchs: this.hasMany(
        StockDistributorBatch,
        'drug_distributor_id'
      ),
      drug: this.belongsTo(Drug, 'drug_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };

  static getClassName() {
    return 'drugDistributor';
  }
}
