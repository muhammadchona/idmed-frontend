import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Pack from '../packaging/Pack';
import PackagedDrugStock from './PackagedDrugStock';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PackagedDrug extends Model {
  static entity = 'packagedDrugs';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      quantitySupplied: this.attr(''),
      nextPickUpDate: this.attr(''),
      toContinue: this.boolean(false),
      creationDate: this.attr(''),
      pack_id: this.attr(''),
      drug_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      pack: this.belongsTo(Pack, 'pack_id'),
      drug: this.belongsTo(Drug, 'drug_id'),
      packagedDrugStocks: this.hasMany(
        PackagedDrugStock,
        'packagedDrugStock_id'
      ),
    };
  }

  static async apiGetAllByPackId(packId) {
    return await this.api().get('/packagedDrug/pack/' + packId);
  }

  static async apiGetAll() {
    return await this.api().get('/packagedDrug?offset=' + 0 + '&max=' + 200);
  }

  static localDbAdd(packagedDrug) {
    return db.newDb().collection('packagedDrugs').add(packagedDrug);
  }

  static localDbGetById(id) {
    return db.newDb().collection('packagedDrugs').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('packagedDrugs').get();
  }

  static localDbUpdate(packagedDrug) {
    return db
      .newDb()
      .collection('packagedDrugs')
      .doc({ id: packagedDrug.id })
      .set(packagedDrug);
  }

  static localDbUpdateAll(packagedDrugs) {
    return db.newDb().collection('packagedDrugs').set(packagedDrugs);
  }

  static localDbDelete(packagedDrug) {
    return db
      .newDb()
      .collection('packagedDrugs')
      .doc({ id: packagedDrug.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('packagedDrugs').delete();
  }
}
