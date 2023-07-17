import { nSQL } from 'nano-sql';
import moment from 'moment';
import ReferredPatientsReport from 'src/stores/models/report/referralManagement/ReferredPatientsReport';
import prescriptionService from '../../prescription/prescriptionService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import therapeuticLineService from '../../therapeuticLineService/therapeuticLineService';
import dispenseTypeService from '../../dispenseType/dispenseTypeService';
import { v4 as uuidv4 } from 'uuid';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';

const { idadeCalculator, getDDMMYYYFromJSDate } =
  useDateUtils();

export default {

  saveReferredPatientsOnNano(referredPatientsResult: any, reportParams: any, clinic:any) {
    const referredPatientsFinalList = []
    for (const reportData of referredPatientsResult) {
      const referredPatient = new ReferredPatientsReport()
      referredPatient.reportId = reportParams.id
      referredPatient.year = reportParams.year
      referredPatient.startDate = reportParams.startDate
      referredPatient.endDate = reportParams.endDate
      referredPatient.province = clinic.province.description

      referredPatient.id = uuidv4()
      referredPatient.nid = reportData.nid
      referredPatient.name = reportData.firstNames+' '+reportData.middleNames+' '+reportData.lastNames
      referredPatient.age = idadeCalculator(new Date(getDDMMYYYFromJSDate(new Date(reportData.dateOfBirth))))
      referredPatient.referrenceDate = reportData.referenceDate
      referredPatient.nextPickUpDate = reportData.nextPickUpDate

      const prescriptionAux = prescriptionService.getPrescriptionByID(reportData.prescriptionId)
      const therapeuticRegAux = therapeuticalRegimenService.getById(prescriptionAux?.prescriptionDetails[0]?.therapeutic_regimen_id)
      const therapeuticLineAux = therapeuticLineService.getById(prescriptionAux?.prescriptionDetails[0]?.therapeutic_line_id)
      const dispenseTypeAux = dispenseTypeService.getById(prescriptionAux?.prescriptionDetails[0]?.dispense_type_id)
      if(therapeuticRegAux !== null) referredPatient.therapeuticRegimen = therapeuticRegAux.code
      if(therapeuticLineAux !== null) referredPatient.therapeuticLine = therapeuticLineAux.code
      if(dispenseTypeAux !== null) referredPatient.dispenseType = dispenseTypeAux.code

      referredPatient.referralPharmacy = reportData.referralClinic?.clinicName


      referredPatient.lastPrescriptionDate = prescriptionService.getLastPrescriptionFromPatientVisitDetails(reportData.prescriptionId)?.prescriptionDate
      referredPatientsFinalList.push(referredPatient)

      console.log(referredPatient)

      this.localDbAddOrUpdate(referredPatient)
    }
},

localDbAddOrUpdate (targetCopy: any) {
  return nSQL(ReferredPatientsReport.entity).query('upsert', JSON.parse( JSON.stringify(targetCopy))).exec()
},

getDataLocalReport (reportId: string) {
  return nSQL(ReferredPatientsReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
    return result
  })
},

idadeCalculator(birthDate: any) {
  if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
      const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD')
      const todayDate = moment(new Date())
      const idade = todayDate.diff(utentBirthDate, 'years')
    return idade
  }
},

}
