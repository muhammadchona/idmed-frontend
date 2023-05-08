// import { Model } from 'pinia-orm'
import db from 'src/stores/localbase';
// import DrugQuantityTemp from './DrugQuantityTemp'

export default class ArvDailyRegisterTempReport {
  static entity = 'arvDailyRegisterTempReports';
  static fields() {
    return {
      id: this.attr(null),
      reportId: this.attr(''),
      periodType: this.attr(''),
      period: this.attr(''),
      year: this.attr(''),
      startDate: this.attr(''),
      endDate: this.attr(''),
      province: this.attr(''),
      district: this.attr(''),
      clinic: this.attr(''),

      // fields
      orderNumber: this.attr(''),
      nid: this.attr(''),
      patientName: this.attr(''),
      patientType: this.attr(''),
      ageGroup_0_4: this.attr(''),
      ageGroup_5_9: this.attr(''),
      ageGroup_10_14: this.attr(''),
      ageGroup_Greater_than_15: this.attr(''),
      arvType: this.attr(''),
      dispensationType: this.attr(''),
      therapeuticLine: this.attr(''),
      pickupDate: this.attr(''),
      nextPickUpDate: this.attr(''),
      regime: this.attr(''),
      packId: this.attr(''),
      startReason: this.attr(''),
      prep: this.attr(''),
      ppe: this.attr(''),
      drugQuantityTemps: this.attr(''),
    };
  }

  static localDbAdd(arvDailyRegister) {
    return db
      .newDb()
      .collection('arvDailyRegisterTempReports')
      .add(arvDailyRegister);
  }

  static localDbGetAll() {
    //
    return db.newDb().collection('arvDailyRegisterTempReports').get();
  }

  static localDbUpdateAll(arvDailyRegister) {
    return db
      .newDb()
      .collection('arvDailyRegisterTempReports')
      .set(arvDailyRegister);
  }

  static localDbDeleteAll() {
    return db.newDb().collection('arvDailyRegisterTempReports').delete();
  }

  static localDbDeleteById(id) {
    return db
      .newDb()
      .collection('arvDailyRegisterTempReports')
      .doc({ id: id })
      .delete();
  }
}
