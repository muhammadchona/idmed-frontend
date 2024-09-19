import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import { v4 as uuidv4 } from 'uuid';
import ActiveInDrugStore from 'src/stores/models/report/patient/ActiveInDrugStore';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import moment from 'moment';
import clinicService from '../../clinicService/clinicService';
import startStopReasonService from '../../startStopReasonService/startStopReasonService';
import patientService from '../../patientService/patientService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import therapeuticLineService from '../../therapeuticLineService/therapeuticLineService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import episodeService from '../../episode/episodeService';
import packService from '../../pack/packService';
import prescriptionService from '../../prescription/prescriptionService';
import db from 'src/stores/dexie';
import patientVisitDetailsService from '../../patientVisitDetails/patientVisitDetailsService';

const activeInDrugStore = ActiveInDrugStore.entity;
// const activeInDrugStore = useRepo(ActiveInDrugStore);
const { idadeReportCalculator } = useDateUtils();
export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    const clinic = clinicService.getById(reportParams.clinicId);
    const patientVisitDetails = [];
    const patientVisits =
      await patientVisitService.getLocalPatientVisitsBetweenDates(
        reportParams.startDate,
        reportParams.endDate
      );

    for (const pvisit of patientVisits) {
      for (const pVisitDetail of pvisit.patientVisitDetails) {
        pVisitDetail.patientVisit = pvisit;
        patientVisitDetails.push(pVisitDetail);
      }
    }
    const reportDatas = this.groupedPatientVisits(
      patientVisitDetails,
      reportParams
    );

    for (const reportData of reportDatas) {
      const activePatient = new ActiveInDrugStore();
      activePatient.reportId = reportParams.id;
      activePatient.year = reportParams.year;
      activePatient.startDate = reportParams.startDate;
      activePatient.endDate = reportParams.endDate;
      activePatient.province = clinic.province.description;

      const reportResp =
        await patientVisitDetailsService.getAllMobileByDetailsId(
          reportData[1][0].id
        );
      let identifier;
      // reportResp[0]
      const episode = await episodeService.apiFetchById(reportResp.episode.id);
      const startStopReasonType = episode.startStopReason;
      if (reportResp.patientVisit === null) {
        reportResp.patientVisit = await patientVisitService.getAllMobileById(
          reportResp.patient_visit_id
        );
      }
      const idPatient = reportResp.patientVisit.patient.id;
      const patient = await patientService.getPatientByIdMobile(idPatient);
      if (patient.identifiers.length > 0) {
        identifier = patient.identifiers[0];
      }
      if (!identifier) {
        identifier =
          await patientServiceIdentifierService.localDbGetByPatientId(
            idPatient
          );
      }
      if (
        identifier.service.id === reportParams.clinicalService &&
        startStopReasonType.isStartReason
      ) {
        let pack = reportResp.pack;
        let prescription = reportResp.prescription;
        if (pack.pickupDate === null || pack.pickupDate === undefined) {
          pack = await packService.getPackMobileById(pack.id);
        }
        if (
          prescription.prescriptionDate === null ||
          prescription.prescriptionDate === undefined
        ) {
          prescription = await prescriptionService.getPrescriptionMobileById(
            prescription.id
          );
        }
        const clinicObj = clinic;

        const therapeuticRegimen = therapeuticalRegimenService.getById(
          prescription.prescriptionDetails[0].therapeuticRegimen.id
        );
        const therapeuticLine = therapeuticLineService.getById(
          prescription.prescriptionDetails[0].therapeuticLine.id
        );
        activePatient.clinic = clinicObj.clinicName;
        activePatient.district = clinicObj.district.description;
        activePatient.nid = identifier.value;
        activePatient.firstNames = patient.firstNames;
        activePatient.middleNames = patient.middleNames;
        activePatient.lastNames = patient.lastNames;
        activePatient.cellphone = patient.cellphone;
        activePatient.patientType = prescription.patientType;
        activePatient.pickupDate = pack.pickupDate;
        activePatient.nextPickUpDate = pack.nextPickUpDate;
        activePatient.therapeuticRegimen = therapeuticRegimen.description;
        activePatient.therapeuticLine = therapeuticLine.description;
        activePatient.age = idadeReportCalculator(patient.dateOfBirth);
        activePatient.id = uuidv4();
        this.localDbAddOrUpdate(activePatient);
      }
    }
  },
  groupedPatientVisits(patientVisitDetails: any, reportParams: any) {
    // &&  moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').isAfter( moment(reportParams.endDate)
    const result = patientVisitDetails.filter(
      (patientVisitDetail) => patientVisitDetail.pack !== undefined
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
    return items.reduce(
      (entryMap, e) =>
        entryMap.set(e.patientVisit.patient.id, [
          ...(entryMap.get(e.patientVisit.patient.id) || []),
          e,
        ]),
      new Map()
    );
  },

  localDbAddOrUpdate(data: any) {
    return db[activeInDrugStore].add(data).catch((error: any) => {});
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[activeInDrugStore]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
