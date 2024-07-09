import { Model } from 'pinia-orm';
import Stock from '../stock/Stock';
import { v4 as uuidv4 } from 'uuid';
import DrugDistributor from '../drugDistributor/DrugDistributor';
import StockDistributor from '../stockDistributor/StockDistributor';

export default class StockDistributorBatch extends Model {
  static entity = 'stockDistributorBatchs';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      quantity: this.number(0),
      drug_distributor_id: this.attr(null),
      stock_distributor_id: this.attr(null),
      stock_id: this.attr(null),
      syncStatus: this.attr(''),
      // relationships
      stock: this.belongsTo(Stock, 'stock_id'),
      drugDistributor: this.belongsTo(DrugDistributor, 'drug_distributor_id'),
      stockDistributor: this.belongsTo(
        StockDistributor,
        'stock_distributor_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
