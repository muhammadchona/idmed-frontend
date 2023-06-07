import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';

export default class DrugFile extends Model {
  static entity = 'drugFiles';

  static fields() {
    return {
      id: this.attr(null),
      drugId: this.attr(null),
      drug: this.attr(''),
      drugFileSummary: this.attr(''),
      drugFileSummaryBatch: this.attr(''),
    };
  }

}
