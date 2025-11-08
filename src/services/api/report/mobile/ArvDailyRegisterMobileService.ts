import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import packService from '../../pack/packService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isMobile } = useSystemUtils();
const arvDailyRegisterReportDexie = db[ArvDailyRegisterTempReport.entity];

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let arvDailyRegisterMobileCache: any[] = [];

const setArvDailyRegisterCache = (rows: any[]) => {
  arvDailyRegisterMobileCache = rows.map((row) => clone(row));
};

const getArvDailyRegisterCache = () =>
  arvDailyRegisterMobileCache.map((row) => clone(row));

const upsertArvDailyRegisterCache = (items: any | any[]) => {
  const entries = Array.isArray(items) ? items : [items];
  entries.forEach((entry) => {
    const payload = clone(entry);
    const index = arvDailyRegisterMobileCache.findIndex(
      (item) => item.id === payload.id
    );
    if (index >= 0) {
      arvDailyRegisterMobileCache.splice(index, 1, payload);
    } else {
      arvDailyRegisterMobileCache.push(payload);
    }
  });
};

const removeArvDailyRegisterFromCache = (predicate: (row: any) => boolean) => {
  arvDailyRegisterMobileCache = arvDailyRegisterMobileCache.filter(
    (entry) => !predicate(entry)
  );
};

const refreshArvDailyRegisterCache = async () => {
  const rows = await arvDailyRegisterReportDexie.toArray();
  setArvDailyRegisterCache(rows);
  return getArvDailyRegisterCache();
};

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    await this.localDbDeleteByReportId(reportParams.id);

    const [activePacks, clinicalService] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
      clinicalServiceService.localDbGetById(reportParams.clinicalService),
    ]);

    const isPrep = clinicalService?.code === 'PREP';
    const isPpe = clinicalService?.code === 'PPE';

    for (const pack of activePacks) {
      const patient = pack.patientvisitDetails.patientVisit.patient;
      const episode = pack.patientvisitDetails.episode;
      const identifier =
        pack.patientvisitDetails.episode.patientServiceIdentifier;
      const prescriptionDetails =
        pack.patientvisitDetails.prescription.prescriptionDetails;
      const therapeuticLine =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticLine
          : '';
      const therapeuticRegimen =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticRegimen
          : '';
      const patientType =
        pack.patientvisitDetails.prescription.patientType === 'N/A'
          ? pack.patientvisitDetails.prescription.patientStatus
          : pack.patientvisitDetails.prescription.patientType;

      const dispenseType =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].dispenseType
          : '';

      if (identifier.service.id === reportParams.clinicalService) {
        const arvDailyRegisterReport = new ArvDailyRegisterTempReport();
        arvDailyRegisterReport.reportId = reportParams.id;
        arvDailyRegisterReport.year = reportParams.year;
        arvDailyRegisterReport.startDate = reportParams.startDate;
        arvDailyRegisterReport.endDate = reportParams.endDate;

        arvDailyRegisterReport.nid = identifier.value;
        arvDailyRegisterReport.patientName =
          patient.firstNames +
          ' ' +
          patient.middleNames +
          ' ' +
          patient.lastNames;
        arvDailyRegisterReport.patientType = patientType;
        arvDailyRegisterReport.startReason = episode.startStopReason.reason;
        const age = this.idadeCalculator(patient.dateOfBirth);
        arvDailyRegisterReport.ageGroup_0_4 =
          age >= 0 && age < 4 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.ageGroup_5_9 =
          age >= 5 && age <= 9 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.ageGroup_10_14 =
          age >= 10 && age <= 14 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.ageGroup_Greater_than_15 =
          age >= 15 ? 'Sim' : 'Nao';
        arvDailyRegisterReport.pickUpDate = pack.pickupDate;
        arvDailyRegisterReport.nexPickUpDate = pack.nextPickUpDate;
        arvDailyRegisterReport.regime = therapeuticRegimen.description;
        arvDailyRegisterReport.dispensationType = dispenseType.description;
        arvDailyRegisterReport.therapeuticLine = therapeuticLine.description;
        arvDailyRegisterReport.clinic = pack.clinic.clinicName;
        arvDailyRegisterReport.prep = isPrep ? 'Sim' : '';
        arvDailyRegisterReport.ppe = isPpe ? 'Sim' : '';
        const drugQuantityTemps = [];

        for (const packagedDrug of pack.packagedDrugs) {
          const drugQuantityTemp = {};
          drugQuantityTemp.drugName = packagedDrug.drug.name;
          drugQuantityTemp.quantity = packagedDrug.quantitySupplied;
          drugQuantityTemps.push(drugQuantityTemp);
        }
        arvDailyRegisterReport.drugQuantityTemps = drugQuantityTemps;
        arvDailyRegisterReport.id = uuidv4();
        await this.localDbAddOrUpdate(arvDailyRegisterReport);
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    const payload = clone(data);
    return arvDailyRegisterReportDexie
      .put(payload)
      .then(() => {
        if (isMobile.value) {
          upsertArvDailyRegisterCache(payload);
          return payload;
        }
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async localDbDeleteByReportId(reportId: any) {
    await arvDailyRegisterReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .delete();
    removeArvDailyRegisterFromCache((entry) => entry.reportId === reportId);
  },

  async localDbGetAllByReportId(reportId: any) {
    return arvDailyRegisterReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        if (isMobile.value) {
          upsertArvDailyRegisterCache(result);
          return result.map((entry: any) => clone(entry));
        }
        return result;
      });
  },

  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshArvDailyRegisterCache();
  },

  getCachedByReportId(reportId: any) {
    if (!isMobile.value) {
      return [];
    }
    return getArvDailyRegisterCache().filter(
      (entry) => entry.reportId === reportId
    );
  },

  idadeCalculator(birthDate: string) {
    if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
      const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD');
      const todayDate = moment(new Date());
      const idade = todayDate.diff(utentBirthDate, 'years');
      return idade;
    }
  },
};
