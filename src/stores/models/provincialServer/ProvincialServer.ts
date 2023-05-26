import { Model } from 'pinia-orm';
import db from 'src/stores/localbase';

export default class ProvincialServer extends Model {
  static entity = 'provincialServers';

  static fields() {
    return {
      id: this.attr(null),
      urlPath: this.attr(''),
      code: this.attr(''),
      destination: this.attr(''),
      port: this.attr(''),
      username: this.attr(''),
      syncStatus: this.attr(''),
      password: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
  static async apiFetchById(id) {
    return await this.api().get(`/provincialServer/${id}`);
  }

  static async apiGetAll() {
    return await this.api().get('/provincialServer');
  }

  static localDbAdd(provincialServer) {
    return db.newDb().collection('provincialServers').add(provincialServer);
  }

  static localDbGetById(id) {
    return db.newDb().collection('provincialServers').doc({ id: id }).get();
  }

  static localDbGetAll() {
    return db.newDb().collection('provincialServers').get();
  }

  static localDbUpdate(provincialServer) {
    return db
      .newDb()
      .collection('provincialServers')
      .doc({ id: provincialServer.id })
      .set(provincialServer);
  }

  static localDbUpdateAll(provincialServers) {
    return db.newDb().collection('provincialServers').set(provincialServers);
  }

  static localDbDelete(provincialServer) {
    return db
      .newDb()
      .collection('provincialServers')
      .doc({ id: provincialServer.id })
      .delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('provincialServers').delete();
  }
}
