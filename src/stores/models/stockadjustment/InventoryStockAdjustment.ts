import { StockAdjustment } from './StockAdjustmentHierarchy';
import Inventory from '../stockinventory/Inventory';
import { v4 as uuidv4 } from 'uuid';

export class InventoryStockAdjustment extends StockAdjustment {
  static entity = 'inventoryStockAdjustments';
  static baseEntity = 'stockAdjustments';

  static fields() {
    return {
      ...super.fields(),
      id: this.string(() => uuidv4()),
      inventory_id: this.attr(null),
      syncStatus: this.attr(''),
      // relationships
      inventory: this.belongsTo(Inventory, 'inventory_id'),
    };
  }
 
  static piniaOptions = {
    persist: true,
  }
}
