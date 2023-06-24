import { Model } from 'pinia-orm';

export default class MigrationStage extends Model {
  static entity = 'migrationStages';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      code: this.attr(''),
      value: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
