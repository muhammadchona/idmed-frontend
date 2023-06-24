import { Model } from 'pinia-orm';
import ClinicalService from '../ClinicalService/ClinicalService';
import Drug from '../drug/Drug';
import PrescriptionDetail from '../prescriptionDetails/PrescriptionDetail';
import ThrapeuticRegimensDrug from '../TherapeuticRegimensDrug/TherapeuticRegimensDrug';
import { v4 as uuidv4 } from 'uuid';

export default class TherapeuticRegimen extends Model {
  static entity = 'therapeuticRegimens';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      regimenScheme: this.attr(''),
      active: this.attr(''),
      code: this.attr(''),
      // pedhiatric: this.attr(''),
      description: this.attr(''),
      clinical_service_id: this.attr(''),
      syncStatus: this.attr(''),

      // Relationships
      prescriptionDetails: this.hasMany(
        PrescriptionDetail,
        'therapeutic_regimen_id'
      ),
      drugs: this.belongsToMany(
        Drug,
        ThrapeuticRegimensDrug,
        'therapeutic_regimen_id',
        'drug_id'
      ),
      clinicalService: this.belongsTo(ClinicalService, 'clinical_service_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
