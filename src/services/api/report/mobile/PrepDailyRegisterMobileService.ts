import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';
import packService from '../../pack/packService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);

    const [activePacks] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    for (const pack of activePacks) {
      const details = pack?.patientvisitDetails;
      const patient = details?.patientVisit?.patient;
      const episode = details?.episode;
      const identifier = episode?.patientServiceIdentifier;
      if (!patient || !episode || !identifier?.service) continue;
      const prescription = details?.prescription;
      const prescriptionDetails = prescription?.prescriptionDetails ?? [];
      const therapeuticLine =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticLine
          : undefined;
      const therapeuticRegimen =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticRegimen
          : undefined;
      const patientType = prescription
        ? prescription.patientType === 'N/A'
          ? prescription.patientStatus
          : prescription.patientType
        : '';

      const dispenseType =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].dispenseType
          : undefined;

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
        arvDailyRegisterReport.startReason =
          episode?.startStopReason?.reason ?? '';
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
        arvDailyRegisterReport.regime = therapeuticRegimen?.description ?? '';
        arvDailyRegisterReport.dispensationType =
          dispenseType?.description ?? '';
        arvDailyRegisterReport.therapeuticLine =
          therapeuticLine?.description ?? '';
        arvDailyRegisterReport.clinic = pack?.clinic?.clinicName ?? '';
        arvDailyRegisterReport.prep =
          identifier.service.code === 'PREP' ? 'Sim' : '';
        arvDailyRegisterReport.ppe =
          identifier.service.code === 'PPE' ? 'Sim' : '';
        const drugQuantityTemps = [];
        for (const packagedDrug of pack?.packagedDrugs ?? []) {
          if (!packagedDrug?.drug) continue;
          const drugQuantityTemp = {};
          drugQuantityTemp.drugName = packagedDrug.drug.name;
          drugQuantityTemp.quantity = packagedDrug.quantitySupplied;
          console.log(drugQuantityTemp);
          drugQuantityTemps.push(drugQuantityTemp);
          console.log(arvDailyRegisterReport);
        }
        console.log(drugQuantityTemps);
        arvDailyRegisterReport.drugQuantityTemps = drugQuantityTemps;
        await this.localDbAddOrUpdate(arvDailyRegisterReport);
      }
    }
  },

  localDbAddOrUpdate(targetCopy: any) {
    return nSQL().onConnected(() => {
      nSQL(ArvDailyRegisterTempReport.entity)
        .query('upsert', targetCopy)
        .exec();
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return nSQL(ArvDailyRegisterTempReport.entity)
      .query('select')
      .where(['reportId', '=', reportId])
      .exec()
      .then((result) => {
        if (result !== undefined) {
          return result;
        }
        return null;
      });
  },
  async getDataLocalReport(reportId: string) {
    return nSQL(ArvDailyRegisterTempReport.entity)
      .query('select')
      .where(['reportId', '=', reportId])
      .exec()
      .then((result) => {
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
};
