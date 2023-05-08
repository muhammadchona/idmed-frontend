import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import DispenseMode from '../dispenseMode/DispenseMode';
import GroupPack from '../group/GroupPack';
import PackagedDrug from '../packagedDrug/PackagedDrug';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Pack extends Model {
  static entity = 'packs';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      dateLeft: this.attr(''),
      dateReceived: this.attr(''),
      modified: this.boolean(false),
      packDate: this.attr(''),
      pickupDate: this.attr(''),
      nextPickUpDate: this.attr(''),
      weeksSupply: this.attr(''),
      dispenseMode_id: this.attr(''),
      dateReturned: this.attr(''),
      stockReturned: this.number(0),
      packageReturned: this.number(0),
      reasonForPackageReturn: this.attr(''),
      clinic_id: this.attr(''),
      providerUuid: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      patientVisitDetails: this.hasMany(PatientVisitDetails, 'pack_id'),
      dispenseMode: this.belongsTo(DispenseMode, 'dispenseMode_id'),
      packagedDrugs: this.hasMany(PackagedDrug, 'pack_id'),
      groupPack: this.belongsTo(GroupPack, 'pack_id'),
    };
  }

  static async apiSave(pack) {
    return await this.api().post('/pack', pack);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/pack/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static async apiGetAllLastOfClinic(clinicId, offset, max) {
    return await this.api().get(
      '/pack/AllLastOfClinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static async apiGetAllByPatientVisitDetailsId(
    patientVisitDetailsId,
    offset,
    max
  ) {
    return await this.api().get(
      '/pack/patientVisitDetails/' + patientVisitDetailsId + '?offset=0&max=200'
    );
  }

  static async apiGetAllByPrescriptionId(prescriptionId, offset, max) {
    return await this.api().get('/pack/prescription/' + prescriptionId);
  }

  static async apiFetchById(id) {
    return await this.api().get(`/pack/${id}`);
  }

  getDrugsString() {
    let drugsString = '';
    Object.keys(this.packagedDrugs).forEach(
      function (k) {
        const presDrug = this.packagedDrugs[k];
        drugsString = drugsString + presDrug.drug.name;
      }.bind(this)
    );
    return drugsString;
  }

  static localDbAdd(pack) {
    return db.newDb().collection('packs').add(pack);
  }

  static localDbGetById(id) {
    return db.newDb().collection('packs').doc({ id: id }).get();
  }

  static async localDbGetAll() {
    return await db.newDb().collection('packs').get();
  }

  static localDbUpdate(pack) {
    return db.newDb().collection('packs').doc({ id: pack.id }).set(pack);
  }

  static localDbUpdateAll(packs) {
    return db.newDb().collection('packs').set(packs);
  }

  static localDbDelete(pack) {
    return db.newDb().collection('packs').doc({ id: pack.id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('packs').delete();
  }

  static localDbDeleteById(packId) {
    return db.newDb().collection('packs').doc({ id: packId }).delete();
  }
}
