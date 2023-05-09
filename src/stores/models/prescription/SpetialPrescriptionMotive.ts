import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';

export default class SpetialPrescriptionMotive extends Model {
  static entity = 'spetialPrescriptionMotives';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      syncStatus: this.attr(''),
      description: this.attr(''),
    };
  }
}
