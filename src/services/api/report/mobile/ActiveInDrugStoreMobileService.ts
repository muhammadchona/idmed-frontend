import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import ActiveInDrugStore from 'src/stores/models/report/patient/ActiveInDrugStore';
import clinicService from '../../clinicService/clinicService';
import startStopReasonService from '../../startStopReasonService/startStopReasonService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import packService from '../../pack/packService';
import db from 'src/stores/dexie';

const activeInDrugStore = db[ActiveInDrugStore.entity];
const { idadeReportCalculator } = useDateUtils();
export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    const clinic = clinicService.getById(reportParams.clinicId);

    const [activePacks] = await Promise.all([
      packService.getAllActivePatientByEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);
    let lastDispensations = activePacks.reduce((acc: any, record: any) => {
      const patientId = record?.patientvisitDetails?.patientVisit?.patient?.id;
      if (!patientId) {
        return acc;
      }
      const existingRecord = acc[patientId];
      if (
        !existingRecord ||
        new Date(record.pickupDate) > new Date(existingRecord.pickupDate)
      ) {
        acc[patientId] = record;
      }
      return acc;
    }, []);

    lastDispensations = Object.values(lastDispensations);

    for (const pack of lastDispensations) {
      const patientvisitDetails = pack?.patientvisitDetails;
      const patient = patientvisitDetails?.patientVisit?.patient;
      const identifier = patientvisitDetails?.episode?.patientServiceIdentifier;
      if (!patient || !identifier) {
        continue;
      }

      const prescription = patientvisitDetails?.prescription;
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

      const activePatient = new ActiveInDrugStore();
      activePatient.reportId = reportParams.id;
      activePatient.year = reportParams.year;
      activePatient.startDate = reportParams.startDate;
      activePatient.endDate = reportParams.endDate;
      activePatient.province = clinic?.province?.description ?? '';

      activePatient.clinic = clinic?.clinicName ?? '';
      activePatient.district = clinic?.district?.description ?? '';

      activePatient.nid = identifier.value;
      activePatient.firstNames = patient.firstNames;
      activePatient.middleNames = patient.middleNames;
      activePatient.lastNames = patient.lastNames;
      activePatient.cellphone = patient.cellphone;
      activePatient.patientType = patientType;
      activePatient.pickupDate = pack.pickupDate;
      activePatient.nextPickUpDate = pack.nextPickUpDate;
      activePatient.therapeuticRegimen = therapeuticRegimen?.description ?? '';
      activePatient.therapeuticLine = therapeuticLine?.description ?? '';
      activePatient.age = idadeReportCalculator(patient.dateOfBirth);
      activePatient.id = uuidv4();
      await this.localDbAddOrUpdate(activePatient);
    }
  },
  groupedPatientVisits(patientVisitDetails: any, reportParams: any) {
    // &&  moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').isAfter( moment(reportParams.endDate)
    const result = patientVisitDetails.filter(
      (patientVisitDetail) =>
        patientVisitDetail?.pack !== undefined &&
        patientVisitDetail?.patientVisit?.patient
    );
    const sortedArray = result.sort((a, b) => {
      return a.patientVisit.visitDate - b.patientVisit.visitDate;
    });
    const resultGroupedPatientVisits = this.groupedMapChild(sortedArray);
    return resultGroupedPatientVisits;
  },
  getStartStopReasonTypeById(id: any) {
    return startStopReasonService.getById(id);
  },

  groupedMapChild(items: any) {
    return items.reduce((entryMap, e) => {
      const patientId = e?.patientVisit?.patient?.id;
      if (!patientId) return entryMap;
      return entryMap.set(patientId, [...(entryMap.get(patientId) || []), e]);
    }, new Map());
  },

  localDbAddOrUpdate(data: any) {
    return activeInDrugStore.add(data).catch((error: any) => {});
  },

  async localDbGetAllByReportId(reportId: any) {
    return activeInDrugStore
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
