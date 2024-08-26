import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import AbsentPatientReport from 'src/stores/models/report/pharmacyManagement/AbsentPatientReport';
import patientService from '../../patientService/patientService';
import db from 'src/stores/dexie';
import packService from '../../pack/packService';
import { v4 as uuidv4 } from 'uuid';
const absentPatientReport = AbsentPatientReport.entity;
// const activeInDrugStore = useRepo(ActiveInDrugStore);

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);
    const patientVisitList = await patientVisitService.getMobile();
    const patientVisitDetails = [];
    for (const pvisit of patientVisitList) {
      for (const pVisitDetail of pvisit.patientVisitDetails) {
        pVisitDetail.patientVisit = pvisit;
        patientVisitDetails.push(pVisitDetail);
      }
    }
    const reportDatas = this.groupedPatientVisits(patientVisitDetails);
    for (const reportData of reportDatas) {
      const patientVisit = reportData[1].patientVisit;
      const idPatient = patientVisit.patient.id;
      const patient = await patientService.getPatientByIdMobile(idPatient);
      let identifier;
      if (patient.identifiers.length > 0) {
        identifier = patient.identifiers[0];
      }
      if (!identifier) {
        identifier =
          patientServiceIdentifierService.localDbGetByPatientId(idPatient);
      }
      for (const reportData of patientVisit.patientVisitDetails) {
        let pack = reportData.pack;
        if (pack.pickupDate === null || pack.pickupDate === undefined) {
          pack = await packService.getPackMobileById(reportData.pack.id);
        }
        if (
          pack !== undefined &&
          moment(reportData.pack.nextPickUpDate).format('YYYY/MM/DD') >=
            moment(reportParams.startDate).format('YYYY/MM/DD') &&
          moment(pack.nextPickUpDate).add(3, 'd').format('YYYY/MM/DD') <=
            moment(reportParams.endDate).format('YYYY/MM/DD')
        ) {
          if (patient.identifiers.length > 0) {
            identifier = patient.identifiers[0];
          }
          if (!identifier) {
            identifier =
              await patientServiceIdentifierService.localDbGetByPatientId(
                idPatient
              );
          }
          if (identifier) {
            if (identifier.service.id === reportParams.clinicalService) {
              const absentPatientReport = new AbsentPatientReport();

              if (patient) {
                const dateIdentifiedAbandonment = moment(
                  reportData.pack.nextPickUpDate
                )
                  .add(60, 'd')
                  .format('YYYY/MM/DD');
                absentPatientReport.nid = identifier.value;
                absentPatientReport.name =
                  patient.firstNames + ' ' + patient.lastNames;
                absentPatientReport.cellphone = patient.cellphone;
                absentPatientReport.dateBackUs = null;
                console.log(pack);
                console.log(
                  absentPatientReport.name + '' + pack.nextPickUpDate
                );
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
                this.localDbAddOrUpdate(absentPatientReport);
              }
            }
          }
        }
      }
    }
  },

  groupedPatientVisits(patientVisitDetails: any) {
    const result = patientVisitDetails.filter(
      (patientVisitDetail: any) => patientVisitDetail.pack !== undefined
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
      const patientId = e.patientVisit.patient.id;
      if (!entryMap.has(patientId)) {
        entryMap.set(patientId, e);
      }
      return entryMap;
    }, new Map());
  },
  localDbAddOrUpdate(data: any) {
    return db[absentPatientReport].add(data).catch((error: any) => {
      console.log(error);
    });
  },

  localDbGetAllByReportId(reportId: any) {
    return db[absentPatientReport]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
