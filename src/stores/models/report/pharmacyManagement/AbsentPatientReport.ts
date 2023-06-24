

export default class AbsentPatientReport {
  static entity = 'absentPatientReports';
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
      cellphone: this.attr(''),
      // dateBackUs: this.attr(''),
      dateMissedPickUp: this.attr(''),
      dateIdentifiedAbandonment: this.attr(''),
      returnedPickUp: this.attr(''),
    };
  }

  static localDbAdd(absentPatientReport) {
    return db
      .newDb()
      .collection('absentPatientReports')
      .add(absentPatientReport);
  }

  static localDbGetAll() {
    //
    return db.newDb().collection('absentPatientReports').get();
  }

  static localDbUpdateAll(absentPatientReports) {
    return db
      .newDb()
      .collection('absentPatientReports')
      .set(absentPatientReports);
  }

  static localDbDeleteAll() {
    return db.newDb().collection('absentPatientReports').delete();
  }

  static localDbDeleteById(id) {
    return db
      .newDb()
      .collection('absentPatientReports')
      .doc({ id: id })
      .delete();
  }
}
