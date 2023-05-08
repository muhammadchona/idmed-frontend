import { Model } from 'pinia-orm';
import Episode from '../episode/Episode';
import IdentifierType from '../identifierType/IdentifierType';
import Patient from '../patient/Patient';
import ClinicalService from '../ClinicalService/ClinicalService';
import Clinic from '../clinic/Clinic';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class PatientServiceIdentifier extends Model {
  static entity = 'identifiers';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      startDate: this.attr(''),
      endDate: this.attr(''),
      reopenDate: this.attr(''),
      value: this.attr(''),
      state: this.attr(''),
      prefered: this.boolean(true),
      identifier_type_id: this.attr(''),
      service_id: this.attr(''),
      patient_id: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      identifierType: this.belongsTo(IdentifierType, 'identifier_type_id'),
      service: this.belongsTo(ClinicalService, 'service_id'),
      patient: this.belongsTo(Patient, 'patient_id'),
      episodes: this.hasMany(Episode, 'patientServiceIdentifier_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
    };
  }

  isPrefered() {
    return this.prefered;
  }

  lastStartEpisodeWithPrescription() {
    let lastVisit = null;
    this.patientVisitDetails.forEach((visit) => {
      if (lastVisit === null) {
        lastVisit = visit;
      } else if (visit.pack.pickupDate > lastVisit.pack.pickupDate) {
        lastVisit = visit;
      }
    });
    return lastVisit.pack;
  }

  lastVisitPrescription() {
    let lastVisit = null;
    this.episodes.forEach((episode) => {
      episode.patientVisitDetails.forEach((pvd) => {
        if (lastVisit === null) {
          lastVisit = pvd;
        } else if (pvd.pack.pickupDate > lastVisit.pack.pickupDate) {
          lastVisit = pvd;
        }
      });
    });
    return lastVisit;
  }

  lastEpisode() {
    let lastVisit = null;
    this.episodes.forEach((visit) => {
      if (lastVisit === null) {
        lastVisit = visit;
      } else if (visit.episodeDate > lastVisit.episodeDate) {
        lastVisit = visit;
      }
    });
    return lastVisit;
  }

  checkClinicalServiceAttr(attr) {
    if (this.service === '' || this.service === null) return false;
    const has = this.service.attributes.some((attribute) => {
      return attribute.clinicalServiceAttributeType.code === attr;
    });
    return has;
  }

  hasTherapeuticalRegimen() {
    return this.checkClinicalServiceAttr('THERAPEUTICAL_REGIMEN');
  }

  hasTherapeuticalLine() {
    return this.checkClinicalServiceAttr('THERAPEUTICAL_LINE');
  }

  hasPatientType() {
    return this.checkClinicalServiceAttr('PATIENT_TYPE');
  }

  hasPrescriptionChangeMotive() {
    return this.checkClinicalServiceAttr('PRESCRIPTION_CHANGE_MOTIVE');
  }

  hasEpisodes() {
    return this.episodes.length > 0;
  }

  canBeEdited() {
    if (!this.hasEpisodes()) return true;
    let canEdit = true;
    Object.keys(this.episodes).forEach(
      function (k) {
        const eps = this.episodes[k];
        if (canEdit) {
          if (eps.hasVisits()) {
            canEdit = false;
          }
        }
      }.bind(this)
    );
    return canEdit;
  }

  static async apiSave(identifier, isNew) {
    if (isNew) {
      return await this.api().post('/patientServiceIdentifier', identifier);
    } else {
      return await this.api().patch(
        '/patientServiceIdentifier/' + identifier.id,
        identifier
      );
    }
  }

  static async apiUpdate(identifier) {
    return await this.api().patch(
      '/patientServiceIdentifier/' + identifier.id,
      identifier
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/patientServiceIdentifier/${id}`);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/patientServiceIdentifier/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static async apiGetAllByPatientId(patientId, offset, max) {
    return await this.api().get(
      '/patientServiceIdentifier/patient/' +
        patientId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static localDbAdd(identifier) {
    return db.newDb().collection('identifiers').add(identifier);
  }

  static async localDbGetById(id) {
    const identifier = await db
      .newDb()
      .collection('identifiers')
      .doc({ id: id })
      .get();
    return identifier;
  }

  static async localDbGetAll() {
    return await db.newDb().collection('identifiers').get();
  }

  static localDbUpdate(identifier) {
    return db
      .newDb()
      .collection('identifiers')
      .doc({ id: identifier.id })
      .set(identifier);
  }

  static localDbUpdateAll(identifiers) {
    return db.newDb().collection('identifiers').set(identifiers);
  }

  static localDbDelete(identifierId) {
    return db
      .newDb()
      .collection('identifiers')
      .doc({ id: identifierId })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('identifiers').delete();
  }

  static async syncPatientServiceIdentifier(identifier) {
    if (identifier.syncStatus === 'R') await this.apiSave(identifier);
    if (identifier.syncStatus === 'U') await this.apiUpdate(identifier);
  }

  static getClassName() {
    return 'patientServiceIdentifier';
  }
}
