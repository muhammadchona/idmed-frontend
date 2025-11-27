import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import NotSyncronizedPacksToServer from 'src/stores/models/report/pharmacyManagement/NotSyncronizedPacksToServer';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import packService from '../../pack/packService';
const notSyncronizedPacksToServerDexie = NotSyncronizedPacksToServer.entity;

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    const [activePacks] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    for (const pack of activePacks) {
      const patientVisit = pack.patientvisitDetails.patientVisit;
      const patient = pack.patientvisitDetails.patientVisit.patient;
      const identifier =
        pack.patientvisitDetails.episode.patientServiceIdentifier;
      const clinicalService =
        pack.patientvisitDetails.episode.patientServiceIdentifier.service;

      const prescriptionDetails =
        pack.patientvisitDetails.prescription.prescriptionDetails;
      const therapeuticRegimen =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticRegimen
          : '';

      const dispenseType =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].dispenseType
          : '';

      const dispenseMode = pack.dispenseMode;

      if (patientVisit.syncStatus === 'R') {
        const notSyncronizedPacksToServer = new NotSyncronizedPacksToServer();

        notSyncronizedPacksToServer.dispenseType = dispenseType.description;

        notSyncronizedPacksToServer.reportId = reportParams.id;
        notSyncronizedPacksToServer.year = reportParams.year;
        notSyncronizedPacksToServer.startDate = reportParams.startDate;
        notSyncronizedPacksToServer.endDate = reportParams.endDate;

        notSyncronizedPacksToServer.nid = identifier.value;
        notSyncronizedPacksToServer.firstNames = patient.firstNames;
        notSyncronizedPacksToServer.middleNames = patient.middleNames;
        notSyncronizedPacksToServer.lastNames = patient.lastNames;
        notSyncronizedPacksToServer.cellphone = patient.cellphone;
        notSyncronizedPacksToServer.pickUpDate = pack.pickupDate;
        notSyncronizedPacksToServer.nexPickUpDate = pack.nextPickUpDate;
        notSyncronizedPacksToServer.therapeuticalRegimen =
          therapeuticRegimen.description;
        notSyncronizedPacksToServer.age = this.idadeCalculator(
          patient.dateOfBirth
        );
        notSyncronizedPacksToServer.dispenseMode = dispenseMode.description;
        notSyncronizedPacksToServer.clinicalService =
          clinicalService.description;
        //  notSyncronizedPacksToServer.clinic = pack?.clinic?.clinicName;
        notSyncronizedPacksToServer.id = uuidv4();
        this.localDbAddOrUpdate(notSyncronizedPacksToServer);
        console.log(notSyncronizedPacksToServer);
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    return db[notSyncronizedPacksToServerDexie]
      .add(data)
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[notSyncronizedPacksToServerDexie]
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
};
