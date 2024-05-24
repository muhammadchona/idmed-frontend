import { Model } from 'pinia-orm';
// import { ClinicSector } from './ClinicHierarchy';
import District from '../district/District';
import NationalClinic from '../nationalClinic/NationalClinic';
import Patient from '../patient/Patient';
import Province from '../province/Province';
import FacilityType from '../facilityType/FacilityType';
import { ClinicSector } from './ClinicHierarchy';
import { v4 as uuidv4 } from 'uuid';

export class Clinic extends Model {
  static entity = 'clinics';
  static primaryKey = 'id';
  static types() {
    return {
      CLINIC: Clinic,
      CLINIC_SECTOR: ClinicSector,
    };
  }

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
      type: this.attr('CLINIC'),
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
}

export default Clinic;
