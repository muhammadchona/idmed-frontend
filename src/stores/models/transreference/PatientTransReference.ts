import { Model } from 'pinia-orm';
import PatientTransReferenceType from './PatientTransReferenceType';
import Clinic from '../clinic/Clinic';
import Patient from '../patient/Patient';
import PatientServiceIdentifier from '../patientServiceIdentifier/PatientServiceIdentifier';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PatientTransReference extends Model {
  static entity = 'patientTransReferences';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      operationDate: this.attr(''),
      creationDate: this.attr(''),
      patientTransReferenceTypeId: this.attr(''),
      originId: this.attr(''),
      destination: this.attr(''),
      identifierId: this.attr(''),
      patientId: this.attr(''),
      matchId: this.attr(''),
      syncStatus: this.attr(''),

      // Relationshiops
      operationType: this.belongsTo(
        PatientTransReferenceType,
        'patientTransReferenceTypeId'
      ),
      origin: this.belongsTo(Clinic, 'originId'),
      identifier: this.belongsTo(PatientServiceIdentifier, 'identifierId'),
      patient: this.belongsTo(Patient, 'patientId'),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get(
      '/patientTransReference?offset=' + offset + '&max=' + max
    );
  }

  static async apiSave(transReference) {
    return await this.api().post('/patientTransReference', transReference);
  }

  static async apiRemove(transReference) {
    return await this.api().delete(
      `/patientTransReference/${transReference.id}`
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/patientTransReference/${id}`);
  }

  static localDbAdd(patientTransReference) {
    return db
      .newDb()
      .collection('patientTransReferences')
      .add(patientTransReference);
  }

  static localDbGetById(id) {
    return db
      .newDb()
      .collection('patientTransReferences')
      .doc({ id: id })
      .get();
  }

  static localDbGetAll() {
    return db.newDb().collection('patientTransReferences').get();
  }

  static localDbUpdate(patientTransReference) {
    return db
      .newDb()
      .collection('patientTransReferences')
      .doc({ id: patientTransReference.id })
      .set(patientTransReference);
  }

  static localDbUpdateAll(patientTransReferences) {
    return db
      .newDb()
      .collection('patientTransReferences')
      .set(patientTransReferences);
  }

  static localDbDelete(patientTransReference) {
    return db
      .newDb()
      .collection('patientTransReferences')
      .doc({ id: patientTransReference.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patientTransReferences').delete();
  }
}
