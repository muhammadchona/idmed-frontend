import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import DispenseMode from '../dispenseMode/DispenseMode';
import GroupPack from '../group/GroupPack';
import PackagedDrug from '../packagedDrug/PackagedDrug';
import PatientVisitDetails from '../patientVisitDetails/PatientVisitDetails';
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
  static piniaOptions = {
    persist: true,
  };
}
