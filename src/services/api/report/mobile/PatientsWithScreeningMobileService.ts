import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import PatientsWithScreeningReport from 'src/stores/models/report/patient/PatientsWithScreeningReport';
import db from 'src/stores/dexie';
import { v4 as uuidv4 } from 'uuid';
import drugService from '../../drugService/drugService';
import patientService from '../../patientService/patientService';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import clinicService from '../../clinicService/clinicService';

const patientsWithScreeningReport = PatientsWithScreeningReport.entity;
const { idadeCalculator } = useDateUtils();

export default {
  async getDataLocalDbForPregnancyScreening(params: any) {
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
      const patientsWithPregnancyScreening = new PatientsWithScreeningReport();
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
          patientsWithPregnancyScreening.isPregnant = 'Não';
        }

        this.localDbAddOrUpdate(patientsWithPregnancyScreening);
        console.log(patientsWithPregnancyScreening);
      }
    }
  },

  async getDataLocalDbMonitoredForAdherence(params: any) {
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
      const patientsWithPregnancyScreening = new PatientsWithScreeningReport();
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

  async getDataLocalDbForTBScreening(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);
    const patientVisitList =
      await patientVisitService.getLocalDbPatientVisitsBetweenDatesWithTBScreening(
        params.startDate,
        params.endDate
      );

    for (const patientVisit of patientVisitList) {
      const tbScreening = patientVisit.tbScreenings[0];
      const tbScreeningReport = new PatientsWithScreeningReport();

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
        tbScreeningReport.wasTBScreened = 'Não';
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
      const ramScreeningReport = new PatientsWithScreeningReport();

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
        ramScreeningReport.wasRAMScreened = 'Não';
      }

      this.localDbAddOrUpdate(ramScreeningReport);
    }
  },

  localDbAddOrUpdate(data: any) {
    return db[patientsWithScreeningReport].add(data).catch((error: any) => {
      console.log(error);
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return db[patientsWithScreeningReport]
      .where('reportId')
      .equalsIgnoreCase(reportId)
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
};
