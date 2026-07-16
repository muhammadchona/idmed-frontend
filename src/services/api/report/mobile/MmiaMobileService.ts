import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import drugService from '../../drugService/drugService';
import StockOperationTypeService from '../../stockOperationTypeService/StockOperationTypeService';
import MmiaStockReport from 'src/stores/models/report/pharmacyManagement/MmiaStockReport';
import MmiaRegimenSubReport from 'src/stores/models/report/pharmacyManagement/MmiaRegimenSubReport';
import MmiaReport from 'src/stores/models/report/pharmacyManagement/MmiaReport';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import patientVisitDetailsService from '../../patientVisitDetails/patientVisitDetailsService';
import packService from '../../pack/packService';

const MmiaStockReportDexie = db[MmiaStockReport.entity];
const MmiaRegimenSubReportDexie = db[MmiaRegimenSubReport.entity];
const MmiaReportDexie = db[MmiaReport.entity];
// const activeInDrugStore = useRepo(ActiveInDrugStore);

export default {
  async getMmiaStockReport(params: any) {
    const [drugs] = await Promise.all([
      drugService.getAllWithStocksFromDexie(),
    ]);

    const reportParams = await ReportDatesParams.determineStartEndDate(params);

    for (const drug of drugs) {
      let entradasForaPeriodo = Number(0);
      let entradasDentroPeriodo = Number(0);
      let saidasForaPeriodo = Number(0);
      let saidasDentroPeriodo = Number(0);
      let ajustePositivoForaPeriodo = Number(0);
      let ajustePositivoDentroPeriodo = Number(0);
      let ajusteNegativoForaPeriodo = Number(0);
      let ajusteNegativoDentroPeriodo = Number(0);

      (drug?.stocks ?? []).forEach((stock: any) => {
        if (
          stock?.entrance?.dateReceived &&
          moment(stock.entrance.dateReceived) >=
            moment(reportParams.startDate) &&
          moment(stock.entrance.dateReceived) <= moment(reportParams.endDate)
        ) {
          entradasDentroPeriodo += stock.unitsReceived;
        } else if (
          stock?.entrance?.dateReceived &&
          moment(stock.entrance.dateReceived) < moment(reportParams.startDate)
        ) {
          entradasForaPeriodo += stock.unitsReceived;
        }

        (stock?.packagedDrugStocks ?? []).forEach((packagedDrugStock: any) => {
          const pickupDate = packagedDrugStock?.packagedDrug?.pack?.pickupDate;
          if (!pickupDate) return;
          if (
            moment(pickupDate) >= moment(reportParams.startDate) &&
            moment(pickupDate) <= moment(reportParams.endDate)
          ) {
            saidasDentroPeriodo += packagedDrugStock.quantitySupplied;
          } else {
            if (moment(pickupDate) < moment(reportParams.startDate)) {
              saidasForaPeriodo += packagedDrugStock.quantitySupplied;
            }
          }
        });

        (stock?.adjustments ?? []).forEach((adjustment: any) => {
          if (
            adjustment?.inventory?.endDate !== null &&
            adjustment?.inventory?.endDate !== undefined
          ) {
            if (
              moment(adjustment.inventory.endDate) >=
                moment(reportParams.startDate) &&
              moment(adjustment.inventory.endDate) <=
                moment(reportParams.endDate)
            ) {
              if (adjustment?.operation?.code === 'AJUSTE_POSETIVO') {
                ajustePositivoDentroPeriodo += adjustment.adjustedValue;
              } else if (adjustment?.operation?.code === 'AJUSTE_NEGATIVO') {
                ajusteNegativoDentroPeriodo += adjustment.adjustedValue;
              }
            } else {
              if (
                moment(adjustment.inventory.endDate) <
                moment(reportParams.startDate)
              ) {
                if (adjustment?.operation?.code === 'AJUSTE_POSETIVO') {
                  ajustePositivoForaPeriodo += adjustment.adjustedValue;
                } else if (adjustment?.operation?.code === 'AJUSTE_NEGATIVO') {
                  ajusteNegativoForaPeriodo += adjustment.adjustedValue;
                }
              }
            }
          }
        });

        (stock?.referedAdjustments ?? []).forEach((adjustment: any) => {
          if (
            adjustment.captureDate !== null &&
            adjustment.captureDate !== undefined
          ) {
            if (
              moment(adjustment.captureDate) >=
                moment(reportParams.startDate) &&
              moment(adjustment.captureDate) <= moment(reportParams.endDate)
            ) {
              if (adjustment?.operation?.code === 'AJUSTE_POSETIVO') {
                ajustePositivoDentroPeriodo += adjustment.adjustedValue;
              } else if (adjustment?.operation?.code === 'AJUSTE_NEGATIVO') {
                ajusteNegativoDentroPeriodo += adjustment.adjustedValue;
              }
            } else {
              if (
                moment(adjustment.captureDate) < moment(reportParams.startDate)
              ) {
                if (adjustment?.operation?.code === 'AJUSTE_POSETIVO') {
                  ajustePositivoForaPeriodo += adjustment.adjustedValue;
                } else if (adjustment?.operation?.code === 'AJUSTE_NEGATIVO') {
                  ajusteNegativoForaPeriodo += adjustment.adjustedValue;
                }
              }
            }
          }
        });
      });
      const mmiaReport = new MmiaStockReport();
      mmiaReport.unit = String(drug.packSize).concat(
        ' ' + (drug?.form?.code ?? '')
      );
      mmiaReport.fnmCode = drug.fnmCode;
      mmiaReport.drugName = drug.name;
      mmiaReport.balance =
        entradasForaPeriodo +
        ajustePositivoForaPeriodo -
        (saidasForaPeriodo + ajusteNegativoForaPeriodo);
      mmiaReport.initialEntrance = entradasDentroPeriodo;
      mmiaReport.outcomes = saidasDentroPeriodo;
      mmiaReport.lossesAdjustments =
        ajustePositivoDentroPeriodo - ajusteNegativoDentroPeriodo;
      mmiaReport.actualStock = 0;
      mmiaReport.inventory =
        Number(mmiaReport.balance) +
        Number(mmiaReport.initialEntrance) +
        Number(mmiaReport.lossesAdjustments) -
        Number(mmiaReport.outcomes);
      console.log('O REPORT ', mmiaReport);
      if ((drug?.stocks ?? []).length > 0) {
        const expireDate = drug.stocks[0]?.expireDate;
        if (expireDate) {
          mmiaReport.expireDate = moment(expireDate).format('DD-MM-YYYY');
        }
      }
      mmiaReport.reportId = reportParams.id;
      mmiaReport.year = reportParams.year;
      mmiaReport.endDate = reportParams.endDate;
      mmiaReport.id = uuidv4();
      await this.localDbAddOrUpdateStockReport(mmiaReport);
    }

    return reportParams;
  },

  async getMmiaRegimenSubReport(reportParams: any) {
    const listRegimeReports: MmiaRegimenSubReport[] = [];

    const [packsInPeriod] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    packsInPeriod.forEach((pack: any) => {
      const patientVisitDetail = pack?.patientvisitDetails;
      const prescription = patientVisitDetail?.prescription;
      const prescriptionDetails = prescription?.prescriptionDetails?.[0];
      const episode = patientVisitDetail?.episode;
      const therapeuticalRegimen = prescriptionDetails
        ? prescriptionDetails.therapeuticRegimen
        : undefined;

      const therapeuticalLine = prescriptionDetails
        ? prescriptionDetails.therapeuticLine
        : undefined;
      if (!episode || !therapeuticalRegimen || !therapeuticalLine) return;
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
        if (String(therapeuticalLine.code).includes('1')) {
          regSubReport.totaldcline1++;
        } else if (String(therapeuticalLine.code).includes('2')) {
          regSubReport.totaldcline2++;
        } else if (String(therapeuticalLine.code).includes('3')) {
          regSubReport.totaldcline3++;
        }
      } else {
        regSubReport.totalPatients = Number(regSubReport.totalPatients) + 1;
        if (String(therapeuticalLine.code).includes('1')) {
          regSubReport.totalline1++;
        } else if (String(therapeuticalLine.code).includes('2')) {
          regSubReport.totalline2++;
        } else if (String(therapeuticalLine.code).includes('3')) {
          regSubReport.totalline3++;
        }
      }
      regSubReport.totalrefline1 = 0;
      regSubReport.totalrefline2 = 0;
      regSubReport.totalrefline3 = 0;

      listRegimeReports.push(regSubReport);
    });
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
    let totalDM = 0;
    let totalDsM0 = 0;
    let totalDtM0 = 0;
    const curMmiaReport = new MmiaReport();
    curMmiaReport.totalPacientesInicio = Number(0);
    curMmiaReport.totalPacientesManter = Number(0);
    curMmiaReport.totalPacientesAlterar = Number(0);
    curMmiaReport.totalPacientesTransito = Number(0);
    curMmiaReport.totalPacientesTransferidoDe = Number(0);
    curMmiaReport.totalPacientesAdulto = Number(0);
    curMmiaReport.totalPacientes04 = Number(0);
    curMmiaReport.totalPacientes59 = Number(0);
    curMmiaReport.totalPacientes1014 = Number(0);
    curMmiaReport.totalPacientesPPE = Number(0);
    curMmiaReport.totalPacientesPREP = Number(0);
    curMmiaReport.totalpacientesCE = Number(0);
    curMmiaReport.dsM0 = Number(0);
    curMmiaReport.dsM1 = Number(0);
    curMmiaReport.dsM2 = Number(0);
    curMmiaReport.dsM3 = Number(0);
    curMmiaReport.dsM4 = Number(0);
    curMmiaReport.dsM5 = Number(0);
    curMmiaReport.dtM0 = Number(0);
    curMmiaReport.dtM1 = Number(0);
    curMmiaReport.dtM2 = Number(0);
    curMmiaReport.dbM0 = Number(0);
    curMmiaReport.dbM1 = Number(0);
    curMmiaReport.dM = Number(0);

    const [packsInPeriod] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    for (const newRegimenSubReport of listRegimenSubReport) {
      await this.localDbAddOrUpdateReportRegimen(newRegimenSubReport);
    }

    for (const pack of packsInPeriod) {
      const patientVisitDetail = pack?.patientvisitDetails;
      const patientVisit = patientVisitDetail?.patientVisit;
      const episode = patientVisitDetail?.episode;
      const service = episode?.patientServiceIdentifier?.service;
      const prescription = patientVisitDetail?.prescription;
      const prescriptionDetails = prescription?.prescriptionDetails?.[0];
      if (
        !patientVisit?.patient ||
        !episode?.startStopReason ||
        !service ||
        !prescription ||
        !prescriptionDetails
      ) {
        continue;
      }
      const dispenseType =
        prescriptionDetails.dispenseType !== null &&
        prescriptionDetails.dispenseType !== undefined
          ? prescriptionDetails.dispenseType.code
          : '';

      if (service.code === 'PREP') {
        curMmiaReport.totalPacientesPREP++;
      }

      if (service.code === 'PPE') {
        curMmiaReport.totalPacientesPPE++;
      }

      if (service.code === 'CE') {
        curMmiaReport.totalpacientesCE++;
      }

      curMmiaReport.reportId = reportParams.id;
      const birthDate = moment(patientVisit.patient.dateOfBirth);
      const age = moment(reportParams.endDate, 'YYYY/MM/DDDD').diff(
        birthDate,
        'years'
      );
      if (age >= 18) {
        curMmiaReport.totalPacientesAdulto++;
      } else if (age >= 0 && age <= 4) {
        curMmiaReport.totalPacientes04++;
      } else if (age >= 5 && age <= 9) {
        curMmiaReport.totalPacientes59++;
      } else if (age >= 10 && age <= 14) {
        curMmiaReport.totalPacientes1014++;
      }
      if (
        (episode.startStopReason.code === 'NOVO' ||
          episode.startStopReason.code === 'NOVO_PACIENTE') &&
        (prescription.patient_type === 'N/A' ||
          prescription.patient_type === null ||
          prescription.patient_type === 'Inicio') &&
        dispenseType === 'DM'
      ) {
        curMmiaReport.totalPacientesInicio++;
      } else if (
        (episode.startStopReason.code === 'NOVO_PACIENTE' &&
          moment(episode.episode_date).add(3, 'days') <
            moment(pack.pickupDate)) ||
        episode.startStopReason.code === 'MANUNTENCAO' ||
        episode.startStopReason.code === 'VOLTOU_REFERENCIA' ||
        episode.startStopReason.code === 'REINICIO_TRATAMETO' ||
        episode.startStopReason.code === 'REFERIDO_DC' ||
        episode.startStopReason.code === 'OUTRO' ||
        episode.startStopReason.code === 'INICIO_CCR'
      ) {
        curMmiaReport.totalPacientesManter++;
      } else if (episode.startStopReason.code === 'ALTERACAO') {
        curMmiaReport.totalPacientesAlterar++;
      } else if (
        episode.startStopReason.code === 'TRANSITO' ||
        episode.startStopReason.code === 'INICIO_MATERNIDADE'
      ) {
        curMmiaReport.totalPacientesTransito++;
      } else if (episode.startStopReason.code === 'TRANSFERIDO_DE') {
        curMmiaReport.totalPacientesTransferido++;
      }

      if (prescriptionDetails !== null && prescriptionDetails !== undefined) {
        if (dispenseType === 'DM') {
          totalDM++;
        } else if (dispenseType === 'DT') {
          totalDtM0++;
        } else if (dispenseType === 'DS') {
          totalDsM0++;
        }
      }
    }

    [
      curMmiaReport.dsM1,
      curMmiaReport.dsM2,
      curMmiaReport.dsM3,
      curMmiaReport.dsM4,
      curMmiaReport.dsM5,
      curMmiaReport.dtM1,
      curMmiaReport.dtM2,
      curMmiaReport.dbM0,
      curMmiaReport.dbM1,
    ] = await Promise.all([
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DS',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 1),
        this.determineDate(reportParams.endDate, 1)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DS',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 2),
        this.determineDate(reportParams.endDate, 2)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DS',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 3),
        this.determineDate(reportParams.endDate, 3)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DS',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 4),
        this.determineDate(reportParams.endDate, 4)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DS',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 5),
        this.determineDate(reportParams.endDate, 5)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DT',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 1),
        this.determineDate(reportParams.endDate, 1)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DT',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 2),
        this.determineDate(reportParams.endDate, 2)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DB',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 1),
        this.determineDate(reportParams.endDate, 1)
      ),
      patientVisitDetailsService.countPacksByDispenseTypeAndServiceOnPeriod(
        'DB',
        reportParams.clinicalService,
        this.determineDate(reportParams.startDate, 2),
        this.determineDate(reportParams.endDate, 2)
      ),
    ]);
    curMmiaReport.dM = totalDM;
    curMmiaReport.dtM0 = totalDtM0;
    curMmiaReport.dsM0 = totalDsM0;
    curMmiaReport.id = uuidv4();
    await this.localDbAddOrUpdateMmia(curMmiaReport);
  },

  determineDate(date: any, month: any) {
    return moment(date, 'DD-MM-YYYY').subtract(month, 'months');
  },
  isReferido(episode: any) {
    return episode?.startStopReason?.code === 'TRANSFERIDO_DE';
  },
  groupedMap(items: any, key: any) {
    return items.reduce((entryMap, e) => {
      const value = e?.[key];
      if (!value) return entryMap;
      return entryMap.set(value, [...(entryMap.get(value) || []), e]);
    }, new Map());
  },
  groupedMapChild(items: any, key: any) {
    return items.reduce((entryMap, e) => {
      const value = e?.adjustedStock?.drug?.id;
      if (!value) return entryMap;
      return entryMap.set(value, [...(entryMap.get(value) || []), e]);
    }, new Map());
  },
  groupedMapChildPack(items: any, key: any) {
    return items.reduce((entryMap, e) => {
      const value = e?.drug?.id ?? e?.drug_id;
      if (!value) return entryMap;
      return entryMap.set(value, [...(entryMap.get(value) || []), e]);
    }, new Map());
  },
  groupedMapChildAdjustments(items: any, key: any) {
    return items.reduce((entryMap, e) => {
      const value = e?.adjustedStock?.id;
      if (!value) return entryMap;
      return entryMap.set(value, [...(entryMap.get(value) || []), e]);
    }, new Map());
  },
  getStockOperationTypeById(id: any) {
    return StockOperationTypeService.getStockOperatinTypeById(id);
  },

  localDbAddOrUpdateStockReport(data: any) {
    return MmiaStockReportDexie.put(data).catch((error: any) => {
      console.log(error);
    });
  },

  async getDataLocalReportStock(reportId: any) {
    return MmiaStockReportDexie.where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },

  localDbAddOrUpdateReportRegimen(data: any) {
    return MmiaRegimenSubReportDexie.put(data).catch((error: any) => {
      console.log(error);
    });
  },

  getDataLocalReportRegimen(reportId: any) {
    return MmiaRegimenSubReportDexie.where('reportId')
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
    mmiaRegimenSubReport.totalReferidos = 0;
    return mmiaRegimenSubReport;
  },

  localDbAddOrUpdateMmia(data: any) {
    return MmiaReportDexie.put(data).catch((error: any) => {
      console.log(error);
    });
  },

  async getDataLocalReportMmia(reportId: any) {
    return MmiaReportDexie.where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
