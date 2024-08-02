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
      await patientVisitService.getLocalDbPatientVisitsBetweenDatesWithTBScreening(
        params.startDate,
        params.endDate
      );

    for (const patientVisit of patientVisitList) {
      const tbScreening = patientVisit.tbScreenings[0];
      const tbScreeningReport = new TBScreeningReport();

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
      tbScreeningReport.clinic = clinicService.getById(
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
  },

  async getDataLocalDbRAM(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);
    const patientVisitList =
      await patientVisitService.getLocalDbPatientVisitsBetweenDatesWithRAMScreening(
        params.startDate,
        params.endDate
      );

    for (const patientVisit of patientVisitList) {
      const ramScreening = patientVisit.tbScreenings[0];
      const ramScreeningReport = new TBScreeningReport();

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
      ramScreeningReport.id = uuidv4();
      ramScreeningReport.nid = identifier.value;
      ramScreeningReport.name =
        patient.firstNames +
        ' ' +
        patient.middleNames +
        ' ' +
        patient.lastNames;
      ramScreeningReport.age = idadeCalculator(patient.dateOfBirth);
      ramScreeningReport.gender = patient.gender;
      ramScreeningReport.dateRegister = patientVisit.visitDate;
      ramScreeningReport.clinic = clinicService.getById(
        patientVisit.clinic.id
      ).clinicName;
      ramScreeningReport.reportId = reportParams.id;
      ramScreeningReport.year = reportParams.year;
      ramScreeningReport.endDate = reportParams.endDate;
      ramScreeningReport.startDate = reportParams.startDate;

      if (ramScreening.adverseReactionMedicine === true) {
        ramScreeningReport.wasRAMScreened = 'Sim';
      } else {
        ramScreeningReport.wasRAMScreened = 'Nao';
      }

      this.localDbAddOrUpdate(ramScreeningReport);
    }
  },

  async localDbAddOrUpdate(targetCopy: any) {
    return db[TBScreeningReportDexie].add(
      JSON.parse(JSON.stringify(targetCopy))
    )
      .then(() => {
        tBScreeningReport.save(targetCopy);
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
