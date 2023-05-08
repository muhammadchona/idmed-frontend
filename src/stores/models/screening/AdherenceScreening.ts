import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class AdherenceScreening extends Model {
  static entity = 'adherenceScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      hasPatientCameCorrectDate: this.attr(''),
      daysWithoutMedicine: this.attr(''),
      patientForgotMedicine: this.attr(''),
      lateDays: this.attr(''),
      lateMotives: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/adherenceScreening?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(adherenceScreening) {
    return db.newDb().collection('adherenceScreenings').add(adherenceScreening);
  }

  static localDbGetById(id) {
    return db.newDb().collection('adherenceScreenings').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('adherenceScreenings').get();
  }

  static localDbUpdate(adherenceScreening) {
    return db
      .newDb()
      .collection('adherenceScreenings')
      .doc({ id: adherenceScreening.id })
      .set(adherenceScreening);
  }

  static localDbUpdateAll(adherenceScreenings) {
    return db
      .newDb()
      .collection('adherenceScreenings')
      .set(adherenceScreenings);
  }

  static localDbDelete(adherenceScreening) {
    return db
      .newDb()
      .collection('adherenceScreenings')
      .doc({ id: adherenceScreening.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('adherenceScreenings').delete();
  }
}
