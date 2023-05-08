import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';
export default class Menu extends Model {
  static entity = 'menus';

  static state() {
    return {
      fetching: false,
    };
  }

  static fields() {
    return {
      id: this.attr(null),
      code: this.attr(''),
      description: this.attr(''),
    };
  }

  static async apiGetAll() {
    return await this.api().get('/menu');
  }

  static localDbUpdateAll(menus) {
    return db.newDb().collection('menus').set(menus);
  }

  static localDbGetAll() {
    return db.newDb().collection('menus').get();
  }
}
