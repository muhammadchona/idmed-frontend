import { Model } from 'pinia-orm';
import Duration from '../duration/Duration';
import Group from './Group';
import GroupPack from './GroupPack';
import { v4 as uuidv4 } from 'uuid';

export default class GroupPackHeader extends Model {
  static entity = 'groupPackHeaders';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      packDate: this.attr(''),
      nextPickUpDate: this.attr(''),
      isLast: this.boolean(false),
      duration_id: this.attr(''),
      group_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      duration: this.belongsTo(Duration, 'duration_id'),
      group: this.belongsTo(Group, 'group_id'),
      groupPacks: this.hasMany(GroupPack, 'header_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
