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
import packService from '../../pack/packService';

const patientExpectedReportDexie = db[PatientExpectedReport.entity];

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    const [activePacks] = await Promise.all([
      packService.getAllExpectedPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    for (const pack of activePacks) {
      const details = pack?.patientvisitDetails;
      const patient = details?.patientVisit?.patient;
      const identifier = details?.episode?.patientServiceIdentifier;
      if (!patient || !identifier?.service) continue;
      const prescriptionDetails =
        details?.prescription?.prescriptionDetails ?? [];

      const therapeuticRegimen =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticRegimen
          : undefined;

      const dispenseType =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].dispenseType
          : undefined;
      if (identifier.service.id === reportParams.clinicalService) {
        const patientExpectedReports = new PatientExpectedReport();
        patientExpectedReports.dispenseType = dispenseType?.description ?? '';
        patientExpectedReports.reportId = reportParams.id;
        patientExpectedReports.year = reportParams.year;
        patientExpectedReports.startDate = reportParams.startDate;
        patientExpectedReports.endDate = reportParams.endDate;
        patientExpectedReports.nid = identifier.value;
        patientExpectedReports.firstNames = patient.firstNames;
        patientExpectedReports.middleNames = patient.middleNames;
        patientExpectedReports.lastNames = patient.lastNames;
        patientExpectedReports.cellphone = patient.cellphone;
        patientExpectedReports.pickUpDate = pack.pickupDate;
        patientExpectedReports.nextPickUpDate = pack.nextPickUpDate;
        patientExpectedReports.therapeuticRegimen =
          therapeuticRegimen?.description ?? '';
        patientExpectedReports.dispenseMode =
          pack?.dispenseMode?.description ?? '';
        patientExpectedReports.clinicalService = identifier.service.description;
        patientExpectedReports.clinic = pack?.clinic?.clinicName ?? '';
        patientExpectedReports.id = uuidv4();
        await this.localDbAddOrUpdate(patientExpectedReports);
        console.log(patientExpectedReports);
      }
    }

    const patientVisitDetailsList =
      await patientVisitDetailsService.getLocalDbPatientVisitsExpectedOnDay(
        reportParams.clinicalService,
        reportParams.startDate,
        reportParams.endDate
      );

    for (const patientVisitDetail of patientVisitDetailsList) {
      if (
        patientVisitDetail?.pack !== undefined &&
        patientVisitDetail?.prescription?.id &&
        patientVisitDetail?.episode?.id &&
        patientVisitDetail?.episode?.patientServiceIdentifier?.id
      ) {
        const patientExpectedReports = new PatientExpectedReport();
        const prescriptionDetails =
          patientVisitDetail.prescription?.prescriptionDetails ?? [];
        let prescription = patientVisitDetail.prescription;

        prescription = await prescriptionService.getPrescriptionMobileById(
          prescription.id
        );
        if (!prescription) continue;

        const dispenseType = dispenseTypeService.getById(
          prescriptionDetails.length > 0
            ? prescriptionDetails[0]?.dispenseType?.id ?? ''
            : ''
        );
        let patientVisit = patientVisitDetail.patientVisit;
        if (!patientVisit) {
          patientVisit = await patientVisitService.getAllMobileById(
            patientVisitDetail.patient_visit_id
          );
        }
        if (!patientVisit?.patient?.id) continue;
        const patient = await patientService.getPatientByIdMobile(
          patientVisit.patient.id
        );
        if (!patient) continue;
        const episode = await episodeService.apiFetchById(
          patientVisitDetail.episode.id
        );
        if (!episode?.patientServiceIdentifier?.id) continue;

        let identifier = (patient?.identifiers ?? []).find(
          (identifier: Object) =>
            identifier.id === episode.patientServiceIdentifier.id
        );
        if (!identifier)
          identifier = await patientServiceIdentifierService.localDbGetById(
            patientVisitDetail.episode.patientServiceIdentifier.id
          );

        if (identifier?.service?.id) {
          // const serviceIdentifier = identifier
          const pack = patientVisitDetail.pack;
          const clinic = patientVisitDetail.clinic;
          const prescriptionDetails = prescription?.prescriptionDetails ?? [];
          const clinicalService = await clinicalServiceService.localDbGetById(
            identifier.service.id
          );
          const therapeuticRegimen =
            await therapeuticalRegimenService.getInMobileById(
              prescriptionDetails.length > 0
                ? prescriptionDetails[0]?.therapeuticRegimen?.id ?? ''
                : ''
            );
          const dispenseMode = await dispenseModeService.localDbGetById(
            pack?.dispenseMode?.id ?? pack?.dispenseMode_id ?? ''
          );
          // const episode = reportData.episode
          // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)
          patientExpectedReports.dispenseType = dispenseType?.description ?? '';

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
            therapeuticRegimen?.description ?? '';

          patientExpectedReports.dispenseMode = dispenseMode?.description ?? '';
          patientExpectedReports.clinicalService =
            clinicalService?.description ?? '';
          patientExpectedReports.clinic = clinic?.clinicName ?? '';
          patientExpectedReports.id = uuidv4();
          await this.localDbAddOrUpdate(patientExpectedReports);
          console.log(patientExpectedReports);
        }
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    return patientExpectedReportDexie.add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return patientExpectedReportDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
