import { Model } from 'pinia-orm';
import Episode from '../episode/Episode';
import { v4 as uuidv4 } from 'uuid';

export default class StartStopReason extends Model {
  static entity = 'startStopReasons';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      isStartReason: this.boolean(false),
      reason: this.attr(''),
      episode: this.hasMany(Episode, 'startStopReason_id'),
      syncStatus: this.attr(''),
      code: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
