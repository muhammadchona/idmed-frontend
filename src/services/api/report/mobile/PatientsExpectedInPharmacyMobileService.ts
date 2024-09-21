import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import dispenseTypeService from '../../dispenseType/dispenseTypeService';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import dispenseModeService from '../../dispenseMode/dispenseModeService';
import patientService from '../../patientService/patientService';
import episodeService from '../../episode/episodeService';
import patientVisitDetailsService from '../../patientVisitDetails/patientVisitDetailsService';
import PatientExpectedReport from 'src/stores/models/report/patient/PatientExpectedReport';
import prescriptionService from '../../prescription/prescriptionService';
import patientVisitService from '../../patientVisit/patientVisitService';

const patientExpectedReportDexie = PatientExpectedReport.entity;

export default {
  async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    const patientVisitDetailsList =
      await patientVisitDetailsService.getLocalDbPatientVisitsExpectedOnDay(
        reportParams.clinicalService,
        reportParams.startDate,
        reportParams.endDate
      );
    for (const patientVisitDetail of patientVisitDetailsList) {
      if (patientVisitDetail.pack !== undefined) {
        const patientExpectedReports = new PatientExpectedReport();
        let prescription = patientVisitDetail.prescription;
        if (
          patientVisitDetail.prescription.prescriptionDetails[0]
            .dispenseType === null ||
          patientVisitDetail.prescription.prescriptionDetails[0]
            .dispenseType === undefined
        ) {
          prescription = await prescriptionService.getPrescriptionMobileById(
            prescription.id
          );
        }
        const dispenseType = dispenseTypeService.getById(
          prescription.prescriptionDetails[0].dispenseType.id
        );
        let patientVisit = patientVisitDetail.patientVisit;
        if (patientVisit === null) {
          patientVisit = await patientVisitService.getAllMobileById(
            patientVisitDetail.patient_visit_id
          );
        }
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
          const clinicalService = await clinicalServiceService.localDbGetById(
            identifier.service.id
          );
          const therapeuticRegimen =
            await therapeuticalRegimenService.getInMobileById(
              prescription.prescriptionDetails[0].therapeuticRegimen.id
            );
          const dispenseMode = await dispenseModeService.localDbGetById(
            pack.dispenseMode.id
          );
          // const episode = reportData.episode
          // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)
          patientExpectedReports.dispenseType = dispenseType.description;

          patientExpectedReports.reportId = reportParams.id;
          // patientHistory.period = reportParams.periodTypeView
          patientExpectedReports.year = reportParams.year;
          patientExpectedReports.startDate = reportParams.startDate;
          patientExpectedReports.endDate = reportParams.endDate;
          patientExpectedReports.nid = identifier.value;
          patientExpectedReports.firstNames = patient.firstNames;
          patientExpectedReports.middleNames = patient.middleNames;
          patientExpectedReports.lastNames = patient.lastNames;
          patientExpectedReports.cellphone = patient.cellphone;
          // patientHistory.tipoTarv =
          patientExpectedReports.pickUpDate = pack.pickupDate;
          patientExpectedReports.nextPickUpDate = pack.nextPickUpDate;
          patientExpectedReports.therapeuticRegimen =
            therapeuticRegimen.description;

          patientExpectedReports.dispenseMode = dispenseMode.description;
          patientExpectedReports.clinicalService = clinicalService.description;
          patientExpectedReports.clinic = clinic.clinicName;
          patientExpectedReports.id = uuidv4();
          this.localDbAddOrUpdate(patientExpectedReports);
          console.log(patientExpectedReports);
        }
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    return db[patientExpectedReportDexie].add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[patientExpectedReportDexie]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
