import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import Doctor from '../doctor/Doctor';
import Duration from '../Duration/Duration';
import GroupMemberPrescription from '../group/GroupMemberPrescription';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
import PrescriptionDetail from '../prescriptionDetails/PrescriptionDetail';
import PrescribedDrug from '../prescriptionDrug/PrescribedDrug';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class Prescription extends Model {
  static entity = 'prescriptions';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      duration_id: this.attr(''),
      prescriptionDate: this.attr(''),
      expiryDate: this.attr(''),
      current: this.boolean(true),
      notes: this.attr(''),
      prescriptionSeq: this.attr(''),
      modified: this.boolean(false),
      patientType: this.attr(''),
      patientStatus: this.attr(''),
      leftDuration: this.attr(0),
      doctor_id: this.attr(''),
      clinic_id: this.attr(''),
      special: this.boolean(false),
      syncStatus: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      doctor: this.belongsTo(Doctor, 'doctor_id'),
      patientVisitDetails: this.hasMany(PatientVisitDetails, 'prescription_id'),
      prescriptionDetails: this.hasMany(PrescriptionDetail, 'prescription_id'),
      duration: this.belongsTo(Duration, 'duration_id'),
      prescribedDrugs: this.hasMany(PrescribedDrug, 'prescription_id'),
      groupMemberPrescription: this.hasMany(
        GroupMemberPrescription,
        'prescription_id'
      ),
    };
  }

  calculateLeftDuration(weeksSupply) {
    if (this.leftDuration === 0) {
      this.leftDuration = Number(
        (Number(this.duration.weeks) - Number(weeksSupply)) / 4
      );
    } else {
      this.leftDuration = Number(
        (Number(this.leftDuration * 4) - Number(weeksSupply)) / 4
      );
    }
  }

  remainigDuration() {
    const prescriptionDuration = Number(this.duration.weeks);
    let packagedWeeks = 0;
    this.patientVisitDetails.forEach((pvd) => {
      if (pvd.pack !== null) {
        packagedWeeks = Number(packagedWeeks + pvd.pack.weeksSupply);
      }
    });
    return Number((prescriptionDuration - packagedWeeks) / 4);
  }

  remainigDurationInWeeks() {
    const prescriptionDuration = Number(this.duration.weeks);
    let packagedWeeks = 0;
    this.patientVisitDetails.forEach((pvd) => {
      if (pvd.pack !== null) {
        packagedWeeks = Number(packagedWeeks + pvd.pack.weeksSupply);
      }
    });
    return Number(prescriptionDuration - packagedWeeks);
  }

  lastPackOnPrescription() {
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

  static async apiSave(prescription) {
    return await this.api().post('/prescription', prescription);
  }

  static async apiGetAllByClinicId(clinicId, offset, max) {
    return await this.api().get(
      '/prescription/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  }

  static async apiGetAllLastOfClinic(clinicId, offset, max) {
    return await this.api().get(
      '/prescription/AllLastOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  }

  static async apiFetchById(id) {
    return await this.api().get(`/prescription/${id}`);
  }

  static async apiFetchLastByIdentifierId(id) {
    return await this.api().get(`/prescription/identifier/${id}`);
  }

  static async apiFetchByPatientVisitDetailsId(pvdsId, offset, max) {
    return await this.api().get(
      '/prescription/visits/' + pvdsId + '?offset=' + offset + '&max=' + max
    );
  }

  static async apiGetByClinicId(clinicId) {
    return await this.api().get('/prescription/clinic/' + clinicId);
  }

  static localDbAdd(prescription) {
    return db.newDb().collection('prescriptions').add(prescription);
  }

  static async localDbGetById(id) {
    return await db.newDb().collection('prescriptions').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('prescriptions').get();
  }

  static localDbUpdate(prescription) {
    return db
      .newDb()
      .collection('prescriptions')
      .doc({ id: prescription.id })
      .set(prescription);
  }

  static localDbUpdateAll(prescriptions) {
    return db.newDb().collection('prescriptions').set(prescriptions);
  }

  static localDbDelete(prescription) {
    return db
      .newDb()
      .collection('prescriptions')
      .doc({ id: prescription.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('prescriptions').delete();
  }

  static localDbDeleteById(prescriptionId) {
    return db
      .newDb()
      .collection('prescriptions')
      .doc({ id: prescriptionId })
      .delete();
  }
}
