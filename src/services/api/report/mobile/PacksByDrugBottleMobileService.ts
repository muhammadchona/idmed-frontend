import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import PacksByDrugBottles from 'src/stores/models/report/monitoring/PacksByDrugBottles';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import drugService from '../../drugService/drugService';
const packsByDrugBottlesDexie = PacksByDrugBottles.entity;

export default {
  async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    console.log(reportParams);

    const patientVisitList =
      await patientVisitService.getLocalDbPatientVisitsBetweenDates(
        params.startDate,
        params.endDate
      );
    console.log(patientVisitList);
    const grouped = this.groupAndSumByDrugFromPatientVisits(patientVisitList);
    console.log(grouped);
    for (const drug of Object.values(grouped)) {
      const packsByDrugBottle = new PacksByDrugBottles();
      const endDate = moment(params.endDate).format('YYYY-MM-DD');
      const startDate = moment(params.startDate).format('YYYY-MM-DD');
      packsByDrugBottle.reportId = reportParams.id;
      packsByDrugBottle.startDate = startDate;
      packsByDrugBottle.endDate = endDate;
      packsByDrugBottle.year = reportParams.year;
      packsByDrugBottle.id = uuidv4();
      const drugMobile = await drugService.getMobileDrugById(drug.drug_id);
      if (!drugMobile) continue;
      packsByDrugBottle.drugName = drugMobile.name;
      packsByDrugBottle.bottles_packed = drug.quantitySupplied;
      await this.localDbAddOrUpdate(packsByDrugBottle);
      console.log(packsByDrugBottle);
    }
  },

  localDbAddOrUpdate(data: any) {
    return db[packsByDrugBottlesDexie].add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[packsByDrugBottlesDexie]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },

  idadeCalculator(birthDate: string) {
    if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
      const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD');
      const todayDate = moment(new Date());
      const idade = todayDate.diff(utentBirthDate, 'years');
      console.log(idade);
      return idade;
    }
  },

  groupAndSumByDrugFromPatientVisits(patientVisits: []) {
    return patientVisits.reduce((acc, visit) => {
      (visit?.patientVisitDetails ?? []).forEach((detail: any) => {
        (detail?.pack?.packagedDrugs ?? []).forEach((drug: any) => {
          const drug_id = drug?.drug_id ?? drug?.drug?.id;
          const quantitySupplied = Number(drug?.quantitySupplied ?? 0);
          if (!drug_id) return;
          if (!acc[drug_id]) {
            acc[drug_id] = { drug_id, quantitySupplied: 0 };
          }
          acc[drug_id].quantitySupplied += quantitySupplied;
        });
      });
      return acc;
    }, {});
  },
};
