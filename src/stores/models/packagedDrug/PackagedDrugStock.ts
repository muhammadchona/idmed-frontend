import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Stock from '../stock/Stock';
import PackagedDrug from './PackagedDrug';
import { v4 as uuidv4 } from 'uuid';

export default class PackagedDrugStock extends Model {
  static entity = 'packagedDrugStocks';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      quantitySupplied: this.attr(''),
      creationDate: this.attr(''),
      packagedDrug_id: this.attr(''),
      drug_id: this.attr(''),
      stock_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      packagedDrug: this.belongsTo(PackagedDrug, 'pack_id'),
      drug: this.belongsTo(Drug, 'drug_id'),
      stock: this.belongsTo(Stock, 'stock_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
