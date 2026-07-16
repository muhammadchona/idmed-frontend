import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientHistoryReport from 'src/stores/models/report/pharmacyManagement/PatientHistoryReport';
import packService from '../../pack/packService';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import clinicService from '../../clinicService/clinicService';
const patientHistoryReporDexie = db[patientHistoryReport.entity];
// const activeInDrugStore = useRepo(ActiveInDrugStore);

const { idadeReportCalculator } = useDateUtils();
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
        const patientHistory = new patientHistoryReport();
        patientHistory.reportId = reportParams.id;
        patientHistory.year = reportParams.year;
        patientHistory.startDate = reportParams.startDate;
        patientHistory.endDate = reportParams.endDate;
        patientHistory.dispenseType = dispenseType?.description ?? '';
        patientHistory.nid = identifier.value;
        patientHistory.firstNames = patient.firstNames;
        patientHistory.middleNames = patient.middleNames;
        patientHistory.lastNames = patient.lastNames;
        patientHistory.cellphone = patient.cellphone;
        patientHistory.pickUpDate = pack.pickupDate;
        patientHistory.nexPickUpDate = pack.nextPickUpDate;
        patientHistory.therapeuticalRegimen =
          therapeuticRegimen?.description ?? '';
        patientHistory.age = idadeReportCalculator(patient.dateOfBirth);
        patientHistory.dispenseMode = pack?.dispenseMode?.description ?? '';
        patientHistory.clinicalService = identifier.service.description;
        patientHistory.clinic = pack?.clinic?.clinicName ?? '';
        patientHistory.clinicsector =
          clinicService.currClinic()?.clinicName ?? '';
        patientHistory.id = uuidv4();
        await this.localDbAddOrUpdate(patientHistory);
        console.log(patientHistory);
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    return patientHistoryReporDexie.add(data).catch((error: any) => {
      console.log(error);
    });
  },

  localDbGetAllByReportId(reportId: any) {
    return patientHistoryReporDexie
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
