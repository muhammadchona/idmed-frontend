import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import Prescription from '../prescription/Prescription';
import db from 'src/stores/localbase';
// import { v4 as uuidv4 } from 'uuid'

export default class Doctor extends Model {
  static entity = 'doctors';

  get fullName() {
    return `${this.firstnames} ${this.lastname}`;
  }

  static fields() {
    return {
      id: this.attr(null),
      firstnames: this.attr(''),
      lastname: this.attr(''),
      gender: this.attr(''),
      telephone: this.attr(''),
      email: this.attr(''),
      category: this.attr(''),
      active: this.attr(''),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      prescriptions: this.hasMany(Prescription, 'prescription_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiGetAll() {
    return await this.api().get('/doctor');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/doctor/${id}`);
  }

  static async apiFetchByClinicId(clinicId) {
    return await this.api().get('/doctor/clinic/' + clinicId);
  }

  static async apiSave(doctor) {
    return await this.api().post('/doctor', doctor);
  }

  static async apiUpdate(doctor) {
    return await this.api().patch('/doctor/' + doctor.id, doctor);
  }

  static localDbAdd(doctor) {
    return db.newDb().collection('doctors').add(doctor);
  }

  static localDbGetById(id) {
    return db.newDb().collection('doctors').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('doctors').get();
  }

  static localDbUpdate(doctor) {
    return db.newDb().collection('doctors').doc({ id: doctor.id }).set(doctor);
  }

  static localDbUpdateAll(doctors) {
    return db.newDb().collection('doctors').set(doctors);
  }

  static localDbDelete(doctor) {
    return db.newDb().collection('doctors').doc({ id: doctor.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('doctors').delete();
  }
}
