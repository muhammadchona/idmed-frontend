import { Model } from 'pinia-orm';
import Drug from '../drug/Drug';
import Prescription from '../prescription/Prescription';
import { v4 as uuidv4 } from 'uuid';

export default class PrescribedDrug extends Model {
  static entity = 'prescribedDrugs';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      amtPerTime: this.attr(''),
      timesPerDay: this.attr(''),
      modified: this.boolean(false),
      qtyPrescribed: this.number(1),
      nextPickUpDate: this.attr(''),
      toContinue: this.boolean(true),
      prescription_id: this.attr(''),
      drug_id: this.attr(''),
      form: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      prescription: this.belongsTo(Prescription, 'prescription_id'),
      drug: this.belongsTo(Drug, 'drug_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
