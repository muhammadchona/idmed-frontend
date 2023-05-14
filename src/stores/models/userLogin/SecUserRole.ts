import { Model } from 'pinia-orm';

export default class SecUserRole extends Model {
  static entity = 'secUserRoles';
  // static primaryKey = ['user_id', 'role_id']

  static fields() {
    return {
      secUser: this.attr(null),
      role: this.attr(null),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
