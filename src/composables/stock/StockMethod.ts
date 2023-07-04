import { date } from 'quasar';
import { nSQL } from 'nano-sql';
import { v4 as uuidv4 } from 'uuid';


export function useStock () {


  function isInUse(stock: any) {
    return (
      (stock.packagedDrugStocks !== undefined &&
        stock.packagedDrugStocks.length > 0) ||
        stock.adjustments.length > 0
    );
  }

  function getFormatedExpireDate(stock: any) {
    return date.formatDate(stock.expireDate);
  }

  function formatDate(dateString: any) {
    return date.formatDate(dateString, 'DD-MM-YYYY');
  }

  function  getClassName() {
    return 'stock';
  }
    
    
// Drug File




 function localDbGetStockBalanceByDrug (drug: any) {
  let balance = 0
  return nSQL('stocks').query('select').where(['drug_id', '=', drug.id]).exec().then(result => {
   console.log(result)
   for (const item of result) {
    balance +=Number( item.stockMoviment)
   // Stock.insert({ data: result })
   }
   return balance
  })
  }
  
   function localDbGetQuantitySuppliedByDrug (drug: any) {
  let drugQuantitySupplied = 0
  return nSQL('patientVisits').query('select', ['patientVisitDetails']).
  exec().then(result => {
  for (const pvd of result) {
     for (const pvdObj of pvd.patientVisitDetails) {
    // if (pvd.pack.pickupDate > new Date()) {
      if (pvdObj.pack !== undefined) {
      for (const pcd of pvdObj.pack.packagedDrugs) {
          if (pcd.drug_id === drug.id) {
            drugQuantitySupplied += Number(pcd.quantitySupplied)
          }
        }
    }
  }
  // }
  }
  return drugQuantitySupplied
  })
  }
  // Resumo por drug
  
   function getDestructionsDrugFile (drug: any) {
          const recordFileList = []
          return nSQL('destroyedStocks').query('select')
          .exec().then(result => {
          for (const item of result) {
          const recordFile = {}
          for (const adjustment of item.adjustments) {
            if (adjustment.adjustedStock.drug_id === drug.id) {
              recordFile.id = uuidv4()
              recordFile.eventDate = item.date
              recordFile.moviment = 'Perda'
              recordFile.orderNumber = ''
              recordFile.incomes = 0
              recordFile.outcomes = 0
              recordFile.posetiveAdjustment = 0
              recordFile.negativeAdjustment = 0
              recordFile.loses = Number(adjustment.adjustedValue)
              recordFile.balance = 0
              recordFile.code = adjustment.operation.code
              recordFile.stockId = ''
              recordFile.notes = ''
              recordFileList.push(recordFile)
            }
          }
          /*
          */
          }
          return recordFileList
          })
  }
  
   function getAdjustmentsDrugFile (drug: any) {
          const recordFileList = []
          return nSQL('referedStockMoviments').query('select')
          .exec().then(result => {
          for (const item of result) {
          const recordFile = {}
          for (const adjustment of item.adjustments) {
            if (adjustment.adjustedStock.drug_id === drug.id && (adjustment.operation.code === 'AJUSTE_POSETIVO' || adjustment.operation.code === 'AJUSTE_NEGATIVO')) {
              recordFile.id = uuidv4()
              recordFile.eventDate = item.date
              recordFile.moviment = adjustment.operation.code === 'AJUSTE_POSETIVO' ? 'Ajuste Posetivo' : 'Ajuste Negativo'
              recordFile.orderNumber = ''
              recordFile.incomes = 0
              recordFile.outcomes = 0
              recordFile.posetiveAdjustment = adjustment.operation.code === 'AJUSTE_POSETIVO' ? adjustment.adjustedValue : 0
              recordFile.negativeAdjustment = adjustment.operation.code === 'AJUSTE_NEGATIVO' ? adjustment.adjustedValue : 0
              recordFile.loses = 0
              recordFile.balance = 0
              recordFile.code = adjustment.operation.code
              recordFile.stockId = ''
              recordFile.notes = ''
              recordFileList.push(recordFile)
            }
          }
          /*
          */
          }
          return recordFileList
          })
  }
  
   function getInventoryAdjustmentsDrugFile (drug: any) {
          const recordFileList = []
          return nSQL('inventoryStockAdjustments').query('select')
          .exec().then(result => {
          for (const adjustment of result) {
          const recordFile = {}
            if (adjustment.adjustedStock.drug_id === drug.id && (adjustment.operation.code === 'AJUSTE_POSETIVO' || adjustment.operation.code === 'AJUSTE_NEGATIVO')) {
              recordFile.id = uuidv4()
              recordFile.eventDate = adjustment.captureDate
              recordFile.moviment = 'Inventário'
              recordFile.orderNumber = ''
              recordFile.incomes = 0
              recordFile.outcomes = 0
              recordFile.posetiveAdjustment = adjustment.operation.code === 'AJUSTE_POSETIVO' ? adjustment.adjustedValue : 0
              recordFile.negativeAdjustment = adjustment.operation.code === 'AJUSTE_NEGATIVO' ? adjustment.adjustedValue : 0
              recordFile.loses = 0
              recordFile.balance = 0
              recordFile.code = adjustment.operation.code
              recordFile.stockId = ''
              recordFile.notes = ''
              recordFileList.push(recordFile)
            }
          /*
          */
          }
          return recordFileList
          })
  }
  
   function getEntrancesDrugFile (drug: any) {
          const recordFileList = []
          return nSQL('stocks').query('select', ['SUM(stocks.unitsReceived) AS stockEntrances.incomes', 'stockEntrances.dateReceived', 'stockEntrances.orderNumber']).where(['drug_id', '=', drug.id])
          .join({
          type: 'inner',
          table: 'stockEntrances',
          where: ['stocks.entrance_id', '=', 'stockEntrances.id']
          })
          .exec().then(result => {
          for (const item of result) {
          const recordFile = {}
          recordFile.id = uuidv4()
          recordFile.eventDate = item['stockEntrances.dateReceived']
          recordFile.moviment = 'Entrada de Stock'
          recordFile.orderNumber = item['stockEntrances.orderNumber']
          recordFile.incomes = Number(item['stockEntrances.incomes'])
          recordFile.outcomes = 0
          recordFile.posetiveAdjustment = 0
          recordFile.negativeAdjustment = 0
          recordFile.loses = 0
          recordFile.balance = 0
          recordFile.code = 'ENTRADA'
          recordFile.stockId = ''
          recordFile.notes = ''
  
          recordFileList.push(recordFile)
          /*
          */
          }
          return recordFileList
          })
  }
  
   function getPacksDrugFile (drug: any) {
          const recordFileList = []
          let drugQuantitySupplied = 0
          return nSQL('patientVisits').query('select', ['patientVisitDetails']).exec().then(result => {
            for (const pvd of result) {
              for (const pvdObj of pvd.patientVisitDetails) {
              if ( pvdObj.pack !==undefined ) {
                for (const pcd of pvdObj.pack.packagedDrugs) {
                  if (pcd.drug_id === drug.id) {
                    const recordFile = {}
                  for (const pcdStockObj of pcd.packagedDrugStocks) {
                      drugQuantitySupplied += Number(pcdStockObj.quantitySupplied)
                    }
                  recordFile.id = uuidv4()
                  recordFile.eventDate = pvdObj.pack.pickupDate
                  recordFile.moviment = 'Saídas'
                  recordFile.orderNumber = ''
                  recordFile.incomes = 0
                  recordFile.outcomes = drugQuantitySupplied
                  recordFile.posetiveAdjustment = 0
                  recordFile.negativeAdjustment = 0
                  recordFile.loses = 0
                  recordFile.balance = 0
                  recordFile.code = 'SAIDA'
                  recordFile.notes = ''
                  recordFileList.push(recordFile)
                }
            }
           }
          }
          }
          return recordFileList
          })
  }
  
  // Resumo por Stock
  
   function getDestructionsDrugFileBatch ( stockId: any) {
          const recordFileList = []
          return nSQL('destroyedStocks').query('select')
          .exec().then(result => {
          for (const item of result) {
            const recordFile = {}
            for (const adjustment of item.adjustments) {
              if (adjustment.adjustedStock.id === stockId) {
                recordFile.id = uuidv4()
                recordFile.eventDate = item.date
                recordFile.moviment = 'Perda'
                recordFile.orderNumber = ''
                recordFile.incomes = 0
                recordFile.outcomes = 0
                recordFile.posetiveAdjustment = 0
                recordFile.negativeAdjustment = 0
                recordFile.loses = adjustment.adjustedValue
                recordFile.balance = 0
                recordFile.code = adjustment.operation.code
                recordFile.stockId = ''
                recordFile.notes = ''
                recordFileList.push(recordFile)
              }
            }
            /*
            */
          }
          return recordFileList
          })
          }
  
    function getAdjustmentsDrugFileBatch (stockId: any) {
          const recordFileList = []
          return nSQL('referedStockMoviments').query('select')
          .exec().then(result => {
          for (const item of result) {
            const recordFile = {}
            for (const adjustment of item.adjustments) {
              if (adjustment.adjustedStock.id === stockId && (adjustment.operation.code === 'AJUSTE_POSETIVO' || adjustment.operation.code === 'AJUSTE_NEGATIVO')) {
                recordFile.id = uuidv4()
                recordFile.eventDate = item.date
                recordFile.moviment = adjustment.operation.code === 'AJUSTE_POSETIVO' ? 'Ajuste Posetivo' : 'Ajuste Negativo'
                recordFile.orderNumber = ''
                recordFile.incomes = 0
                recordFile.outcomes = 0
                recordFile.posetiveAdjustment = adjustment.operation.code === 'AJUSTE_POSETIVO' ? adjustment.adjustedValue : 0
                recordFile.negativeAdjustment = adjustment.operation.code === 'AJUSTE_NEGATIVO' ? adjustment.adjustedValue : 0
                recordFile.loses = 0
                recordFile.balance = 0
                recordFile.code = adjustment.operation.code
                recordFile.stockId = ''
                recordFile.notes = ''
                recordFileList.push(recordFile)
              }
            }
            /*
            */
          }
          return recordFileList
          })
          }
  
          function getInventoryAdjustmentsDrugFileBatch (stockId: any) {
          const recordFileList = []
          return nSQL('inventoryStockAdjustments').query('select')
          .join({
            type: 'inner',
            table: 'inventorys',
            where: ['inventoryStockAdjustments.inventory_id', '=', 'inventorys.id']
          })
          .exec().then(result => {
          for (const adjustment of result) {
            const recordFile = {}
              if (adjustment['inventoryStockAdjustments.adjustedStock'].id === stockId) {
                recordFile.id = uuidv4()
                recordFile.eventDate = adjustment['inventoryStockAdjustments.captureDate']
                recordFile.moviment = 'Inventário'
                recordFile.orderNumber = ''
                recordFile.incomes = 0
                recordFile.outcomes = 0
                recordFile.posetiveAdjustment = adjustment['inventoryStockAdjustments.operation'].code === 'AJUSTE_POSETIVO' ? adjustment['inventoryStockAdjustments.adjustedValue'] : 0
                recordFile.negativeAdjustment = adjustment['inventoryStockAdjustments.operation'].code === 'AJUSTE_NEGATIVO' ? adjustment['inventoryStockAdjustments.adjustedValue'] : 0
                recordFile.loses = 0
                recordFile.balance = 0
                recordFile.code = adjustment['inventoryStockAdjustments.operation'].code
                recordFile.stockId = ''
                recordFile.notes = ''
                recordFileList.push(recordFile)
              }
            /*
            */
          }
          return recordFileList
          })
          }
  
    function getEntrancesDrugFileBatch (stockId: string) {
      console.log('STOCKID: ', stockId)
          const recordFileList = []
  
          return nSQL('stocks').query('select',  ['SUM(stocks.unitsReceived) AS incomes', 'stocks.id', 'stockEntrances.dateReceived', 'stockEntrances.orderNumber'])
          .where(['id', 'LIKE', stockId])
          .join({
            type: 'inner',
            table: 'stockEntrances',
            where: ['stocks.entrance_id', '=', 'stockEntrances.id']
          })
          .exec().then(result => {
          for (const item of result) {
            if (item['stockEntrances.orderNumber'] !== undefined ) {
            const recordFile = {}
            recordFile.id = uuidv4()
            recordFile.eventDate = item['stockEntrances.dateReceived']
            recordFile.moviment = 'Entrada de Stock'
            recordFile.orderNumber = item['stockEntrances.orderNumber']
            recordFile.incomes = Number(item['incomes'])
            recordFile.outcomes = 0
            recordFile.posetiveAdjustment = 0
            recordFile.negativeAdjustment = 0
            recordFile.loses = 0
            recordFile.balance = 0
            recordFile.code = 'ENTRADA'
            recordFile.stockId = item['stocks.id']
            recordFile.notes = ''
  
            recordFileList.push(recordFile)
            /*
            */
          }
        }
          return recordFileList
          })
  }
  
   function getPacksDrugFileBatch (stockId: any) {
            const recordFileList = []
            let drugQuantitySupplied = 0
            return nSQL('patientVisits').query('select', ['patientVisitDetails'])
            .exec().then(result => {
              for (const pvd of result) {
                for (const pvdObj of pvd.patientVisitDetails) {
                // if (pvd.pack.pickupDate > new Date()) {
                  if (pvdObj.pack !== undefined) {
                  for (const pcd of pvdObj.pack.packagedDrugs) {
                    for (const pcdStockObj of pcd.packagedDrugStocks) {
                      if (pcdStockObj.stock_id === stockId) {
                            const recordFile = {}
                            drugQuantitySupplied += Number(pcd.quantitySupplied)
                            recordFile.stockId = pcdStockObj.stock_id
                            recordFile.id = uuidv4()
                            recordFile.eventDate = pvdObj.pack.pickupDate
                            recordFile.moviment = 'Saídas'
                            recordFile.orderNumber = ''
                            recordFile.incomes = 0
                            recordFile.outcomes = drugQuantitySupplied
                            recordFile.posetiveAdjustment = 0
                            recordFile.negativeAdjustment = 0
                            recordFile.loses = 0
                            recordFile.balance = 0
                            recordFile.code = 'SAIDA'
                            recordFile.notes = ''
                            recordFileList.push(recordFile)
                      }
                  }
              }
            }
            // }
            }
            }
            return recordFileList
            })
  }
 
  return {
    isInUse,
    getFormatedExpireDate,
    formatDate,
    getClassName,
    localDbGetStockBalanceByDrug,
    localDbGetQuantitySuppliedByDrug,
    getDestructionsDrugFile,
    getAdjustmentsDrugFile,
    getInventoryAdjustmentsDrugFile,
    getEntrancesDrugFile,
    getPacksDrugFile,
    getDestructionsDrugFileBatch,
    getAdjustmentsDrugFileBatch,
    getInventoryAdjustmentsDrugFileBatch,
    getEntrancesDrugFileBatch,
    getPacksDrugFileBatch
  }
}
