import { Model } from 'pinia-orm';
import PatientVisit from '../patientVisit/PatientVisit';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class RAMScreening extends Model {
  static entity = 'RAMScreenings';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      adverseReaction: this.attr(''),
      adverseReactionMedicine: this.attr(''),
      //  referedToUSRam: this.attr(''),
      patient_visit_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      visit: this.belongsTo(PatientVisit, 'patient_visit_id'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/RAMScreening?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(RAMScreening) {
    return db.newDb().collection('RAMScreenings').add(RAMScreening);
  }

  static localDbGetById(id) {
    return db.newDb().collection('RAMScreenings').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('RAMScreenings').get();
  }

  static localDbUpdate(RAMScreening) {
    return db
      .newDb()
      .collection('RAMScreenings')
      .doc({ id: RAMScreening.id })
      .set(RAMScreening);
  }

  static localDbUpdateAll(RAMScreenings) {
    return db.newDb().collection('RAMScreenings').set(RAMScreenings);
  }

  static localDbDelete(RAMScreening) {
    return db
      .newDb()
      .collection('RAMScreenings')
      .doc({ id: RAMScreening.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('RAMScreenings').delete();
  }
}
