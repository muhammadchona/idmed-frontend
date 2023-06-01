import { Model } from 'pinia-orm';
import { StockAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import StockLevel from '../stocklevel/StockLevel';
import StockEntrance from '../stockentrance/StockEntrance';
import StockCenter from '../stockcenter/StockCenter';
import Drug from '../drug/Drug';
import Clinic from '../clinic/Clinic';
import PackagedDrugStock from '../packagedDrug/PackagedDrugStock';
import { v4 as uuidv4 } from 'uuid';

export default class Stock extends Model {
  static entity = 'stocks';

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      expireDate: this.attr(''),
      auxExpireDate: this.attr(''),
      modified: this.boolean(false),
      shelfNumber: this.attr(''),
      unitsReceived: this.attr(0),
      stockMoviment: this.number(0),
      manufacture: this.attr(''),
      batchNumber: this.attr(''),
      hasUnitsRemaining: this.boolean(false),
      entrance_id: this.attr(null),
      stock_center_id: this.attr(null),
      drug_id: this.attr(null),
      enabled: this.boolean(false),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      adjustments: this.hasMany(StockAdjustment, 'adjusted_stock_id'),
      entrance: this.belongsTo(StockEntrance, 'entrance_id'),
      center: this.belongsTo(StockCenter, 'stock_center_id'),
      stockLevel: this.hasOne(StockLevel, 'stock_id'),
      drug: this.belongsTo(Drug, 'drug_id'),
      packagedDrugStocks: this.hasMany(PackagedDrugStock, 'stock_id'),
    };
  }

  static piniaOptions = {
    persist: true,
  }

}
