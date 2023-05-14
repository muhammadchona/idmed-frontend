import { Model } from 'pinia-orm';

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
  static piniaOptions = {
    persist: true,
  };
}
