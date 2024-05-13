import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Clinic from '../clinic/Clinic';
import { v4 as uuidv4 } from 'uuid';
import StockDistributor from '../stockDistributor/StockDistributor';

export default class StockDistributorBatch extends Model {
  static entity = 'stockDistributorBatchs';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      quantity: this.number(0),
      stock_distributor_id: this.attr(null),
      stock_id: this.attr(null),
      drug_id: this.attr(null),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      stockDistributor: this.belongsTo(
        StockDistributor,
        'stock_distributor_id'
      ),
      drug: this.belongsTo(Drug, 'drug_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
