import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import patientVisitService from '../../patientVisit/patientVisitService';
import patientHistoryReport from 'src/stores/models/report/pharmacyManagement/PatientHistoryReport';
import dispenseTypeService from '../../dispenseType/dispenseTypeService';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import dispenseModeService from '../../dispenseMode/dispenseModeService';
import patientService from '../../patientService/patientService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

   async getDataLocalDb(params) {
    const reportParams = ReportDatesParams.determineStartEndDate(params)
 
    console.log(reportParams)
    const patientVisitList = await patientVisitService.localDbGetAllPatientVisit()
    for (const patientVisit of patientVisitList) {
      for (const patientVisitDetail of patientVisit.patientVisitDetails) {
        if (patientVisitDetail.pack !== undefined) {
        const pickupDate = moment(patientVisitDetail.pack.pickupDate).format('YYYY-MM-DD')
        const endDate = moment(params.endDate).format('YYYY-MM-DD')
        const startDate = moment(params.startDate).format('YYYY-MM-DD')
        const days = moment(endDate).diff(pickupDate, 'days')
        const newDate = moment(patientVisitDetail.pack.pickupDate).add(days, 'd')

        if ((patientVisit.visitDate >= reportParams.startDate && patientVisit.visitDate <= reportParams.endDate) ||
        (newDate >= moment(params.startDate) && newDate <= moment(params.endDate))) {
          const patientHistory = new patientHistoryReport()
          const dispenseType = await dispenseTypeService.getById(patientVisitDetail.prescription.prescriptionDetails[0].dispenseType.id)
            if (pickupDate >= startDate && dispenseType.code === 'DT') {
              patientHistory.dispenseType = 'DT'
            } else if (pickupDate < startDate && dispenseType.code === 'DT') {
              patientHistory.dispenseType = 'DT - TRANSPORTE'
            } else if (pickupDate >= startDate && dispenseType.code === 'DS') {
              patientHistory.dispenseType = 'DS'
            } else if (pickupDate < startDate && dispenseType.code === 'DS') {
              patientHistory.dispenseType = 'DS - TRANSPORTE'
            } else if (pickupDate >= startDate && dispenseType.code === 'DM') {
              patientHistory.dispenseType = 'DM'
            } else if (pickupDate < startDate && dispenseType.code === 'DM') {
              patientHistory.dispenseType = 'DM - TRANSPORTE'
            } else {
              patientHistory.dispenseType = dispenseType.description
            }
          patientHistory.reportId = reportParams.id
          // patientHistory.period = reportParams.periodTypeView
          patientHistory.year = reportParams.year
          patientHistory.startDate = reportParams.startDate
          patientHistory.endDate = reportParams.endDate
          const identifier = await patientServiceIdentifierService.localDbGetById(patientVisitDetail.episode.patientServiceIdentifier.id)
          if (identifier.length > 0) {
              // const serviceIdentifier = identifier
              const pack = patientVisitDetail.pack
              const clinic = patientVisitDetail.clinic
              const clinicalService = await clinicalServiceService.localDbGetById(identifier[0].service.id)
              const therapeuticRegimen = await therapeuticalRegimenService.getById(patientVisitDetail.prescription.prescriptionDetails[0].therapeuticRegimen.id)
            const dispenseMode = await dispenseModeService.localDbGetById(pack.dispenseMode.id)
              // const episode = reportData.episode
            // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)
            const patient = await  patientService.getPatientByIdMobile( patientVisit.patient.id)
              patientHistory.nid = identifier[0].value
              patientHistory.firstNames = patient[0].firstNames
              patientHistory.middleNames = patient[0].middleNames
              patientHistory.lastNames = patient[0].lastNames
              patientHistory.cellphone = patient[0].cellphone
            // patientHistory.tipoTarv =
              patientHistory.pickUpDate = pack.pickupDate
              patientHistory.nexPickUpDate = pack.nextPickUpDate
              patientHistory.therapeuticalRegimen = therapeuticRegimen.description
              patientHistory.age = this.idadeCalculator( patient[0].dateOfBirth)
              patientHistory.dispenseMode = dispenseMode.description
              patientHistory.clinicalService = clinicalService.description
              patientHistory.clinic = clinic.clinicName
              patientHistory.id = uuidv4()
              this.localDbAddOrUpdate(patientHistory)
              console.log(patientHistory)
        }
        }
      }
    }
    }
  },

    localDbAddOrUpdate (targetCopy: any) {
        return nSQL().onConnected(() => {
            nSQL(patientHistoryReport.entity).query('upsert', targetCopy).exec()
        })
        },

    async localDbGetAllByReportId (reportId: any) {
        return nSQL(patientHistoryReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
            if (result !== undefined) {
            return result
            }
            return null
        })
        },
     async getDataLocalReport (reportId: string) {
          
      return nSQL(patientHistoryReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
        return result
    })   
        },
        idadeCalculator (birthDate: string) {
          if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
             const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD')
             const todayDate = moment(new Date())
             const idade = todayDate.diff(utentBirthDate, 'years')
             console.log(idade)
            return idade
          }
      }

}