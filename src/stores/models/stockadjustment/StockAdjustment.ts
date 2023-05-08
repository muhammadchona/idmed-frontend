import { Model } from 'pinia-orm';
import Clinic from '../clinic/Clinic';
import Stock from '../stock/Stock';
import StockOperationType from '../stockoperation/StockOperationType';
import {
  InventoryStockAdjustment,
  StockDestructionAdjustment,
  StockReferenceAdjustment,
} from './StockAdjustmentHierarchy';
import { v4 as uuidv4 } from 'uuid';
import db from 'src/stores/localbase';

export class StockAdjustment extends Model {
  static entity = 'stockAdjustments';

  static types() {
    return {
      INVENTORYSTOCKADJUSTMENT: InventoryStockAdjustment,
      STOCKDESTRUCTIONADJUSTMENT: StockDestructionAdjustment,
      STOCKREFERENCEADJUSTMENT: StockReferenceAdjustment,
    };
  }

  static fields() {
    return {
      id: this.string(() => uuidv4()),
      index: this.number(0),
      notes: this.attr(''),
      stockTake: this.number(0),
      adjustedValue: this.number(0),
      balance: this.number(0),
      captureDate: this.attr(''),
      finalised: this.boolean(false),
      adjusted_stock_id: this.attr(null),
      operation_id: this.attr(null),
      clinic_id: this.attr(''),
      syncStatus: this.attr(''),
      type: this.attr('INVENTORYSTOCKADJUSTMENT'),
      // relationships
      clinic: this.belongsTo(Clinic, 'clinic_id'),
      adjustedStock: this.belongsTo(Stock, 'adjusted_stock_id'),
      operation: this.belongsTo(StockOperationType, 'operation_id'),
    };
  }

  isPosetiveAdjustment() {
    return this.operation.code === 'AJUSTE_POSETIVO';
  }

  isNegativeAdjustment() {
    return this.operation.code === 'AJUSTE_NEGATIVO';
  }

  static localDbDeleteAll() {
    return db.newDb().collection('stockAdjustments').delete();
  }

  static localDbGetById(id) {
    return db.newDb().collection('stockAdjustments').doc({ id: id }).get();
  }
}
