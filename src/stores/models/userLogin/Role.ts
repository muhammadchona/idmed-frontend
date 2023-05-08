import { Model } from 'pinia-orm';
import Menu from 'src/stores/models/userLogin/Menu';
import RoleMenu from './RoleMenu';
import db from 'src/stores/localbase';
import { v4 as uuidv4 } from 'uuid';
export default class Role extends Model {
  static entity = 'roles';

  static state() {
    return {
      fetching: false,
    };
  }

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
    };
  }

  static async apiGetAll() {
    return await this.api().get('/role');
  }

  static async apiSave(role) {
    return await this.api().post('/role', role);
  }

  static async apiUpdate(role) {
    return await this.api().put('/role/', role);
  }

  static localDbAdd(role) {
    return db.newDb().collection('roles').add(role);
  }

  static localDbGetById(id) {
    return db.newDb().collection('roles').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('roles').get();
  }

  static localDbUpdate(role) {
    return db.newDb().collection('roles').doc({ id: role.id }).set(role);
  }

  static localDbUpdateAll(roles) {
    return db.newDb().collection('roles').set(roles);
  }

  static localDbDelete(roleId) {
    return db.newDb().collection('roles').doc({ id: roleId }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('roles').delete();
  }

  static localDbAddOrUpdate(role) {
    if (role.id === null) {
      role.id = uuidv4();
      return this.localDbAdd(role);
    } else {
      role.syncStatus = 'U';
      return this.localDbUpdate(role);
    }
  }
}
