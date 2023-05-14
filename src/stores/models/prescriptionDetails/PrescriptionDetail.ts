import { Model } from 'pinia-orm';
import Prescription from '../prescription/Prescription';
import TherapeuticRegimen from '../therapeuticRegimen/TherapeuticRegimen';
import DispenseType from '../dispenseType/DispenseType';
import TherapeuticLine from '../therapeuticLine/TherapeuticLine';
import SpetialPrescriptionMotive from '../prescription/SpetialPrescriptionMotive';
import { v4 as uuidv4 } from 'uuid';

export default class PrescriptionDetail extends Model {
  static entity = 'prescriptionsDetails';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      reasonForUpdate: this.attr(''),
      prescription_id: this.attr(''),
      therapeutic_line_id: this.attr(''),
      therapeutic_regimen_id: this.attr(''),
      dispense_type_id: this.attr(''),
      spetialPrescriptionMotive_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      prescription: this.belongsTo(Prescription, 'prescription_id'),
      therapeuticLine: this.belongsTo(TherapeuticLine, 'therapeutic_line_id'),
      therapeuticRegimen: this.belongsTo(
        TherapeuticRegimen,
        'therapeutic_regimen_id'
      ),
      dispenseType: this.belongsTo(DispenseType, 'dispense_type_id'),
      spetialPrescriptionMotive: this.belongsTo(
        SpetialPrescriptionMotive,
        'spetialPrescriptionMotive_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
