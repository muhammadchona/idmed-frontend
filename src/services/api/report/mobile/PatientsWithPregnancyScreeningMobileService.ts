import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import PatientsWithPregnancyScreening from 'src/stores/models/report/monitoring/PatientsWithPregnancyScreening';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import drugService from '../../drugService/drugService';
import patientService from '../../patientService/patientService';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import clinicService from '../../clinicService/clinicService';

const patientsWithPregnancyScreening = PatientsWithPregnancyScreening.entity;
const { idadeCalculator } = useDateUtils();

export default {
  async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    console.log(reportParams);

    console.log(reportParams);
    const patientVisitList =
      await patientVisitService.getLocalDbPatientVisitsBetweenDatesWithPregnancyScreening(
        params.startDate,
        params.endDate
      );
    console.log(patientVisitList);
    for (const patientVisit of patientVisitList) {
      const patientsWithPregnancyScreening =
        new PatientsWithPregnancyScreening();
      const endDate = moment(params.endDate).format('YYYY-MM-DD');
      const startDate = moment(params.startDate).format('YYYY-MM-DD');
      patientsWithPregnancyScreening.reportId = reportParams.id;
      patientsWithPregnancyScreening.startDate = startDate;
      patientsWithPregnancyScreening.endDate = endDate;
      patientsWithPregnancyScreening.year = reportParams.year;
      patientsWithPregnancyScreening.id = uuidv4();
      const patient = await patientService.getPatientByIdMobile(
        patientVisit.patient.id
      );
      let identifier;
      if (patient.identifiers.length > 0) {
        identifier = patient.identifiers[0];
      }
      if (!identifier) {
        identifier = patientServiceIdentifierService.localDbGetByPatientId(
          patientVisit.patient.id
        )[0];
      }
      if (identifier) {
        patientsWithPregnancyScreening.nid = identifier.value;
        patientsWithPregnancyScreening.firstNames = patient.firstNames;
        patientsWithPregnancyScreening.middleNames = patient.middleNames;
        patientsWithPregnancyScreening.lastNames = patient.lastNames;
        patientsWithPregnancyScreening.cellphone = patient.cellphone;
        patientsWithPregnancyScreening.gender = patient.gender;
        patientsWithPregnancyScreening.age = idadeCalculator(
          patient.dateOfBirth
        );
        patientsWithPregnancyScreening.visitDate = patientVisit.visitDate;
        patientsWithPregnancyScreening.clinic = clinicService.getById(
          patientVisit.clinic.id
        );

        if (patientVisit.pregnancyScreenings[0].pregnant === true) {
          patientsWithPregnancyScreening.isPregnant = 'Sim';
        } else {
          patientsWithPregnancyScreening.isPregnant = 'Nao';
        }

        this.localDbAddOrUpdate(patientsWithPregnancyScreening);
        console.log(patientsWithPregnancyScreening);
      }
    }
  },

  async getDataLocalDbMonitoredForAdherence(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);

    console.log(reportParams);

    console.log(reportParams);
    const patientVisitList =
      await patientVisitService.getLocalDbPatientVisitsBetweenDatesMonitoredForAdherence(
        params.startDate,
        params.endDate
      );
    console.log(patientVisitList);
    for (const patientVisit of patientVisitList) {
      const patientsWithPregnancyScreening =
        new PatientsWithPregnancyScreening();
      const endDate = moment(params.endDate).format('YYYY-MM-DD');
      const startDate = moment(params.startDate).format('YYYY-MM-DD');
      patientsWithPregnancyScreening.reportId = reportParams.id;
      patientsWithPregnancyScreening.startDate = startDate;
      patientsWithPregnancyScreening.endDate = endDate;
      patientsWithPregnancyScreening.year = reportParams.year;
      patientsWithPregnancyScreening.id = uuidv4();
      const patient = await patientService.getPatientByIdMobile(
        patientVisit.patient.id
      );
      let identifier;
      if (patient.identifiers.length > 0) {
        identifier = patient.identifiers[0];
      }
      if (!identifier) {
        identifier = patientServiceIdentifierService.localDbGetByPatientId(
          patientVisit.patient.id
        )[0];
      }
      if (identifier) {
        patientsWithPregnancyScreening.nid = identifier.value;
        patientsWithPregnancyScreening.firstNames = patient.firstNames;
        patientsWithPregnancyScreening.middleNames = patient.middleNames;
        patientsWithPregnancyScreening.lastNames = patient.lastNames;
        patientsWithPregnancyScreening.cellphone = patient.cellphone;
        patientsWithPregnancyScreening.gender = patient.gender;
        patientsWithPregnancyScreening.age = idadeCalculator(
          patient.dateOfBirth
        );
        patientsWithPregnancyScreening.visitDate = patientVisit.visitDate;
        patientsWithPregnancyScreening.clinic = clinicService.getById(
          patientVisit.clinic.id
        );

        this.localDbAddOrUpdate(patientsWithPregnancyScreening);
        console.log(patientsWithPregnancyScreening);
      }
    }
  },

  localDbAddOrUpdate(data: any) {
    return db[patientsWithPregnancyScreening].add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[patientsWithPregnancyScreening]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
