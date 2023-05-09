import { Model } from 'pinia-orm';
import PatientTransReference from './PatientTransReference';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PatientTransReferenceType extends Model {
  static entity = 'patientTransReferenceTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      patientTransReferences: this.hasMany(
        PatientTransReference,
        'patientTransReferenceTypeId'
      ),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/patientTransReferenceType?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(patientTransReferenceType) {
    return db
      .newDb()
      .collection('patientTransReferenceTypes')
      .add(patientTransReferenceType);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('patientTransReferenceTypes')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('patientTransReferenceTypes').get();
  }

  static localDbUpdate(patientTransReferenceType) {
    return db
      .newDb()
      .collection('patientTransReferenceTypes')
      .doc({ id: patientTransReferenceType.id })
      .set(patientTransReferenceType);
  }

  static localDbUpdateAll(patientTransReferenceTypes) {
    return db
      .newDb()
      .collection('patientTransReferenceTypes')
      .set(patientTransReferenceTypes);
  }

  static localDbDelete(patientTransReferenceType) {
    return db
      .newDb()
      .collection('patientTransReferenceTypes')
      .doc({ id: patientTransReferenceType.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patientTransReferenceTypes').delete();
  }
}
