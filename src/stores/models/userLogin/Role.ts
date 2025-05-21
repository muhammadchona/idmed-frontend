import { Model } from 'pinia-orm';
import Menu from 'src/stores/models/userLogin/Menu';
import RoleMenu from './RoleMenu';
import { v4 as uuidv4 } from 'uuid';
import User from './User';
import UserRole from './UserRole';
import UiSection from './UiSection';
import RoleUiSection from './RoleUiSection';
export default class Role extends Model {
  static entity = 'roles';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      authority: this.attr(''),
      description: this.attr(''),
      name: this.attr(''),
      active: this.attr(''),
      syncStatus: this.attr(''),
      // menus: this.hasMany(Menu, 'role_id'),
      menus: this.belongsToMany(Menu, RoleMenu, 'role_id', 'menu_id'),
      users: this.belongsToMany(User, UserRole, 'role_id', 'user_id'),
      uiSections: this.belongsToMany(
        UiSection,
        RoleUiSection,
        'role_id',
        'ui_section_id'
      ),
    };
  }

  static afterInsert(model: Role) {
    console.log(model);
    model.forEach((role) => {
      if (role.uiSections && role.uiSections.length) {
        const unique = [];
        const seen = new Set();

        for (const section of role.uiSections) {
          if (!seen.has(section.id)) {
            seen.add(section.id);
            unique.push(section);
          }
        }

        role.uiSections = unique;
      }
    });
  }

  static piniaOptions = {
    persist: true,
  };
}
