

export function useStockAdjustment() {
  // Axios API call
 
  // Local Storage Pinia

 function isPosetiveAdjustment(stockAdjustment: any) {
    return stockAdjustment.operation.code === 'AJUSTE_POSETIVO';
  }

  function isNegativeAdjustment(stockAdjustment: any) {
    return stockAdjustment.operation.code === 'AJUSTE_NEGATIVO';
  }

  return {
    isPosetiveAdjustment,
    isNegativeAdjustment
  }


};