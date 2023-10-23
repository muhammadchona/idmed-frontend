import { Model } from 'pinia-orm';
import { v4 as uuidv4 } from 'uuid';

export default class AuditSyncronization extends Model {
  static entity = 'auditSyncronization';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      operationType: this.attr(''),
      username: this.attr(() => localStorage.getItem('user')),
      className: this.attr(''),
      syncStatus: this.attr(''), // 'D -deleted, S sent'
      entity: this.attr(null),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
