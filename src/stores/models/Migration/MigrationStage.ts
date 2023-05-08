import { Model } from 'pinia-orm';

export default class MigrationStage extends Model {
  static entity = 'migrationStages';

  static fields() {
    return {
      id: this.attr(null),
      code: this.attr(''),
      value: this.attr(''),
    };
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/migration?offset=' + offset + '&max=' + max);
  }

  static async initMigration() {
    return await this.api().post('/migration/initMigration');
  }

  static async apiFetchById(id) {
    return await this.api().get(`/migration/${id}`);
  }
}
