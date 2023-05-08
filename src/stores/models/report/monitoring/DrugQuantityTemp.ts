// import { Model } from 'pinia-orm'
import db from 'src/stores/localbase';
import ArvDailyRegisterTempReport from './ArvDailyRegisterTempReport';

export default class DrugQuantityTemp {
  static entity = 'drugQuantityTemps';
  static fields() {
    return {
      id: this.attr(null),
      drugName: this.attr(null),
      quantity: this.attr(null),
      arvDailyRegisterReport: this.belongsTo(
        ArvDailyRegisterTempReport,
        'arv_daily_register_report_id'
      ),
    };
  }

  static localDbAdd(drugQuantityTemp) {
    return db.newDb().collection('drugQuantityTemps').add(drugQuantityTemp);
  }

  static localDbGetAll() {
    //
    return db.newDb().collection('drugQuantityTemps').get();
  }

  static localDbUpdateAll(drugQuantityTemp) {
    return db.newDb().collection('drugQuantityTemps').set(drugQuantityTemp);
  }

  static localDbDeleteAll() {
    return db.newDb().collection('drugQuantityTemps').delete();
  }

  static localDbDeleteById(id) {
    return db.newDb().collection('drugQuantityTemps').doc({ id: id }).delete();
  }
}
