import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class VitalSignsScreening extends Model {
  static entity = 'vitalSignsScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      distort: this.attr(''),
      imc: this.attr(''),
      weight: this.attr(''),
      systole: this.attr(''),
      height: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/vitalSignsScreening?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(vitalSignsScreening) {
    return db
      .newDb()
      .collection('vitalSignsScreenings')
      .add(vitalSignsScreening);
  }

  static localDbGetById(id) {
    return db.newDb().collection('vitalSignsScreenings').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('vitalSignsScreenings').get();
  }

  static localDbUpdate(vitalSignsScreening) {
    return db
      .newDb()
      .collection('vitalSignsScreenings')
      .doc({ id: vitalSignsScreening.id })
      .set(vitalSignsScreening);
  }

  static localDbUpdateAll(vitalSignsScreenings) {
    return db
      .newDb()
      .collection('vitalSignsScreenings')
      .set(vitalSignsScreenings);
  }

  static localDbDelete(vitalSignsScreening) {
    return db
      .newDb()
      .collection('vitalSignsScreenings')
      .doc({ id: vitalSignsScreening.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('vitalSignsScreenings').delete();
  }
}
