// import { Model } from 'pinia-orm'
import db from 'src/stores/localbase';

export default class patientHistoryReport {
  static entity = 'patientHistorys';
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

      // fields
      nid: this.attr(''),
      firstNames: this.attr(''),
      middleNames: this.attr(''),
      lastNames: this.attr(''),
      cellphone: this.attr(''),
      tipoTarv: this.attr(''),
      pickUpDate: this.attr(''),
      nexPickUpDate: this.attr(''),
      startReason: this.attr(''),
      therapeuticalRegimen: this.attr(''),
      dispenseType: this.attr(''),
      age: this.attr(''),
      dispenseMode: this.attr(''),
      clinicalService: this.attr(''),
      clinic: this.attr(''),
      patientType: this.attr(''),
    };
  }

  static localDbAdd(patientHistory) {
    return db.newDb().collection('patientHistoryReports').add(patientHistory);
  }

  static localDbGetByReportId(reportId) {
    //
    // return db.newDb().collection('patientHistoryReports').doc({ reportId: 'report2d11bfc0-d0fa-489b-a2b9-9a1819d55a3e' }).get()
    // return db.newDb().collection('patientHistoryReports').doc('11ed4fb992788770b2271f3fbce2746d').get()
    return db.newDb().collection('patientHistoryReports').get();
  }

  static localDbUpdateAll(districts) {
    return db.newDb().collection('patientHistoryReports').set(districts);
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patientHistoryReports').delete();
  }

  static localDbDeleteById(id) {
    return db
      .newDb()
      .collection('patientHistoryReports')
      .doc({ id: id })
      .delete();
  }
}
