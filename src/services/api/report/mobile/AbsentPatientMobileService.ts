import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import AbsentPatientReport from 'src/stores/models/report/pharmacyManagement/AbsentPatientReport';
import db from 'src/stores/dexie';
import packService from '../../pack/packService';
import { v4 as uuidv4 } from 'uuid';

const absentPatientReport = db[AbsentPatientReport.entity];

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    const [ListPatientLastPack] = await Promise.all([
      packService.getAllPatientsLastPackForTARVFromDexie(),
    ]);
    const [activePacks] = await Promise.all([
      packService.getAllAbsentPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate,
        ListPatientLastPack
      ),
    ]);

    let lastDispensations = activePacks.reduce((acc: any, record: any) => {
      const patientId = record?.patientvisitDetails?.patientVisit?.patient?.id;
      if (!patientId) return acc;
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
      const patient = pack?.patientvisitDetails?.patientVisit?.patient;
      const identifier =
        pack?.patientvisitDetails?.episode?.patientServiceIdentifier;
      if (!patient || !identifier?.service) continue;

      if (identifier.service.id === reportParams.clinicalService) {
        const absentPatientReport = new AbsentPatientReport();

        if (patient) {
          const dateIdentifiedAbandonment = moment(pack.nextPickUpDate)
            .add(60, 'd')
            .format('YYYY/MM/DD');
          absentPatientReport.nid = identifier.value;
          absentPatientReport.name =
            patient.firstNames + ' ' + patient.lastNames;
          absentPatientReport.cellphone = patient.cellphone;
          absentPatientReport.dateBackUs = null;
          absentPatientReport.dateMissedPickUp = pack.nextPickUpDate;
          absentPatientReport.dateIdentifiedAbandonment =
            dateIdentifiedAbandonment >
            moment(reportParams.endDate).format('YYYY/MM/DD')
              ? dateIdentifiedAbandonment
              : '';
          absentPatientReport.returnedPickUp = null;
          absentPatientReport.reportId = reportParams.id;
          absentPatientReport.year = reportParams.year;
          absentPatientReport.endDate = reportParams.endDate;
          absentPatientReport.id = uuidv4();
          await this.localDbAddOrUpdate(absentPatientReport);
        }
      }
    }
  },

  groupedPatientVisits(patientVisitDetails: any) {
    const result = patientVisitDetails.filter(
      (patientVisitDetail: any) =>
        patientVisitDetail?.pack !== undefined &&
        patientVisitDetail?.patientVisit?.patient
    );
    const sortedArray = result.sort(
      (a, b) =>
        new Date(b.patientVisit.visitDate) - new Date(a.patientVisit.visitDate)
    );

    const resultGroupedPatientVisits = this.groupedMapChild(sortedArray);
    return resultGroupedPatientVisits;
  },

  groupedMapChild(items: []) {
    return items.reduce((entryMap, e) => {
      const patientId = e?.patientVisit?.patient?.id;
      if (!patientId) return entryMap;
      if (!entryMap.has(patientId)) {
        entryMap.set(patientId, e);
      }
      return entryMap;
    }, new Map());
  },
  localDbAddOrUpdate(data: any) {
    return absentPatientReport.add(data).catch((error: any) => {
      console.log(error);
    });
  },

  localDbGetAllByReportId(reportId: any) {
    return absentPatientReport
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
