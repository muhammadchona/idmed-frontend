import { Model } from 'pinia-orm';
import Episode from '../episode/Episode';
import Pack from '../packaging/Pack';
import Prescription from '../prescription/Prescription';
import PatientVisit from '../patientVisit/PatientVisit';
import Clinic from '../clinic/Clinic';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PatientVisitDetails extends Model {
  static entity = 'patientVisitDetails';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      patient_visit_id: this.attr(''),
      episode_id: this.attr(''),
      clinic_id: this.attr(''),
      createPackLater: this.boolean(false),
      prescription_id: this.attr(''),
      pack_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      pack: this.belongsTo(Pack, 'pack_id'),
      episode: this.belongsTo(Episode, 'episode_id'),
      patientVisit: this.belongsTo(PatientVisit, 'patient_visit_id'),
      prescription: this.belongsTo(Prescription, 'prescription_id'),
    };
  }

  lastPack() {
    return this.pack;
  }

  static async apiFetchById(id) {
    return await this.api().get(`/patientVisitDetails/${id}`);
  }

  static async apiSave(patientVisitDetail) {
    return await this.api().post('/patientVisitDetails', patientVisitDetail);
  }

  static async apiDelete(patientVisitDetail) {
    return await this.api().delete(
      `/patientVisitDetails/${patientVisitDetail.id}`
    );
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/patientVisitDetails/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static async apiGetAllLastOfClinic(clinicId, offset, max) {
    return await this.api().get(
      '/patientVisitDetails/AllLastOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static async apiGetAllByEpisodeId(episodeId, offset, max) {
    return await this.api().get(
      '/patientVisitDetails/episode/' +
        episodeId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static async apiGetLastByEpisodeId(episodeId) {
    return await this.api().get(
      '/patientVisitDetails/getLastByEpisodeId/' + episodeId
    );
  }

  static async apiGetAllofPrecription(prescriptionId) {
    return await this.api().get(
      '/patientVisitDetails/getAllofPrecription/' + prescriptionId
    );
  }

  static localDbAdd(patientVisitDetail) {
    return db.newDb().collection('patientVisitDetails').add(patientVisitDetail);
  }

  static localDbGetById(id) {
    return db.newDb().collection('patientVisitDetails').doc({ id: id }).get();
  }

  static async localDbGetAll() {
    return await db.newDb().collection('patientVisitDetails').get();
  }

  static localDbUpdate(patientVisitDetail) {
    return db
      .newDb()
      .collection('patientVisitDetails')
      .doc({ id: patientVisitDetail.id })
      .set(patientVisitDetail);
  }

  static localDbUpdateAll(patientVisitDetails) {
    return db
      .newDb()
      .collection('patientVisitDetails')
      .set(patientVisitDetails);
  }

  static localDbDelete(patientVisitDetail) {
    return db
      .newDb()
      .collection('patientVisitDetails')
      .doc({ id: patientVisitDetail.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patientVisitDetails').delete();
  }

  static localDbDeleteById(patientVisitDetailsId) {
    return db
      .newDb()
      .collection('patientVisitDetails')
      .doc({ id: patientVisitDetailsId })
      .delete();
  }
}
