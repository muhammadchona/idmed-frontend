import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Stock from '../stock/Stock';
import PackagedDrug from './PackagedDrug';
import db from 'src/stores/localbase';
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

  static async apiGetAllByPackId(packId) {
    return await this.api().get('/packagedDrug/pack/' + packId);
  }

  static async apiGetAll() {
    return await this.api().get(
      '/packagedDrugStock?offset=' + 0 + '&max=' + 200
    );
  }

  static localDbAdd(packagedDrugStock) {
    return db.newDb().collection('packagedDrugStocks').add(packagedDrugStock);
  }

  static localDbGetById(id) {
    return db.newDb().collection('packagedDrugStocks').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('packagedDrugStocks').get();
  }

  static localDbUpdate(packagedDrugStock) {
    return db
      .newDb()
      .collection('packagedDrugStocks')
      .doc({ id: packagedDrugStock.id })
      .set(packagedDrugStock);
  }

  static localDbUpdateAll(packagedDrugStocks) {
    return db.newDb().collection('packagedDrugStocks').set(packagedDrugStocks);
  }

  static localDbDelete(packagedDrugStock) {
    return db
      .newDb()
      .collection('packagedDrugStocks')
      .doc({ id: packagedDrugStock.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('packagedDrugStocks').delete();
  }
}
