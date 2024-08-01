import { v4 as uuidv4 } from 'uuid';
import { Model } from 'pinia-orm';

export default class PacksByDrugBottles extends Model {
  static entity = 'packsByDrugBottles';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      reportId: this.attr(''),
      periodType: this.attr(''),
      period: this.attr(''),
      year: this.attr(''),
      startDate: this.attr(''),
      endDate: this.attr(''),
      province: this.attr(''),
      district: this.attr(''),

      // fields
      drugName: this.attr(''),
      bottles_packed: this.attr(''),
    };
  }
}
