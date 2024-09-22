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
import prescriptionService from '../../prescription/prescriptionService';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import episodeService from '../../episode/episodeService';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import patientVisitDetailsService from '../../patientVisitDetails/patientVisitDetailsService';
import { uuid } from 'app/src-cordova/plugins/cordova-plugin-device/www/device';

const MmiaStockReportDexie = MmiaStockReport.entity;
const MmiaRegimenSubReportDexie = MmiaRegimenSubReport.entity;
const MmiaReportDexie = MmiaReport.entity;
// const activeInDrugStore = useRepo(ActiveInDrugStore);

export default {
  async getMmiaStockReport(params: any) {
    const reportParams = await ReportDatesParams.determineStartEndDate(params);
    console.log('PARAMETROSS STOCK:', reportParams);
    let resultDrugsStocks = [];
    let resultDrugStocksInventory = [];
    let resultDrugStocksDestruction = [];
    let resultDrugStocksReferred = [];
    // let resultDrugStockReferred = []
    let resultDrugPackaged = [];
    let arrayDrugStock = [];
    const stocks = await StockService.localDbGetAll();
    console.log(stocks);
    let result = stocks.filter(
      (stock: any) =>
        stock.drug.name !== null &&
        stock.drug.name !== undefined &&
        stock.drug.clinical_service_id === reportParams.clinicalService &&
        stock.entrance.dateReceived >= reportParams.startDate &&
        stock.entrance.dateReceived <= reportParams.endDate
    );
    console.log(result);
    if (result.length === 0) {
      result = stocks.filter(
        (stock: any) =>
          stock.drug.name !== null &&
          stock.drug.name !== undefined &&
          stock.drug.clinical_service_id === reportParams.clinicalService
      );
    }
    resultDrugsStocks = this.groupedMap(result, 'drug_id');
    console.log(resultDrugsStocks);
    arrayDrugStock = Array.from(resultDrugsStocks.keys());
    console.log(arrayDrugStock);
    // return arrayDrugStock
    const inventoryStockAdjustments =
      await InventoryStockAdjustmentService.localDbGetAll();
    const inventoryStocks = inventoryStockAdjustments.filter(
      (inventoryStock) =>
        inventoryStock.inventory.startDate >= reportParams.startDate &&
        inventoryStock.inventory.endDate <= reportParams.endDate &&
        arrayDrugStock.includes(inventoryStock.adjustedStock.drug.id)
    );
    resultDrugStocksInventory = this.groupedMapChild(
      inventoryStocks,
      'adjustedStock.drug.id'
    );
    console.log(resultDrugStocksInventory);
    // return resultDrugStocksInventory

    const packs = await patientVisitService.localDbGetPacks();
    const packagedDrug = [];
    const packsDate = packs.filter(
      (pack) =>
        pack !== undefined &&
        pack.pickupDate >= reportParams.startDate &&
        pack.pickupDate <= reportParams.endDate
    );
    console.log(packsDate);
    packsDate.forEach((pack) => {
      pack.packagedDrugs.forEach((item) => {
        packagedDrug.push(item);
      });
    });
    console.log(packagedDrug);
    resultDrugPackaged = this.groupedMapChildPack(packagedDrug, 'drug.id');
    console.log(resultDrugPackaged);
    //  return resultDrugPackaged
    const destroyedStocks =
      await DestroyedStockService.getDestroyedStocksMobile();
    const adjustedDestroyedStocks = [];
    let resultDestruccted = [];
    console.log(destroyedStocks);
    resultDestruccted = destroyedStocks.filter(
      (destroyedStock) =>
        destroyedStock.date >= reportParams.startDate &&
        destroyedStock.date <= reportParams.endDate
    );
    console.log(resultDestruccted);
    resultDestruccted.forEach((destroyedStock) => {
      destroyedStock.adjustments.forEach((destroyedAdjust) => {
        adjustedDestroyedStocks.push(destroyedAdjust);
      });
    });
    resultDrugStocksDestruction = this.groupedMapChildAdjustments(
      adjustedDestroyedStocks,
      'adjustedStock'
    );
    console.log(resultDrugStocksDestruction);
    //  return resultDrugStocksInventory
    const referredStocks =
      await ReferedStockMovimentService.getReferedStockMovimentsMobile();
    const adjustedReferedStocks = [];
    let resultAdjustedReferred = [];
    console.log(referredStocks);
    resultAdjustedReferred = referredStocks.filter(
      (referredStock) =>
        referredStock.date >= reportParams.startDate &&
        referredStock.date <= reportParams.endDate
    );
    console.log(resultAdjustedReferred);
    resultAdjustedReferred.forEach((referredStock) => {
      referredStock.adjustments.forEach((referredAdjust) => {
        adjustedReferedStocks.push(referredAdjust);
      });
    });
    resultDrugStocksReferred = this.groupedMapChildAdjustments(
      adjustedReferedStocks,
      'adjustedStock'
    );
    console.log(resultDrugStocksReferred);
    // return resultDrugStocksReferred
    const drugsIds = Array.from(resultDrugsStocks.keys());
    const stockDestructedIds = Array.from(resultDrugStocksDestruction.keys());
    const referredStocksIds = Array.from(resultDrugStocksReferred.keys());
    console.log(drugsIds);
    console.log(stockDestructedIds);
    console.log(referredStocksIds);
    for (const drugId of drugsIds) {
      const allDrugs = await drugService.getAllDrugs();
      const drugObj = allDrugs.filter((drug) => drug.id === drugId)[0];
      const mmiaReport = new MmiaStockReport();
      mmiaReport.unit = drugObj.packSize;
      mmiaReport.fnmCode = drugObj.fnmCode;
      mmiaReport.drugName = drugObj.name;
      console.log(resultDrugsStocks.get(drugObj.id));
      mmiaReport.initialEntrance = Number(0);
      mmiaReport.lossesAdjustments = Number(0);
      resultDrugsStocks.get(drugObj.id).forEach((stock) => {
        mmiaReport.initialEntrance += Number(stock.unitsReceived);
        stockDestructedIds.forEach((drugStockDestruiction) => {
          if (drugStockDestruiction === stock.id) {
            resultDrugStocksDestruction
              .get(drugStockDestruiction)
              .forEach((destructionAdjustment) => {
                mmiaReport.lossesAdjustments -=
                  destructionAdjustment.adjustedValue;
              });
          }
        });
        referredStocksIds.forEach((drugStockReferredId) => {
          if (drugStockReferredId === stock.id) {
            resultDrugStocksReferred
              .get(drugStockReferredId)
              .forEach((referredAdjustment) => {
                if (
                  this.getStockOperationTypeById(
                    referredAdjustment.operation.id
                  ).code === 'AJUSTE_POSETIVO'
                ) {
                  mmiaReport.lossesAdjustments +=
                    referredAdjustment.adjustedValue;
                } else if (
                  this.getStockOperationTypeById(
                    referredAdjustment.operation.id
                  ).code === 'AJUSTE_NEGATIVO'
                ) {
                  mmiaReport.lossesAdjustments -=
                    referredAdjustment.adjustedValue;
                }
              });
          }
        });
      });
      const maxDateObject = resultDrugsStocks
        .get(drugObj.id)
        .reduce((maxObject, obj) => {
          if (
            moment(obj.expireDate).format('YYYY/MM/DD') >
            moment(maxObject.expireDate).format('YYYY/MM/DD')
          ) {
            return obj;
          }
          return maxObject;
        });
      mmiaReport.expireDate = moment(maxDateObject.expireDate).format(
        'DD-MM-YYYY'
      );

      // console.log(resultDrugStocksInventory.get(drugObj.id))
      const inventoryAdjustmentList =
        resultDrugStocksInventory.get(drugObj.id) === undefined
          ? []
          : resultDrugStocksInventory.get(drugObj.id);
      for (const inventoryAdjustment of inventoryAdjustmentList) {
        if (inventoryAdjustment.operation.code === 'AJUSTE_POSETIVO') {
          mmiaReport.lossesAdjustments += inventoryAdjustment.adjustedValue;
        } else if (inventoryAdjustment.operation.code === 'AJUSTE_NEGATIVO') {
          mmiaReport.lossesAdjustments -= inventoryAdjustment.adjustedValue;
        }
      }
      if (resultDrugPackaged.get(drugObj.id) !== undefined) {
        resultDrugPackaged.get(drugObj.id).forEach((drugPackaged) => {
          mmiaReport.outcomes += drugPackaged.quantitySupplied;
        });
      }
      mmiaReport.inventory =
        Number(mmiaReport.initialEntrance) +
        Number(mmiaReport.lossesAdjustments) +
        Number(mmiaReport.outcomes);
      mmiaReport.reportId = reportParams.id;
      // patientHistory.period = reportParams.periodTypeView
      mmiaReport.year = reportParams.year;
      mmiaReport.endDate = reportParams.endDate;
      // mmiaReport.clinic = reportParams.clinic;
      mmiaReport.id = uuidv4();
      console.log(mmiaReport);
      this.localDbAddOrUpdateStockReport(mmiaReport);
    }
    return reportParams;
  },

  async getMmiaRegimenSubReport(reportParams: any) {
    const listRegimeReports = [];
    const listGroupTotalsRegimeReports = [];
    // const reportParams = reportDatesParams.determineStartEndDate(params)
    const patientVisitList =
      await patientVisitService.localDbGetAllPatientVisit();
    for (const patientVisit of patientVisitList) {
      if (
        patientVisit.visitDate >= reportParams.startDate &&
        patientVisit.visitDate <= reportParams.endDate &&
        patientVisit.syncStatus !== undefined &&
        patientVisit.patientVisitDetails.length > 0
      ) {
        console.log(patientVisit);
        for (const patientVisitDetail of patientVisit.patientVisitDetails) {
          let prescription = patientVisitDetail.prescription;
          const episode = await episodeService.apiFetchById(
            patientVisitDetail.episode.id
          );
          if (prescription !== undefined) {
            if (
              prescription.prescriptionDate === null ||
              prescription.prescriptionDate === undefined
            ) {
              prescription =
                await prescriptionService.getPrescriptionMobileById(
                  prescription.id
                );
            }

            const therapeuticRegimenObj =
              prescription.prescriptionDetails[0].therapeuticRegimen;
            const therapeuticalRegimen = therapeuticalRegimenService.getById(
              therapeuticRegimenObj.id
            );

            const therapeuticLineObj =
              prescription.prescriptionDetails[0].therapeuticLine;
            const therapeuticalLine = therapeuticLineService.getById(
              therapeuticLineObj.id
            );

            const regSubReport = new MmiaRegimenSubReport();
            regSubReport.id = uuidv4();
            regSubReport.reportId = reportParams.id;
            regSubReport.code = therapeuticalRegimen.code;
            regSubReport.regimen = therapeuticalRegimen.description;
            regSubReport.lineCode = therapeuticalLine.code;
            regSubReport.line = therapeuticalLine.description;
            regSubReport.comunitaryClinic = 0;
            regSubReport.totalPatients = 0;
            if (this.isReferido(episode)) {
              regSubReport.comunitaryClinic =
                Number(regSubReport.comunitaryClinic) + 1;
            } else {
              regSubReport.totalPatients =
                Number(regSubReport.totalPatients) + 1;
            }
            listRegimeReports.push(regSubReport);
            console.log(regSubReport);
            //   this.localDbAddOrUpdateReportRegimen(regSubReport);
          }
        }
      }
    }
    const groupedMap = listRegimeReports.reduce((acc, curr) => {
      // Check if the regimenCode already exists in the map
      if (!acc.has(curr.code)) {
        // If not, add a new entry with the current object's values
        acc.set(curr.code, {
          code: curr.code,
          regimen: curr.regimen,
          lineCode: curr.lineCode,
          line: curr.line,
          totalPatients: Number(curr.totalPatients),
          comunitaryClinic: Number(curr.comunitaryClinic),
        });
      } else {
        // If it exists, update the sum of totalPatients and comunitaryClinic
        const existing = acc.get(curr.code);
        existing.totalPatients += Number(curr.totalPatients);
        existing.comunitaryClinic += Number(curr.comunitaryClinic);
        existing.regimen = curr.regimen;
        existing.lineCode = curr.lineCode;
        existing.line = curr.line;
      }
      return acc;
    }, new Map());
    const groupedArray = Array.from(groupedMap.values());
    console.log(groupedArray);
    return listRegimeReports;
  },
  async getMmiaReport(reportParams: any, listRegimenSubReport: any) {
    // const reportParams = reportDatesParams.determineStartEndDate(params)
    const patientVisitList =
      await patientVisitService.localDbGetAllPatientVisit();
    let totalDM = 0;
    let totalDsM0 = 0;
    let totalDtM0 = 0;
    const curMmiaReport = new MmiaReport();
    for (const patientVisit of patientVisitList) {
      if (
        patientVisit.visitDate >= reportParams.startDate &&
        patientVisit.visitDate <= reportParams.endDate &&
        patientVisit.syncStatus !== undefined &&
        patientVisit.patientVisitDetails.length > 0
      ) {
        const patientVisitDetail = patientVisit.patientVisitDetails[0];
        const episode = await episodeService.apiFetchById(
          patientVisitDetail.episode.id
        );
        const service = await clinicalServiceService.localDbGetById(
          episode.patientServiceIdentifier.service.id
        );

        if (service.code === 'PREP') {
          curMmiaReport.totalPacientesPREP++;
        }
        curMmiaReport.reportId = reportParams.id;
        const birthDate = moment(patientVisit.patient.dateOfBirth);
        const age = moment(reportParams.endDate, 'YYYY/MM/DDDD').diff(
          birthDate,
          'years'
        );
        console.log(
          'IDADE',
          moment(reportParams.endDate, 'YYYY/MM/DDDD').diff(birthDate, 'years')
        );
        if (age >= 18) {
          curMmiaReport.totalPacientesAdulto++;
        } else if (age >= 0 && age <= 4) {
          //  println(adult++)
          curMmiaReport.totalPacientes04++;
        } else if (age >= 5 && age <= 9) {
          curMmiaReport.totalPacientes59++;
        } else if (age >= 10 && age <= 14) {
          curMmiaReport.totalPacientes1014++;
        }
        if (
          episode.startStopReason.code === 'NOVO' ||
          episode.startStopReason.code === 'NOVO_PACIENTE'
        ) {
          curMmiaReport.totalPacientesInicio++;
        } else if (episode.startStopReason.code === 'MANUTENCAO') {
          curMmiaReport.totalPacientesManter++;
        } else if (episode.startStopReason.code === 'ALTERACAO') {
          curMmiaReport.totalPacientesAlterar++;
        } else if (episode.startStopReason.code === 'TRANSITO') {
          curMmiaReport.totalPacientesTransito++;
        } else if (
          patientVisitDetail.prescription.patientType === 'TRANSFERENCIA'
        ) {
          curMmiaReport.totalPacientesTransferido++;
        }

        let prescription = patientVisitDetail.prescription;
        if (prescription !== undefined) {
          if (
            prescription.prescriptionDate === null ||
            prescription.prescriptionDate === undefined
          ) {
            prescription = await prescriptionService.getPrescriptionMobileById(
              prescription.id
            );
          }
        }
        const detail = prescription.prescriptionDetails[0];

        for (const newRegimenSubReport of listRegimenSubReport) {
          this.localDbAddOrUpdateReportRegimen(newRegimenSubReport);
        }
        if (detail.dispenseType.code === 'DM') {
          totalDM++;
        } else if (detail.dispenseType.code === 'DT') {
          totalDtM0++;
        } else if (detail.dispenseType.code === 'DS') {
          totalDsM0++;
        }

        curMmiaReport.dsM1 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DS',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 1),
            this.determineDate(reportParams.endDate, 1)
          );
        curMmiaReport.dsM2 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DS',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 2),
            this.determineDate(reportParams.endDate, 2)
          );
        curMmiaReport.dsM3 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DS',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 3),
            this.determineDate(reportParams.endDate, 3)
          );
        curMmiaReport.dsM4 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DS',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 4),
            this.determineDate(reportParams.endDate, 4)
          );
        curMmiaReport.dsM5 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DS',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 5),
            this.determineDate(reportParams.endDate, 5)
          );
        curMmiaReport.dtM1 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DT',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 1),
            this.determineDate(reportParams.endDate, 1)
          );
        curMmiaReport.dtM2 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DT',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 2),
            this.determineDate(reportParams.endDate, 2)
          );

        curMmiaReport.dbM0 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DB',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 1),
            this.determineDate(reportParams.endDate, 1)
          );

        curMmiaReport.dbM1 =
          await patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
            'DB',
            reportParams.clinicalService,
            this.determineDate(reportParams.startDate, 2),
            this.determineDate(reportParams.endDate, 2)
          );
      }
    }
    curMmiaReport.dM = totalDM;
    curMmiaReport.dtM0 = totalDtM0;
    curMmiaReport.dsM0 = totalDsM0;
    curMmiaReport.id = uuidv4();
    this.localDbAddOrUpdateMmia(curMmiaReport);
  },

  determineDate(date: any, month: any) {
    return moment(date, 'DD-MM-YYYY').subtract(month, 'months');
  },
  isReferido(episode: any) {
    return episode.startStopReason.code === 'TRANSFERIDO_DE';
  },
  groupedMap(items: any, key: any) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e[key],
          [...(entryMap.get(e[key]) || []), e],
          console.log(e[key])
        ),
      new Map()
    );
  },
  groupedMapChild(items: any, key: any) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e.adjustedStock.drug.id,
          [...(entryMap.get(e.adjustedStock.drug.id) || []), e],
          console.log(e.adjustedStock.drug.id)
        ),
      new Map()
    );
  },
  groupedMapChildPack(items: any, key: any) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e.drug.id,
          [...(entryMap.get(e.drug.id) || []), e],
          console.log(e.drug.id)
        ),
      new Map()
    );
  },
  groupedMapChildAdjustments(items: any, key: any) {
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(
          e.adjustedStock.id,
          [...(entryMap.get(e.adjustedStock.id) || []), e],
          console.log(e.adjustedStock.id)
        ),
      new Map()
    );
  },
  getStockOperationTypeById(id: any) {
    return StockOperationTypeService.getStockOperatinTypeById(id);
  },

  localDbAddOrUpdateStockReport(data: any) {
    return db[MmiaStockReportDexie].put(data).catch((error: any) => {
      console.log(error);
    });
  },

  async getDataLocalReportStock(reportId: any) {
    return db[MmiaStockReportDexie].where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },

  localDbAddOrUpdateReportRegimen(data: any) {
    return db[MmiaRegimenSubReportDexie].put(data).catch((error: any) => {
      console.log(error);
    });
  },

  getDataLocalReportRegimen(reportId: any) {
    return db[MmiaRegimenSubReportDexie].where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },

  createNewMmiaRegimenSubReport(detail: any, reportId: any, isReferido: any) {
    const mmiaRegimenSubReport = new MmiaRegimenSubReport();
    mmiaRegimenSubReport.reportId = reportId;
    mmiaRegimenSubReport.code = detail.therapeuticRegimen.code;
    mmiaRegimenSubReport.regimen = detail.therapeuticRegimen.description;
    mmiaRegimenSubReport.lineCode = detail.getTherapeuticLine.code;
    mmiaRegimenSubReport.line = detail.therapeuticLine.description;
    isReferido
      ? mmiaRegimenSubReport.comunitaryClinic++
      : mmiaRegimenSubReport.totalPatients++;
    return mmiaRegimenSubReport;
  },

  localDbAddOrUpdateMmia(data: any) {
    return db[MmiaReportDexie].put(data).catch((error: any) => {
      console.log(error);
    });
  },

  async getDataLocalReportMmia(reportId: any) {
    return db[MmiaReportDexie].where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
