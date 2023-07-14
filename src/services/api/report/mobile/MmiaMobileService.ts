import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import StockService from '../../stockService/StockService';
import InventoryStockAdjustmentService from '../../stockAdjustment/InventoryStockAdjustmentService';
import patientVisitService from '../../patientVisit/patientVisitService';
import DestroyedStockService from '../../destroyedStockService/DestroyedStockService';
import ReferedStockMovimentService from '../../referedStockMovimentService/ReferedStockMovimentService';
import drugService from '../../drugService/drugService';
import StockOperationTypeService from '../../stockOperationTypeService/StockOperationTypeService';
import MmiaStockReport from 'src/stores/models/report/pharmacyManagement/MmiaStockReport';
import MmiaRegimenSubReport from 'src/stores/models/report/pharmacyManagement/MmiaRegimenSubReport';
import MmiaReport from 'src/stores/models/report/pharmacyManagement/MmiaReport';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import therapeuticLineService from '../../therapeuticLineService/therapeuticLineService';


// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

    async getMmiaStockReport (params: any) {
        const reportParams = await ReportDatesParams.determineStartEndDate(params)
        console.log('PARAMETROSS STOCK:', reportParams)
        let resultDrugsStocks = []
        let resultDrugStocksInventory = []
        let resultDrugStocksDestruction = []
         let resultDrugStocksReferred = []
       // let resultDrugStockReferred = []
        let resultDrugPackaged = []
        let arrayDrugStock = []
     const stocks = await StockService.localDbGetUsedStock(params)
          console.log(stocks)
       const result = stocks.filter(stock => (stock.entrance.dateReceived >= reportParams.startDate && stock.entrance.dateReceived <= reportParams.endDate))
          console.log(result)
           resultDrugsStocks = this.groupedMap(result, 'drug_id')
          console.log(resultDrugsStocks)
          arrayDrugStock = Array.from(resultDrugsStocks.keys())
          console.log(arrayDrugStock)
         // return arrayDrugStock
        const inventoryStockAdjustments = await InventoryStockAdjustmentService.localDbGetAll()
            const inventoryStocks = inventoryStockAdjustments.filter(inventoryStock =>
              (inventoryStock.inventory.startDate >= reportParams.startDate && inventoryStock.inventory.endDate <= reportParams.endDate) && arrayDrugStock.includes(inventoryStock.adjustedStock.drug.id)
            )
            resultDrugStocksInventory = this.groupedMapChild(inventoryStocks, 'adjustedStock.drug.id')
            console.log(resultDrugStocksInventory)
           // return resultDrugStocksInventory

       const packs = await patientVisitService.localDbGetPacks()
            const packagedDrug = []
            const packsDate = packs.filter(pack =>
              (pack!==undefined && pack.pickupDate >= reportParams.startDate && pack.pickupDate <= reportParams.endDate))
              console.log(packsDate)
              packsDate.forEach(pack => {
                pack.packagedDrugs.forEach(item => {
                  packagedDrug.push(item)
                })
              })
              console.log(packagedDrug)
              resultDrugPackaged = this.groupedMapChildPack(packagedDrug, 'drug.id')
              console.log(resultDrugPackaged)
            //  return resultDrugPackaged
         const destroyedStocks = await DestroyedStockService.localDbGetAll()
            const adjustedDestroyedStocks = []
          let resultDestruccted = []
            console.log(destroyedStocks)
            resultDestruccted = destroyedStocks.filter(destroyedStock => (destroyedStock.date >= reportParams.startDate && destroyedStock.date <= reportParams.endDate))
            console.log(resultDestruccted)
            resultDestruccted.forEach(destroyedStock => {
            destroyedStock.adjustments.forEach(destroyedAdjust => {
              adjustedDestroyedStocks.push(destroyedAdjust)
            })
          })
          resultDrugStocksDestruction = this.groupedMapChildAdjustments(adjustedDestroyedStocks, 'adjustedStock')
          console.log(resultDrugStocksDestruction)
         //  return resultDrugStocksInventory
        const referredStocks = await ReferedStockMovimentService.localDbGetAll()
            const adjustedReferedStocks = []
          let resultAdjustedReferred = []
            console.log(referredStocks)
            resultAdjustedReferred = referredStocks.filter(referredStock => (referredStock.date >= reportParams.startDate && referredStock.date <= reportParams.endDate))
            console.log(resultAdjustedReferred)
            resultAdjustedReferred.forEach(referredStock => {
              referredStock.adjustments.forEach(referredAdjust => {
                adjustedReferedStocks.push(referredAdjust)
            })
          })
           resultDrugStocksReferred = this.groupedMapChildAdjustments(adjustedReferedStocks, 'adjustedStock')
          console.log(resultDrugStocksReferred)
          // return resultDrugStocksReferred
          const drugsIds = Array.from(resultDrugsStocks.keys())
          const stockDestructedIds = Array.from(resultDrugStocksDestruction.keys())
          const referredStocksIds = Array.from(resultDrugStocksReferred.keys())
          console.log(drugsIds)
          console.log(stockDestructedIds)
          console.log(referredStocksIds)
         for (const drugId of drugsIds) {
          const allDrugs = await drugService.getAllDrugs()
          const drugObj = allDrugs.filter(drug => drug.id === drugId)[0]
                const mmiaReport = new MmiaStockReport()
                mmiaReport.unit = drugObj.packSize
                mmiaReport.fnmCode = drugObj.fnmCode
                mmiaReport.drugName = drugObj.name
                console.log(resultDrugsStocks.get(drugObj.id))
                 mmiaReport.initialEntrance = 0
                 mmiaReport.lossesAdjustments = 0
               resultDrugsStocks.get(drugObj.id).forEach(stock => {
                mmiaReport.initialEntrance += stock.unitsReceived
                stockDestructedIds.forEach(drugStockDestruiction => {
                  if (drugStockDestruiction === stock.id) {
                    resultDrugStocksDestruction.get(drugStockDestruiction).forEach(destructionAdjustment => {
                    mmiaReport.lossesAdjustments -= destructionAdjustment.adjustedValue
                    })
                  }
                })
                referredStocksIds.forEach(drugStockReferredId => {
                  if (drugStockReferredId === stock.id) {
                    resultDrugStocksReferred.get(drugStockReferredId).forEach(referredAdjustment => {
                      if (this.getStockOperationTypeById(referredAdjustment.operation.id).code === 'AJUSTE_POSETIVO') {
                        mmiaReport.lossesAdjustments += referredAdjustment.adjustedValue
                      } else if (this.getStockOperationTypeById(referredAdjustment.operation.id).code === 'AJUSTE_NEGATIVO') {
                        mmiaReport.lossesAdjustments -= referredAdjustment.adjustedValue
                      }
                    })
                  }
                })
               })
               const maxDateObject = resultDrugsStocks.get(drugObj.id).reduce((maxObject, obj) => {
                      if (moment(obj.expireDate).format('YYYY/MM/DD') > moment(maxObject.expireDate).format('YYYY/MM/DD')) {
                        return obj
                      }
                      return maxObject
                    })
                   mmiaReport.expireDate = moment(maxDateObject.expireDate).format('DD-MM-YYYY')

              // console.log(resultDrugStocksInventory.get(drugObj.id))
              const inventoryAdjustmentList = resultDrugStocksInventory.get(drugObj.id) === undefined ? [] : resultDrugStocksInventory.get(drugObj.id)
               for (const inventoryAdjustment of inventoryAdjustmentList) {
                if (inventoryAdjustment.operation.code === 'AJUSTE_POSETIVO') {
                  mmiaReport.lossesAdjustments += inventoryAdjustment.adjustedValue
                } else if (inventoryAdjustment.operation.code === 'AJUSTE_NEGATIVO') {
                  mmiaReport.lossesAdjustments -= inventoryAdjustment.adjustedValue
                }
                }
                if (resultDrugPackaged.get(drugObj.id) !== undefined) {
                resultDrugPackaged.get(drugObj.id).forEach(drugPackaged => {
                mmiaReport.outcomes += drugPackaged.quantitySupplied
               })
               }
              mmiaReport.inventory = mmiaReport.initialEntrance + mmiaReport.lossesAdjustments + mmiaReport.outcomes
               console.log(mmiaReport)
               mmiaReport.reportId = reportParams.id
          // patientHistory.period = reportParams.periodTypeView
              mmiaReport.year = reportParams.year
              mmiaReport.endDate = reportParams.endDate
              mmiaReport.clinic = reportParams.clinic
               this.localDbAddOrUpdate(mmiaReport)
               }
        return reportParams
      },

      async getMmiaRegimenSubReport (reportParams:any) {
        const listRegimeReports = []
        // const reportParams = reportDatesParams.determineStartEndDate(params)
        const patientVisitList = await patientVisitService.localDbGetAllPatientVisit()
        for (const patientVisit of patientVisitList) {
          if ((patientVisit.visitDate >= reportParams.startDate && patientVisit.visitDate <= reportParams.endDate)) {
          for (const patientVisitDetail of patientVisit.patientVisitDetails) {

            if (patientVisitDetail.prescription!== undefined){
            const therapeuticRegimenObj =patientVisitDetail.prescription.prescriptionDetails[0].therapeuticRegimen
            const therapeuticalRegimen  = therapeuticalRegimenService.getById(therapeuticRegimenObj.id)

            const therapeuticLineObj =patientVisitDetail.prescription.prescriptionDetails[0].therapeuticLine
            const therapeuticalLine  = therapeuticLineService.getById(therapeuticLineObj.id)

            const regSubReport = new MmiaRegimenSubReport()
            regSubReport.reportId = reportParams.id
            regSubReport.code = therapeuticalRegimen.code
            regSubReport.regimen =therapeuticalRegimen.description
            regSubReport.lineCode =therapeuticalLine.code
            regSubReport.line = therapeuticalLine.description
            if (this.isReferido(patientVisitDetail)) {
              regSubReport.comunitaryClinic = Number(regSubReport.comunitaryClinic) + 1
            } else {
              regSubReport.totalPatients = Number(regSubReport.totalPatients) + 1
            }
            listRegimeReports.push(regSubReport)
            this.localDbAddOrUpdateReportRegimen(regSubReport)
          }
            }
          }
          }
          return listRegimeReports
      },
      async getMmiaReport (reportParams:any, listRegimenSubReport:any) {
       // const reportParams = reportDatesParams.determineStartEndDate(params)
        const patientVisitList = await patientVisitService.localDbGetAllPatientVisit()
        let totalDM = 0
        let totalDsM0 = 0
        let totalDtM0 = 0
        const curMmiaReport = new MmiaReport()
        for (const patientVisit of patientVisitList) {
          if ((patientVisit.visitDate >= reportParams.startDate && patientVisit.visitDate <= reportParams.endDate)) {
                  const patientVisitDetail = patientVisit.patientVisitDetails[0]
                    if (patientVisitDetail.episode.patientServiceIdentifier.service.code === 'PREP') {
                      curMmiaReport.totalPacientesPREP++
                    }
                    curMmiaReport.reportId = reportParams.id
                    const birthDate = moment(patientVisit.patient.dateOfBirth)
                    const age = moment(reportParams.endDate, 'YYYY/MM/DDDD').diff(birthDate, 'years')
                    console.log('IDADE', moment(reportParams.endDate, 'YYYY/MM/DDDD').diff(birthDate, 'years'))
                    if (age >= 18) {
                        curMmiaReport.totalPacientesAdulto++
                    } else if (age >= 0 && age <= 4) {
                      //  println(adult++)
                        curMmiaReport.totalPacientes04++
                    } else if (age >= 5 && age <= 9) {
                        curMmiaReport.totalPacientes59++
                    } else if (age >= 10 && age <= 14) {
                        curMmiaReport.totalPacientes1014++
                    }
                    if (patientVisitDetail.episode.startStopReason.code === 'NOVO') {
                        curMmiaReport.totalPacientesInicio++
                    } else if (patientVisitDetail.episode.startStopReason.code === 'MANUTENCAO') {
                        curMmiaReport.totalPacientesManter++
                    } else if (patientVisitDetail.episode.startStopReason.code === 'ALTERACAO') {
                        curMmiaReport.totalPacientesAlterar++
                    } else if (patientVisitDetail.episode.startStopReason.code === 'TRANSITO') {
                        curMmiaReport.totalPacientesTransito++
                    } else if (patientVisitDetail.prescription.patientType === 'TRANSFERENCIA') {
                        curMmiaReport.totalPacientesTransferido++
                    }

                    const detail = patientVisitDetail.prescription.prescriptionDetails[0]

                    for (const newRegimenSubReport of listRegimenSubReport) {
                      this.localDbAddOrUpdateReportRegimen(newRegimenSubReport)
                    }
                    if (detail.dispenseType.code === 'DM') {
                      totalDM++
                    } else if (detail.dispenseType.code === 'DT') {
                       totalDtM0++
                    } else if (detail.dispenseType.code === 'DS') {
                       totalDsM0++
                    }

            curMmiaReport.dsM1 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DS', reportParams.clinicalService, this.determineDate(reportParams.startDate, 1), this.determineDate(reportParams.endDate, 1))
            curMmiaReport.dsM2 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DS', reportParams.clinicalService, this.determineDate(reportParams.startDate, 2), this.determineDate(reportParams.endDate, 2))
            curMmiaReport.dsM3 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DS', reportParams.clinicalService, this.determineDate(reportParams.startDate, 3), this.determineDate(reportParams.endDate, 3))
            curMmiaReport.dsM4 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DS', reportParams.clinicalService, this.determineDate(reportParams.startDate, 4), this.determineDate(reportParams.endDate, 4))
            curMmiaReport.dsM5 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DS', reportParams.clinicalService, this.determineDate(reportParams.startDate, 5), this.determineDate(reportParams.endDate, 5))
            curMmiaReport.dtM1 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DT', reportParams.clinicalService, this.determineDate(reportParams.startDate, 1), this.determineDate(reportParams.endDate, 1))
            curMmiaReport.dtM2 = await patientVisitService.countPacksByDispenseTypeAndServiceOnPeriod('DT', reportParams.clinicalService, this.determineDate(reportParams.startDate, 2), this.determineDate(reportParams.endDate, 2))
            }
          }
          curMmiaReport.dM = totalDM
          curMmiaReport.dtM0 = totalDtM0
          curMmiaReport.dsM0 = totalDsM0
          this.localDbAddOrUpdateMmia(curMmiaReport)
          },

          
    determineDate (date: any, month: any) {
          return moment(date, 'DD-MM-YYYY').subtract(month, 'months')
          },
      isReferido (patientVisitDetail: any) {
       return patientVisitDetail.episode.startStopReason.code === 'TRANSFERIDO_DE'
      },
      groupedMap(items: any, key: any)  {
    return items.reduce(
        (entryMap, e) => entryMap.set(e[key], [...(entryMap.get(e[key]) || []), e], console.log(e[key])),
        new Map()
      )
    },
    groupedMapChild (items: any, key: any)  {
    return items.reduce(
        (entryMap, e) => entryMap.set(e.adjustedStock.drug.id, [...(entryMap.get(e.adjustedStock.drug.id) || []), e], console.log(e.adjustedStock.drug.id)),
        new Map()
      )
    },
    groupedMapChildPack (items: any, key: any)  {
    return items.reduce(
        (entryMap, e) => entryMap.set(e.drug.id, [...(entryMap.get(e.drug.id) || []), e], console.log(e.drug.id)),
        new Map()
      )
    },
    groupedMapChildAdjustments (items: any, key: any) {
    return items.reduce(
        (entryMap, e) => entryMap.set(e.adjustedStock.id, [...(entryMap.get(e.adjustedStock.id) || []), e], console.log(e.adjustedStock.id)),
        new Map()
      )
    },
    getStockOperationTypeById (id: any) {
        return StockOperationTypeService.getStockOperatinTypeById(id)
      },

     localDbAddOrUpdate (targetCopy: any) {
        nSQL('mmiaStockReports').query('upsert',
        targetCopy
      ).exec()
    },

     async localDbGetAllByReportId (reportId: any) {
      return nSQL('mmiaStockReports').query('select').where(['reportId', '=', reportId]).exec().then(result => {
        console.log(result)
        // Stock.insert({ data: result })
        return result
      })
    },

     localDbAddOrUpdateReportRegimen (targetCopy: any) {
        nSQL('mmiaRegimenSubReport').query('upsert',
        targetCopy
      ).exec()
    },

     localDbGetAllReportRegimenByReportId (reportId: any) {
      return nSQL('mmiaRegimenSubReport').query('select').where(['reportId', '=', reportId]).exec().then(result => {
        console.log(result)
        // Stock.insert({ data: result })
        return result
      })
    },

     createNewMmiaRegimenSubReport (detail: any, reportId: any, isReferido: any) {
      const mmiaRegimenSubReport = new MmiaRegimenSubReport()
      mmiaRegimenSubReport.reportId = reportId
      mmiaRegimenSubReport.code = detail.therapeuticRegimen.code
      mmiaRegimenSubReport.regimen = detail.therapeuticRegimen.description
      mmiaRegimenSubReport.lineCode = detail.getTherapeuticLine.code
      mmiaRegimenSubReport.line = detail.therapeuticLine.description
      isReferido ? mmiaRegimenSubReport.comunitaryClinic++ : mmiaRegimenSubReport.totalPatients++
      return mmiaRegimenSubReport
  },


  localDbAddOrUpdateMmia (targetCopy: any) {
    nSQL('mmiaReports').query('upsert',
    targetCopy
  ).exec()
},

 async localDbGetAllMmiaByReportId (reportId: any) {
  return nSQL('mmiaReports').query('select').where(['reportId', '=', reportId]).exec().then(result => {
    console.log(result)
    // Stock.insert({ data: result })
    return result[0]
  })
},


async getDataLocalReportStock (reportId: any) {
  return nSQL('mmiaStockReports').query('select').where(['reportId', '=', reportId]).exec().then(result => {
    console.log(result)
    // Stock.insert({ data: result })
    return result
  })
      
},
async getDataLocalReportRegimen (reportId: any) {
  return nSQL('mmiaRegimenSubReport').query('select').where(['reportId', '=', reportId]).exec().then(result => {
    console.log(result)
    // Stock.insert({ data: result })
    return result
  })
      
},
async getDataLocalReportMmia (reportId) {
  return nSQL('mmiaReports').query('select').where(['reportId', '=', reportId]).exec().then(result => {
    console.log(result)
    // Stock.insert({ data: result })
    return result[0]
  })
      
},


}