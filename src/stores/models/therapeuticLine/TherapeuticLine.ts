import { Model } from 'pinia-orm';
import PrescriptionDetail from '../prescriptionDetails/PrescriptionDetail';
import { v4 as uuidv4 } from 'uuid';

export default class TherapeuticLine extends Model {
  static entity = 'therapeuticLines';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      prescriptionDetails: this.hasMany(
        PrescriptionDetail,
        'therapeutic_line_id'
      ),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
