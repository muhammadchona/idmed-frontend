import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import PatientPickedUpMedAtUsReport from 'src/stores/models/report/pharmacyManagement/PatientPickedUpMedAtUsReport';
import clinicService from '../../clinicService/clinicService';
import packService from '../../pack/packService';
const patientPickedUpMedAtUsDexie = db[PatientPickedUpMedAtUsReport.entity];

export default {
  async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    const mainClinic =
      clinicService.currClinic() !== null ? clinicService.currClinic().id : '';
    const [activePacks] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
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

      if (
        identifier.service.id === reportParams.clinicalService &&
        mainClinic !== pack.origin
      ) {
        const patientPickedUpMedAtUs = new PatientPickedUpMedAtUsReport();
        patientPickedUpMedAtUs.dispenseType = dispenseType?.description ?? '';

        patientPickedUpMedAtUs.reportId = reportParams.id;
        patientPickedUpMedAtUs.year = reportParams.year;
        patientPickedUpMedAtUs.startDate = reportParams.startDate;
        patientPickedUpMedAtUs.endDate = reportParams.endDate;
        patientPickedUpMedAtUs.nid = identifier.value;
        patientPickedUpMedAtUs.firstNames = patient.firstNames;
        patientPickedUpMedAtUs.middleNames = patient.middleNames;
        patientPickedUpMedAtUs.lastNames = patient.lastNames;
        patientPickedUpMedAtUs.cellphone = patient.cellphone;
        patientPickedUpMedAtUs.pickUpDate = pack.pickupDate;
        patientPickedUpMedAtUs.nexPickUpDate = pack.nextPickUpDate;
        patientPickedUpMedAtUs.therapeuticalRegimen =
          therapeuticRegimen?.description ?? '';

        patientPickedUpMedAtUs.dispenseMode =
          pack?.dispenseMode?.description ?? '';
        patientPickedUpMedAtUs.clinicalService = identifier.service.description;
        patientPickedUpMedAtUs.clinic = pack?.clinic?.clinicName ?? '';
        patientPickedUpMedAtUs.id = uuidv4();
        await this.localDbAddOrUpdate(patientPickedUpMedAtUs);
        console.log(patientPickedUpMedAtUs);
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    return patientPickedUpMedAtUsDexie.add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return patientPickedUpMedAtUsDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
