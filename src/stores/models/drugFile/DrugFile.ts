import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';

export default class DrugFile extends Model {
  static entity = 'drugFiles';

  static fields() {
    return {
      id: this.attr(null),
      drugId: this.attr(null),
      drug: this.attr(''),
      drugFileSummary: this.attr(''),
      drugFileSummaryBatch: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetDrugFileMobile(clinicId) {
    return await this.api().get(`/drugStockFile/drugfilemobile/${clinicId}`);
  }

  static localDbAdd(drugFile) {
    return db.newDb().collection('drugFile').add(drugFile);
  }

  static localDbUpdate(drugFile) {
    return db
      .newDb()
      .collection('drugFile')
      .doc({ id: drugFile.id })
      .set(drugFile);
  }
}
