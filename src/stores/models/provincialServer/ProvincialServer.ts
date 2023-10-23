import { Model } from 'pinia-orm';

export default class ProvincialServer extends Model {
  static entity = 'provincialServers';
  static primaryKey = 'id';
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
}
