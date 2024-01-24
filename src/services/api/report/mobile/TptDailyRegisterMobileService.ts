import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import StockReceivedReport from 'src/stores/models/report/stock/StockReceivedReport';
import patientVisitService from '../../patientVisit/patientVisitService';
import moment from 'moment';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';
import clinicalServiceService from '../../clinicalServiceService/clinicalServiceService';
import patientService from '../../patientService/patientService';
import drugService from '../../drugService/drugService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import therapeuticLineService from '../../therapeuticLineService/therapeuticLineService';
import dispenseTypeService from '../../dispenseType/dispenseTypeService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

   async getDataLocalDb(params: any) {
    
    const reportParams = ReportDatesParams.determineStartEndDate(params)
    console.log(reportParams)
    const patientVisits = await patientVisitService.localDbGetAllPatientVisit()
    for (const patientVisit of patientVisits) {
        for (const patientVisitDetail of patientVisit.patientVisitDetails) {
          if (patientVisitDetail.pack !== undefined) {
          const pickupDate = moment(patientVisitDetail.pack.pickupDate).format('YYYY-MM-DD')
        const endDate = moment(params.endDate).format('YYYY-MM-DD')
        const days = moment(endDate).diff(pickupDate, 'days')
        const newDate = moment(patientVisitDetail.pack.pickupDate).add(days, 'd')

        if ((patientVisit.visitDate >= reportParams.startDate && patientVisit.visitDate <= reportParams.endDate) ||
        (newDate >= moment(params.startDate) && newDate <= moment(params.endDate))) {
            const identifier = patientVisitDetail.episode.patientServiceIdentifier
        if (identifier.service.id === reportParams.clinicalService) {
        const tptDailyRegisterReport = new ArvDailyRegisterTempReport()
        tptDailyRegisterReport.reportId = reportParams.id
      // arvDailyRegisterReport.period = reportParams.periodTypeView
      tptDailyRegisterReport.year = reportParams.year
      tptDailyRegisterReport.startDate = reportParams.startDate
      tptDailyRegisterReport.endDate = reportParams.endDate
          const pack = patientVisitDetail.pack
      const clinic = patientVisitDetail.clinic
      const patient = await  patientService.getPatientByIdMobile( patientVisit.patient.id)
      tptDailyRegisterReport.nid = identifier.value
      tptDailyRegisterReport.patientName = patient[0].firstNames + ' ' + patient[0].middleNames + ' ' + patient[0].lastNames
      tptDailyRegisterReport.patientType = patientVisitDetail.prescription.patientType
      tptDailyRegisterReport.startReason = patientVisitDetail.episode.startStopReason.reason
      const age = this.idadeCalculator(patient[0].dateOfBirth)
       console.log(age)
      tptDailyRegisterReport.ageGroup_0_4 = (age >= 0 && age < 4 ? 'Sim' : 'Nao')
      tptDailyRegisterReport.ageGroup_5_9 = (age >= 5 && age <= 9 ? 'Sim' : 'Nao')
      tptDailyRegisterReport.ageGroup_10_14 = (age >= 10 && age <= 14 ? 'Sim' : 'Nao')
     tptDailyRegisterReport.ageGroup_Greater_than_15 = (age >= 15 ? 'Sim' : 'Nao')
     tptDailyRegisterReport.pickUpDate = pack.pickupDate
     tptDailyRegisterReport.nexPickUpDate = pack.nextPickUpDate
     const therapeuticRegimen = await therapeuticalRegimenService.getById(patientVisitDetail.prescription.prescriptionDetails[0].therapeuticRegimen.id)
     const therapeuticLine = await therapeuticLineService.getById(patientVisitDetail.prescription.prescriptionDetails[0].therapeuticLine.id)
     const dispenseType = await dispenseTypeService.getById(patientVisitDetail.prescription.prescriptionDetails[0].dispenseType.id)

     tptDailyRegisterReport.regime = therapeuticRegimen.description
     tptDailyRegisterReport.dispensationType = dispenseType[0].description
     tptDailyRegisterReport.therapeuticLine = therapeuticLine.description
     tptDailyRegisterReport.clinic = clinic.clinicName
     tptDailyRegisterReport.prep = (clinicalServiceService.localDbGetById(reportParams.clinicalService).code === 'TPT' ? 'Sim' : '')
     tptDailyRegisterReport.ppe = (clinicalServiceService.localDbGetById(reportParams.clinicalService).code === 'PPE' ? 'Sim' : '')
     const drugQuantityTemps = []
      for (const packagedDrug of patientVisitDetail.pack.packagedDrugs) {
        const drug = drugService.getCleanDrugById(packagedDrug.drug.id)
          const drugQuantityTemp = {}
          drugQuantityTemp.drugName = drug.name
          drugQuantityTemp.quantity = packagedDrug.quantitySupplied
          console.log(drugQuantityTemp)
         drugQuantityTemps.push(drugQuantityTemp)
         console.log(tptDailyRegisterReport)
        }
        console.log(drugQuantityTemps)
        tptDailyRegisterReport.drugQuantityTemps = drugQuantityTemps
       this.localDbAddOrUpdate(tptDailyRegisterReport)
        }
      }
    }
        }
      }
   },

 

    localDbAddOrUpdate (targetCopy: any) {
        return nSQL().onConnected(() => {
            nSQL(ArvDailyRegisterTempReport.entity).query('upsert', targetCopy).exec()
        })
        },

    async localDbGetAllByReportId (reportId: any) {
        return nSQL(ArvDailyRegisterTempReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
            if (result !== undefined) {
            return result
            }
            return null
        })
        },
     async getDataLocalReport (reportId: string) {
          
      return nSQL(ArvDailyRegisterTempReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
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