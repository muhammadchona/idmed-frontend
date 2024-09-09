import { Model } from 'pinia-orm';

export default class ClinicalServiceTherapeuticRegimens extends Model {
  static entity = 'clinicalServiceTherapeuticRegimens';
  static primaryKey = ['therapeutic_regimen_id', 'clinical_service_id'];
  static fields() {
    return {
      therapeutic_regimen_id: this.attr(null),
      clinical_service_id: this.attr(null),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
