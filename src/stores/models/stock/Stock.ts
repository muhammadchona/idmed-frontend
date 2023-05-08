import { Model } from 'pinia-orm';
import { StockAdjustment } from '../stockadjustment/StockAdjustmentHierarchy';
import StockLevel from '../stocklevel/StockLevel';
import StockEntrance from '../stockentrance/StockEntrance';
import StockCenter from '../stockcenter/StockCenter';
import Drug from '../drug/Drug';
import Clinic from '../clinic/Clinic';
import { date } from 'quasar';
import PackagedDrugStock from '../packagedDrug/PackagedDrugStock';
import db from 'src/stores/localbase';
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
      unitsReceived: this.attr(''),
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

  static async apiSave(stock) {
    return await this.api().post('/stock', stock);
  }

  static async apiRemove(id) {
    return await this.api().delete(`/stock/${id}`);
  }

  static async apiUpdate(stock) {
    return await this.api().patch('/stock/' + stock.id, stock);
  }

  static async apiGetAll(offset, max) {
    return await this.api().get('/stock?offset=' + offset + '&max=' + max);
  }

  isInUse() {
    return (
      (this.packagedDrugStocks !== undefined &&
        this.packagedDrugStocks.length > 0) ||
      this.adjustments.length > 0
    );
  }

  getFormatedExpireDate() {
    return this.formatDate(this.expireDate);
  }

  formatDate(dateString) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }

  static async apiGetDrugSummary(clinicId, drugId) {
    return await this.api().get(`/drugStockFile/sumary/${clinicId}/${drugId}`);
  }

  static async apiGetDrugBatchSummary(clinicId, stockId) {
    return await this.api().get(
      `/drugStockFile/batchsumary/${clinicId}/${stockId}`
    );
  }

  static localDbAdd(stock) {
    return db.newDb().collection('stocks').add(stock);
  }

  static localDbGetById(id) {
    return db.newDb().collection('stocks').doc({ id: id }).get();
  }

  static async localDbGetAll() {
    return await db.newDb().collection('stocks').get();
  }

  static localDbUpdate(stock) {
    return db.newDb().collection('stocks').doc({ id: stock.id }).set(stock);
  }

  static localDbUpdateAll(stocks) {
    return db.newDb().collection('stocks').set(stocks);
  }

  static localDbDelete(stock) {
    return db.newDb().collection('stocks').doc({ id: stock.id }).delete();
  }

  static localDbDeleteById(id) {
    return db.newDb().collection('stocks').doc({ id: id }).delete();
  }

  static localDbDeleteAll() {
    return db.newDb().collection('stocks').delete();
  }

  static localDbAddOrUpdate(stock, operation) {
    if (operation === 'create') {
      stock.syncStatus = 'R';
      return this.localDbAdd(stock);
    } else {
      stock.syncStatus = 'U';
      return this.localDbUpdate(stock);
    }
  }

  static getClassName() {
    return 'stock';
  }
}
