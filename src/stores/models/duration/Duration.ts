import { Model } from 'pinia-orm';
import Prescription from '../prescription/Prescription';
import { v4 as uuidv4 } from 'uuid';

export default class Duration extends Model {
  static entity = 'durations';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      weeks: this.attr(''),
      description: this.attr(''),
      prescriptions: this.hasMany(Prescription, 'duration_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
