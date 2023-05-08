import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PregnancyScreening extends Model {
  static entity = 'pregnancyScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      pregnant: this.attr(''),
      menstruationLastTwoMonths: this.attr(''),
      lastMenstruation: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/pregnancyScreening?offset=' + offset + '&max=' + max
    );
  }

  static async apiGetAllByPatientVisitId(patientVisitId, offset, max) {
    return await this.api().get(
      '/pregnancyScreening/patientVisit/' +
        patientVisitId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static localDbAdd(pregnancyScreening) {
    return db.newDb().collection('pregnancyScreenings').add(pregnancyScreening);
  }

  static localDbGetById(id) {
    return db.newDb().collection('pregnancyScreenings').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('pregnancyScreenings').get();
  }

  static localDbUpdate(pregnancyScreening) {
    return db
      .newDb()
      .collection('pregnancyScreenings')
      .doc({ id: pregnancyScreening.id })
      .set(pregnancyScreening);
  }

  static localDbUpdateAll(pregnancyScreenings) {
    return db
      .newDb()
      .collection('pregnancyScreenings')
      .set(pregnancyScreenings);
  }

  static localDbDelete(pregnancyScreening) {
    return db
      .newDb()
      .collection('pregnancyScreenings')
      .doc({ id: pregnancyScreening.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('pregnancyScreenings').delete();
  }
}
