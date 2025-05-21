import { Model } from 'pinia-orm';

export default class RoleUiSection extends Model {
  static entity = 'roleUiSections';
  static primaryKey = ['role_id', 'ui_section_id'];

  static fields() {
    return {
      role_id: this.attr(null),
      ui_section_id: this.attr(null),
    };
  }

  static piniaOptions = {
    persist: true,
  };
}
