import { Model } from 'pinia-orm';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
import PregnancyScreening from '../screening/PregnancyScreening';
import RAMScreening from '../screening/RAMScreening';
import TBScreening from '../screening/TBScreening';
import AdherenceScreening from '../screening/AdherenceScreening';
import VitalSignsScreening from '../screening/VitalSignsScreening';
import Patient from '../patient/Patient';
import Clinic from '../clinic/Clinic';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PatientVisit extends Model {
  static entity = 'patientVisits';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      visitDate: this.attr(''),
      clinic_id: this.attr(''),
      patient_id: this.attr(''),
      isLast: this.boolean(false),
      syncStatus: this.attr(''),
      // Relationships
      patientVisitDetails: this.hasMany(
        PatientVisitDetails,
        'patient_visit_id'
      ),
      vitalSigns: this.hasMany(VitalSignsScreening, 'patient_visit_id'),
      tbScreening: this.hasMany(TBScreening, 'patient_visit_id'),
      pregnancyScreening: this.hasMany(PregnancyScreening, 'patient_visit_id'),
      adherenceScreening: this.hasMany(AdherenceScreening, 'patient_visit_id'),
      ramScreening: this.hasMany(RAMScreening, 'patient_visit_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      patient: this.belongsTo(Patient, 'patient_id'),
    };
  }

  static async apiFetchById(id) {
    return await this.api().get(`/patientVisit/${id}`);
  }

  static async apiSave(patientVisit, newData) {
    return await this.api().post('/patientVisit', patientVisit);
  }

  static async apiMySave(patientVisit) {
    return await this.api().post('/patientVisit/mySave', patientVisit);
  }

  static async apiSaveRec(patientVisit) {
    return await this.api().post('/patientVisit/saveRecord', patientVisit);
  }

  static async apiUpdate(patientVisit) {
    return await this.api().patch(
      `/patientVisit/${patientVisit.id}`,
      patientVisit
    );
  }

  static async apiRemove(id) {
    return await this.api().delete(`/patientVisit/${id}`);
  }

  static async apiGetAllByPatientId(patientId) {
    return await this.api().get('/patientVisit/patient/' + patientId);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/patientVisit/clinic/' + clinicId + '?offset=0&max=100'
    );
  }

  static async apiGetAllLastWithScreeningOfClinic(clinicId, offset, max) {
    return await this.api().get(
      '/patientVisit/AllLastWithScreeningOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static async apiGetLastVisitOfPatient(patientId) {
    return await this.api().get(
      '/patientVisit/getLastVisitOfPatient/' + patientId
    );
  }

  static localDbAdd(patientVisit) {
    return db.newDb().collection('patientVisits').add(patientVisit);
  }

  static localDbGetById(id) {
    return db.newDb().collection('patientVisits').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('patientVisits').get();
  }

  static localDbUpdate(patientVisit) {
    return db
      .newDb()
      .collection('patientVisits')
      .doc({ id: patientVisit.id })
      .set(patientVisit);
  }

  static localDbUpdateAll(patientVisits) {
    return db.newDb().collection('patientVisits').set(patientVisits);
  }

  static localDbDelete(patientVisit) {
    return db
      .newDb()
      .collection('patientVisits')
      .doc({ id: patientVisit.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patientVisits').delete();
  }

  static getClassName() {
    return 'patientVisit';
  }
}
