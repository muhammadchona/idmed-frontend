import { Model } from 'pinia-orm';
import ClinicSector from '../clinicSector/ClinicSector';
import District from '../district/District';
import NationalClinic from '../nationalClinic/NationalClinic';
import Patient from '../patient/Patient';
import Province from '../province/Province';
import FacilityType from '../facilityType/FacilityType';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Clinic extends Model {
  static entity = 'clinics';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      notes: this.attr(''),
      telephone: this.attr(''),
      clinicName: this.attr(''),
      mainClinic: this.boolean(false),
      uuid: this.attr(null),
      province_id: this.attr(''),
      district_id: this.attr(''),
      nationalClinic_id: this.attr(''),
      active: this.attr(''),
      facilityTypeId: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      facilityType: this.belongsTo(FacilityType, 'facilityTypeId'),
      province: this.belongsTo(Province, 'province_id'),
      district: this.belongsTo(District, 'district_id'),
      nationalClinic: this.belongsTo(NationalClinic, 'nationalClinic_id'),
      sectors: this.hasMany(ClinicSector, 'clinic_id'),
      patients: this.hasMany(Patient, 'patients'),
    };
  }

  static piniaOptions = {
    persist: true,
  };

  static apiFetchById(id) {
    return this.api().get(`/clinic/${id}`);
  }

  static apiFetchMainClinic() {
    return this.api().get('/clinic/mainClinic');
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/clinic?offset=' + offset + '&max=' + max);
  }

  static async apiGetByUUID(uuid) {
    return await this.api().get('/clinic/uuid/' + uuid);
  }

  static async apiSave(clinic) {
    return await this.api().post('/clinic', clinic);
  }

  static async apiUpdate(clinic) {
    // return await this.api().post('/clinic', clinic)
    return await this.api().patch('/clinic/' + clinic.id, clinic);
  }

  static localDbAdd(clinic) {
    return db.newDb().collection('clinics').add(clinic);
  }

  static localDbGetById(id) {
    return db.newDb().collection('clinics').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('clinics').get();
  }

  static localDbUpdate(clinic) {
    return db.newDb().collection('clinics').doc({ id: clinic.id }).set(clinic);
  }

  static localDbUpdateAll(clinics) {
    return db.newDb().collection('clinics').set(clinics);
  }

  static localDbDelete(clinic) {
    return db.newDb().collection('clinics').doc({ id: clinic.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('clinics').delete();
  }
}
