// import Clinic from '../clinic/Clinic';
import { Clinic } from './ClinicHierarchy';
import { v4 as uuidv4 } from 'uuid';

export class ClinicSector extends Clinic {
  static entity = 'clinicSectors';
  static baseEntity = 'clinics';
  // static primaryKey = 'id';
  static fields() {
    return {
      ...super.fields(),
      //  id: this.string(() => uuidv4()), // Inherit fields from Clinic
      parentClinic_id: this.attr(''),
      type: this.attr('CLINIC_SECTOR'),
      // Relationships
      parentClinic: this.belongsTo(Clinic, 'parentClinic_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
