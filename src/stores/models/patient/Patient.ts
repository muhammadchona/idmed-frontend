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
import { v4 as uuidv4 } from 'uuid';

export default class Patient extends Model {
  static entity = 'patients';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      firstNames: this.string(''),
      middleNames: this.string(''),
      lastNames: this.string(''),
      gender: this.string(''),
      dateOfBirth: this.attr(''),
      cellphone: this.string(''),
      alternativeCellphone: this.string(''),
      address: this.attr(''),
      addressReference: this.string(''),
      accountstatus: this.boolean(true),
      hisLocation: this.string(''),
      hisLocationName: this.string(''),
      hisUuid: this.string(''),
      his_id: this.string(''),
      province_id: this.string(''),
      district_id: this.string(''),
      postoAdministrativo_id: this.string(''),
      bairro_id: this.string(''),
      clinic_id: this.string(''),
      syncStatus: this.string(''),
      hisSyncStatus:  this.attr(''),
      hisProvider: this.string(''),

      // Relationships
      province: this.belongsTo(Province, 'province_id'),
      attributes: this.hasMany(PatientAttribute, 'patient_id'),
      identifiers: this.hasMany(PatientServiceIdentifier, 'patient_id'),
      appointments: this.hasMany(Appointment, 'patient_id'),
      members: this.hasMany(GroupMember, 'patient_id'),
      patientVisits: this.hasMany(PatientVisit, 'patient_id'),
      district: this.belongsTo(District, 'district_id'),
      postoAdministrativo: this.belongsTo(
        PostoAdministrativo,
        'postoAdministrativo_id'
      ),
      bairro: this.belongsTo(Localidade, 'bairro_id'),
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      his: this.belongsTo(HealthInformationSystem, 'his_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
