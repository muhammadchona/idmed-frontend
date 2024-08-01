import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import dispenseTypeService from '../../dispenseType/dispenseTypeService';
import NotSyncronizedPacksToServer from 'src/stores/models/report/pharmacyManagement/NotSyncronizedPacksToServer';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import dispenseModeService from '../../dispenseMode/dispenseModeService';
import patientService from '../../patientService/patientService';
import episodeService from '../../episode/episodeService';
const notSyncronizedPacksToServerDexie = NotSyncronizedPacksToServer.entity;

export default {
  async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    console.log(reportParams);
    const patientVisitList =
      await patientVisitService.getLocalDbPatientVisitsNotSynced();
    console.log(patientVisitList);
    for (const patientVisit of patientVisitList) {
      for (const patientVisitDetail of patientVisit.patientVisitDetails) {
        if (patientVisitDetail.pack !== undefined) {
          const pickupDate = moment(patientVisitDetail.pack.pickupDate).format(
            'YYYY-MM-DD'
          );
          const endDate = moment(params.endDate).format('YYYY-MM-DD');
          const startDate = moment(params.startDate).format('YYYY-MM-DD');
          const days = moment(endDate).diff(pickupDate, 'days');
          const newDate = moment(patientVisitDetail.pack.pickupDate).add(
            days,
            'd'
          );

          if (
            (patientVisit.visitDate >= reportParams.startDate &&
              patientVisit.visitDate <= reportParams.endDate) ||
            (newDate >= moment(params.startDate) &&
              newDate <= moment(params.endDate))
          ) {
            const notSyncronizedPacksToServer =
              new NotSyncronizedPacksToServer();
            const dispenseType = dispenseTypeService.getById(
              patientVisitDetail.prescription.prescriptionDetails[0]
                .dispenseType.id
            );

            notSyncronizedPacksToServer.dispenseType = dispenseType.description;

            notSyncronizedPacksToServer.reportId = reportParams.id;
            // patientHistory.period = reportParams.periodTypeView
            notSyncronizedPacksToServer.year = reportParams.year;
            notSyncronizedPacksToServer.startDate = reportParams.startDate;
            notSyncronizedPacksToServer.endDate = reportParams.endDate;

            const patient = await patientService.getPatientByIdMobile(
              patientVisit.patient.id
            );
            const episode = await episodeService.apiFetchById(
              patientVisitDetail.episode.id
            );

            let identifier = patient.identifiers.find(
              (identifier: Object) =>
                identifier.id === episode.patientServiceIdentifier.id
            );
            if (!identifier)
              identifier = await patientServiceIdentifierService.localDbGetById(
                patientVisitDetail.episode.patientServiceIdentifier.id
              );

            if (identifier) {
              // const serviceIdentifier = identifier
              const pack = patientVisitDetail.pack;
              const clinic = patientVisitDetail.clinic;
              const clinicalService =
                await clinicalServiceService.localDbGetById(
                  identifier.service.id
                );
              const therapeuticRegimen =
                await therapeuticalRegimenService.getById(
                  patientVisitDetail.prescription.prescriptionDetails[0]
                    .therapeuticRegimen.id
                );
              const dispenseMode = await dispenseModeService.localDbGetById(
                pack.dispenseMode.id
              );
              // const episode = reportData.episode
              // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)

              notSyncronizedPacksToServer.nid = identifier.value;
              notSyncronizedPacksToServer.firstNames = patient.firstNames;
              notSyncronizedPacksToServer.middleNames = patient.middleNames;
              notSyncronizedPacksToServer.lastNames = patient.lastNames;
              notSyncronizedPacksToServer.cellphone = patient.cellphone;
              // patientHistory.tipoTarv =
              notSyncronizedPacksToServer.pickUpDate = pack.pickupDate;
              notSyncronizedPacksToServer.nexPickUpDate = pack.nextPickUpDate;
              notSyncronizedPacksToServer.therapeuticalRegimen =
                therapeuticRegimen.description;
              notSyncronizedPacksToServer.age = this.idadeCalculator(
                patient.dateOfBirth
              );
              notSyncronizedPacksToServer.dispenseMode =
                dispenseMode.description;
              notSyncronizedPacksToServer.clinicalService =
                clinicalService.description;
              notSyncronizedPacksToServer.clinic = clinic.clinicName;
              notSyncronizedPacksToServer.id = uuidv4();
              this.localDbAddOrUpdate(notSyncronizedPacksToServer);
              console.log(notSyncronizedPacksToServer);
            }
          }
        }
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
