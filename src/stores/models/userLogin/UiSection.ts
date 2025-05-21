import { Model } from 'pinia-orm';
import Menu from './Menu';
export default class UiSection extends Model {
  static entity = 'uiSections';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      name: this.attr(''),
      category: this.attr(''),
      displayName: this.attr(''),
      action: this.attr(''),
      requestMapUrl: this.attr(''),
      menu_id: this.attr(''),

      menu: this.belongsTo(Menu, 'menu_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
