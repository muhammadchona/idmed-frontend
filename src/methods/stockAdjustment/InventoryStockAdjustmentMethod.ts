
import db from 'src/stores/localbase';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';

export default {
  

  localDbAdd(inventoryStockAdjustment: InventoryStockAdjustment) {
    return db
      .newDb()
      .collection('inventoryStockAdjustments')
      .add(inventoryStockAdjustment);
  },
 localDbGetById(id: String) {
    return db
      .newDb()
      .collection('inventoryStockAdjustments')
      .doc({ id: id })
      .get();
  },
 localDbGetAll() {
    return db.newDb().collection('inventoryStockAdjustments').get();
  },
  localDbUpdate(inventoryStockAdjustment:  InventoryStockAdjustment) {
    return db
      .newDb()
      .collection('inventoryStockAdjustments')
      .doc({ id: inventoryStockAdjustment.id })
      .set(inventoryStockAdjustment);
  },

   localDbUpdateAll(inventoryStockAdjustments: InventoryStockAdjustment ) {
    return db
      .newDb()
      .collection('inventoryStockAdjustments')
      .set(inventoryStockAdjustments);
  },

   localDbDelete(inventoryStockAdjustment: InventoryStockAdjustment) {
    return db
      .newDb()
      .collection('inventoryStockAdjustments')
      .doc({ id: inventoryStockAdjustment.id })
      .delete();
  },

   localDbDeleteAll() {
    return db.newDb().collection('inventoryStockAdjustments').delete();
  }
,
   localDbDeleteById(id: String) {
    return db
      .newDb()
      .collection('inventoryStockAdjustments')
      .doc({ id: id })
      .delete();
  }
}
