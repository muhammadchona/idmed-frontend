import { Model } from 'pinia-orm';

export default class DrugStockFileEvent extends Model {
  static entity = 'drugStockFileEvents';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.attr(null),
      eventDate: this.attr(''),
      moviment: this.attr(''),
      orderNumber: this.attr(''),
      incomes: this.attr(''),
      outcomes: this.attr(''),
      posetiveAdjustment: this.attr(''),
      negativeAdjustment: this.attr(''),
      loses: this.attr(''),
      balance: this.attr(''),
      notes: this.attr(''),
      code: this.attr(''),
      stockId: this.attr(''),
    };
  }
  static piniaOptions = {
    persist: true,
  };
}
