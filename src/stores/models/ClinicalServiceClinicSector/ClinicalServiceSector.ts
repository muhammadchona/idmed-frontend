import { Model } from 'pinia-orm';

export default class ClinicalServiceSector extends Model {
  static entity = 'clinicalServiceSectors';
  static primaryKey = ['clinical_service_id', 'clinic_id'];

  static fields() {
    return {
      clinic_id: this.attr(null),
      clinical_service_id: this.attr(null),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
