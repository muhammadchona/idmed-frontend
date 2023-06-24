import { Model } from 'pinia-orm';

export default class DrugFile extends Model {
  static entity = 'drugFiles';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      drugId: this.attr(null),
      drug: this.attr(''),
      drugFileSummary: this.attr(''),
      drugFileSummaryBatch: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
