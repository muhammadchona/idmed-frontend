import { Model } from 'pinia-orm';
// import ClinicSector from '../clinicSector/ClinicSector';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicSectorType extends Model {
  static entity = 'clinicSectorTypes';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      // clinicSectorList: this.hasMany(ClinicSector, 'clinic_sector_type_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
