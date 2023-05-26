import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import TherapeuticRegimen from '../therapeuticRegimen/TherapeuticRegimen';
import { v4 as uuidv4 } from 'uuid';
export default class RegimenDrug extends Model {
  static entity = 'regimenDrugs';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      // amPerTime: this.attr(''),
      // timesPerDay: this.attr(''),
      // modified: this.attr(''),
      //   notes: this.attr(''),
      drug_id: this.attr(''),
      therapeutic_regimen_id: this.attr(''),

      // Relationships
      drug: this.belongsTo(Drug, 'drug_id'),
      therapeutic_regimen: this.belongsTo(
        TherapeuticRegimen,
        'therapeutic_regimen_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
