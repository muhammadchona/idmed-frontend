import { Model } from 'pinia-orm';
import UiSection from './UiSection';
export default class Menu extends Model {
  static entity = 'menus';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      code: this.attr(''),
      description: this.attr(''),
      uiSections: this.hasMany(UiSection, 'ui_section_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
