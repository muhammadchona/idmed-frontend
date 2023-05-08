import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';

export default class SystemConfigs extends Model {
  static entity = 'systemConfigs';

  static fields() {
    return {
      id: this.attr(null),
      key: this.attr(''),
      value: this.attr(''),
      syncStatus: this.attr(''),
      description: this.attr(''),
    };
  }

  static async apiFetchById(id) {
    return await this.api().get(`/systemConfigs/${id}`);
  }

  static async apiGetAll() {
    return await this.api().get('/systemConfigs');
  }

  static async apiSave(systemConfigs) {
    return await this.api().post('/systemConfigs', systemConfigs);
  }

  static localDbAdd(systemConfig) {
    return db.newDb().collection('systemConfigs').add(systemConfig);
  }

  static localDbGetById(id) {
    return db.newDb().collection('systemConfigs').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('systemConfigs').get();
  }

  static localDbUpdate(systemConfig) {
    return db
      .newDb()
      .collection('systemConfigs')
      .doc({ id: systemConfig.id })
      .set(systemConfig);
  }

  static localDbUpdateAll(systemConfigs) {
    return db.newDb().collection('systemConfigs').set(systemConfigs);
  }

  static localDbDelete(systemConfig) {
    return db
      .newDb()
      .collection('systemConfigs')
      .doc({ id: systemConfig.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('systemConfigs').delete();
  }
}
