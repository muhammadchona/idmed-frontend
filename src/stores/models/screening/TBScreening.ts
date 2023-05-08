import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class TBScreening extends Model {
  static entity = 'TBScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      parentTBTreatment: this.attr(''),
      cough: this.attr(''),
      fever: this.attr(''),
      losingWeight: this.attr(''),
      treatmentTB: this.attr(''),
      treatmentTPI: this.attr(''),
      // referedToUSTB: this.attr(''),
      startTreatmentDate: this.attr(''),
      fatigueOrTirednessLastTwoWeeks: this.attr(''),
      sweating: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/TBScreening?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(TBScreening) {
    return db.newDb().collection('TBScreenings').add(TBScreening);
  }

  static localDbGetById(id) {
    return db.newDb().collection('TBScreenings').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('TBScreenings').get();
  }

  static localDbUpdate(TBScreening) {
    return db
      .newDb()
      .collection('TBScreenings')
      .doc({ id: TBScreening.id })
      .set(TBScreening);
  }

  static localDbUpdateAll(TBScreenings) {
    return db.newDb().collection('TBScreenings').set(TBScreenings);
  }

  static localDbDelete(TBScreening) {
    return db
      .newDb()
      .collection('TBScreenings')
      .doc({ id: TBScreening.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('TBScreenings').delete();
  }
}
