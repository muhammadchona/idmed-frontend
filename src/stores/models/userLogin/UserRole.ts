import { Model } from 'pinia-orm';

export default class UserRole extends Model {
  static entity = 'userRoles';
  static primaryKey = ['user_id', 'role_id'];

  static fields() {
    return {
      user_id: this.attr(null),
      role_id: this.attr(null),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
