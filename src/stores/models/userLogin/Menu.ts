import { Model } from 'pinia-orm';
export default class Menu extends Model {
  static entity = 'menus';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      code: this.attr(''),
      description: this.attr(''),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
