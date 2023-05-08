import { Model } from 'pinia-orm';
import Appointment from '../appointment/Appointment';
import GroupMember from '../groupMember/GroupMember';
import PatientAttribute from '../patientAttribute/PatientAttribute';
import PatientServiceIdentifier from '../patientServiceIdentifier/PatientServiceIdentifier';
import Province from '../province/Province';
import District from '../district/District';
import Clinic from '../clinic/Clinic';
import PostoAdministrativo from '../PostoAdministrativo/PostoAdministrativo';
import Localidade from '../Localidade/Localidade';
import PatientVisit from '../patientVisit/PatientVisit';
import HealthInformationSystem from '../healthInformationSystem/HealthInformationSystem';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export default class Patient extends Model {
  static entity = 'patients';

  get fullName() {
    return `${this.firstNames} ${this.middleNames} ${this.lastNames}`;
  }

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      firstNames: this.attr(''),
      middleNames: this.attr(''),
      lastNames: this.attr(''),
      gender: this.attr(''),
      dateOfBirth: this.attr(''),
      cellphone: this.attr(''),
      alternativeCellphone: this.attr(''),
      address: this.attr(''),
      addressReference: this.attr(''),
      accountstatus: this.boolean(true),
      hisLocation: this.attr(''),
      hisLocationName: this.attr(''),
      hisUuid: this.attr(''),
      his_id: this.attr(''),
      province_id: this.attr(''),
      district_id: this.attr(''),
      postoAdministrativo_id: this.attr(''),
      bairro_id: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationships
      province: this.belongsTo(Province, 'province_id'),
      attributes: this.hasMany(PatientAttribute, 'patient_id'),
      identifiers: this.hasMany(PatientServiceIdentifier, 'patient_id'),
      appointments: this.hasMany(Appointment, 'patient_id'),
      members: this.hasMany(GroupMember, 'patient_id'),
      district: this.belongsTo(District, 'district_id'),
      postoAdministrativo: this.belongsTo(
        PostoAdministrativo,
        'postoAdministrativo_id'
      ),
      bairro: this.belongsTo(Localidade, 'bairro_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      his: this.belongsTo(HealthInformationSystem, 'his_id'),
      patientVisits: this.hasMany(PatientVisit, 'patient_id'),
    };
  }

  isActiveOnGroupOfService(service) {
    if (this.members.length <= 0) return false;
    const isActive = this.members.some((member) => {
      return (
        member.endDate === null && member.group.service.code === service.code
      );
    });
    return isActive;
  }

  bairroName() {
    if (this.bairro === null) return '';
    return this.bairro.description;
  }

  postoAdministrativoName() {
    if (this.postoAdministrativo === null) return '';
    return this.postoAdministrativo.description;
  }

  hasIdentifiers() {
    return this.identifiers.length > 0;
  }

  isMale() {
    return this.gender === 'Masculino';
  }

  getOldestIdentifier() {
    if (!this.hasIdentifiers()) return null;
    let preferedId = '';
    Object.keys(this.identifiers).forEach(
      function (k) {
        const id = this.identifiers[k];
        if (preferedId === '') {
          preferedId = id;
        } else if (new Date(preferedId.startDate) > new Date(id.startDate)) {
          preferedId = id;
        }
      }.bind(this)
    );
    return preferedId;
  }

  hasEpisodes() {
    if (this.identifiers.length <= 0) return false;
    const hasEpisodes = this.identifiers.some((identifier) => {
      return identifier.episodes.length > 0;
    });
    return hasEpisodes;
  }

  preferedIdentifier() {
    if (this.identifiers.length <= 0) return null;
    let preferedId = null;
    Object.keys(this.identifiers).forEach(
      function (k) {
        const id = this.identifiers[k];
        if (id.prefered) {
          preferedId = id;
        }
      }.bind(this)
    );
    return preferedId;
  }

  hasPreferedId() {
    return this.preferedIdentifier() !== null;
  }

  preferedIdentifierValue() {
    if (this.identifiers.length <= 0) return 'Sem identificador';
    let preferedId = {};
    Object.keys(this.identifiers).forEach(
      function (k) {
        const id = this.identifiers[k];
        if (id.prefered) {
          preferedId = id;
        }
      }.bind(this)
    );
    return preferedId.value;
  }

  hasOneAndClosedIdentifier() {
    if (this.identifiers.length > 1 && this.hasEpisodes) return false;
    return (
      this.identifiers.length === 1 && this.identifiers[0].endDate !== null
    );
  }

  age() {
    return moment().diff(moment(this.dateOfBirth, 'YYYY-MM-DD'), 'years');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/patient/${id}`);
  }

  static async apiSearch(patient) {
    return await this.api().post('/patient/search', patient);
  }

  static async apisearchByParam(searchParam, clinicId) {
    return await this.api().get(
      `/patient/searchByParam/${searchParam}/${clinicId}`
    );
  }

  static async apiSave(patient, isNew) {
    if (isNew) {
      return await this.api().post('/patient', patient);
    } else {
      return await this.api().patch('/patient/' + patient.id, patient);
    }
  }

  static async apiUpdate(patient) {
    return await this.api().patch('/patient/' + patient.id, patient);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/patient/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static localDbAdd(patient) {
    return db.newDb().collection('patients').add(patient);
  }

  static localDbGetById(id) {
    return db.newDb().collection('patients').doc({ id: id }).get();
  }

  static async localDbGetAll() {
    return await db.newDb().collection('patients').get();
  }

  static localDbUpdate(patient) {
    return db
      .newDb()
      .collection('patients')
      .doc({ id: patient.id })
      .set(patient);
  }

  static localDbUpdateAll(patients) {
    return db.newDb().collection('patients').set(patients);
  }

  static localDbDelete(patientId) {
    return db.newDb().collection('patients').doc({ id: patientId }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('patients').delete();
  }

  static async syncPatient(patient) {
    if (patient.syncStatus === 'R') await this.apiSave(patient);
    if (patient.syncStatus === 'U') await this.apiUpdate(patient);
  }

  static getClassName() {
    return 'patient';
  }
}
