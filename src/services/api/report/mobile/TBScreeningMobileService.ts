import { nSQL } from 'nano-sql';
import { useRepo } from 'pinia-orm';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import TBScreeningReport from 'src/stores/models/report/patient/TBScreeningReport';
import patientService from '../../patientService/patientService';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import clinicService from '../../clinicService/clinicService';

const { idadeCalculator } = useDateUtils();

const tBScreeningReport = useRepo(TBScreeningReport);
const TBScreeningReportDexie = TBScreeningReport.entity;

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);
    const patientVisitList =
      await patientVisitService.localDbGetAllPatientVisit();
    for (const patientVisit of patientVisitList) {
      if (
        moment(patientVisit.visitDate).format('YYYY/MM/DD') >=
          moment(reportParams.startDate).format('YYYY/MM/DD') &&
        moment(patientVisit.visitDate).format('YYYY/MM/DD') <=
          moment(reportParams.endDate).format('YYYY/MM/DD')
      ) {
        const tbScreening = patientVisit.tbScreenings[0];
        const tbScreeningReport = new TBScreeningReport();
        if (tbScreening !== null && tbScreening !== undefined) {
          const patient = await patientService.getPatientByIdMobile(
            patientVisit.patient.id
          );

          let identifier = patient.identifiers[0];

          if (!identifier) {
            const idents =
              await patientServiceIdentifierService.getAllMobileByPatientId(
                patientVisit.patient.id
              );
            identifier = idents[0];
          }
          tbScreeningReport.id = uuidv4();
          tbScreeningReport.nid = identifier.value;
          tbScreeningReport.name =
            patient.firstNames +
            ' ' +
            patient.middleNames +
            ' ' +
            patient.lastNames;
          tbScreeningReport.age = idadeCalculator(patient.dateOfBirth);
          tbScreeningReport.gender = patient.gender;
          tbScreeningReport.dateRegister = patientVisit.visitDate;
          tbScreeningReport.clinic = clinicService.getActivebyClinicId(
            patientVisit.clinic.id
          ).clinicName;
          tbScreeningReport.reportId = reportParams.id;
          tbScreeningReport.year = reportParams.year;
          tbScreeningReport.endDate = reportParams.endDate;
          tbScreeningReport.startDate = reportParams.startDate;

          if (
            tbScreening.cough === true ||
            tbScreening.fever === true ||
            tbScreening.losingWeight === true ||
            tbScreening.sweating === true ||
            tbScreening.fatigueOrTirednessLastTwoWeeks === true
          ) {
            tbScreeningReport.wasTBScreened = 'Sim';
          } else {
            tbScreeningReport.wasTBScreened = 'Nao';
          }
          this.localDbAddOrUpdate(tbScreeningReport);
        }
      }
    }
  },

  async localDbAddOrUpdate(targetCopy: any) {
    return db[TBScreeningReportDexie].add(
      JSON.parse(JSON.stringify(targetCopy))
    )
      .then(() => {
        tBScreeningReport.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async localDbGetAllByReportId(reportId: any) {
    const records = await db[TBScreeningReportDexie].where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray();
    return records;
  },
};
