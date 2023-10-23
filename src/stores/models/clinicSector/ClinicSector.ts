import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import ClinicSectorType from '../clinicSectorType/ClinicSectorType';
import { v4 as uuidv4 } from 'uuid';

export default class ClinicSector extends Model {
  static entity = 'clinicSectors';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      active: this.attr(''),
      uuid: this.attr(null),
      clinic_id: this.attr(''),
      clinic_sector_type_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      clinicSectorType: this.belongsTo(
        ClinicSectorType,
        'clinic_sector_type_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
