
import { get } from 'http';
import db from 'src/stores/localbase';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import { useRepo } from 'pinia-orm';

const inventoryStockAdjustment = useRepo(InventoryStockAdjustment);

export function useInventoryStockAdjustment() {
  
  function isPosetiveAdjustment(stockAdjustment: any) {
    return stockAdjustment.operation.code === 'AJUSTE_POSETIVO';
  }

  function isNegativeAdjustment(stockAdjustment: any) {
    return stockAdjustment.operation.code === 'AJUSTE_NEGATIVO';
  }
 
  function getInventoryStockAdjustmentById (idStock: string, inventoryId: string) {
   return  inventoryStockAdjustment.query().with('adjustedStock')
                                    .with('inventory')
                                    .with('clinic')
                                    .with('operation')
                                    .where('inventory_id', inventoryId)
                                    .where('adjusted_stock_id', idStock)
                                          .first();

  }

  return {
    getInventoryStockAdjustmentById,
    isPosetiveAdjustment,
    isNegativeAdjustment

  }

}
