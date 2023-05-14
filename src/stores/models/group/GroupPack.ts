import { Model } from 'pinia-orm';
import Pack from '../packaging/Pack';
import GroupPackHeader from './GroupPackHeader';
import { v4 as uuidv4 } from 'uuid';

export default class GroupPack extends Model {
  static entity = 'groupPacks';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      pack_id: this.attr(''),
      header_id: this.attr(''),
      syncStatus: this.attr(''),
      // Relationships
      pack: this.belongsTo(Pack, 'pack_id'),
      header: this.belongsTo(GroupPackHeader, 'header_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
