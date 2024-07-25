import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import { v4 as uuidv4 } from 'uuid';
import DrugDistributor from '../drugDistributor/DrugDistributor';

export default class StockDistributor extends Model {
  static entity = 'stockDistributors';
  static primaryKey = 'id';
  static fields() {
    return {
      id: this.string(() => uuidv4()),
      orderNumber: this.attr(''),
      creationDate: this.attr(''),
      syncStatus: this.attr(''),
      notes: this.attr(''),
      clinic_id: this.attr(''),
      status: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      drugDistributors: this.hasMany(DrugDistributor, 'stock_distributor_id'),
    };
  }
  static piniaOptions = {
    persist: true,
  };

  static getClassName() {
    return 'stockDistributor';
  }
}
