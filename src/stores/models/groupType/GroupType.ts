import { Model } from 'pinia-orm';
import Group from '../group/Group';
import { v4 as uuidv4 } from 'uuid';

export default class GroupType extends Model {
  static entity = 'groupTypes';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      code: this.attr(''),
      description: this.attr(''),
      syncStatus: this.attr(''),
      groups: this.hasMany(Group, 'groupType_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
