import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import { v4 as uuidv4 } from 'uuid';
import ActiveInDrugStore from 'src/stores/models/report/patient/ActiveInDrugStore';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import moment from 'moment';
import patientServiceIdentifierService from '../../patientServiceIdentifier/patientServiceIdentifierService';
import AbsentPatientReport from 'src/stores/models/report/pharmacyManagement/AbsentPatientReport';
import Patient from 'src/stores/models/patient/Patient';
import patientService from '../../patientService/patientService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

     getDataLocalDb(params: any) {      
        
      const reportParams = ReportDatesParams.determineStartEndDate(params)
      console.log(reportParams)
      const patientVisitList =  patientVisitService.localDbGetAllPatientVisit()
      for (const patientVisit of patientVisitList) {
        for (const reportData of patientVisit.patientVisitDetails) {
         if (moment(reportData.pack.nextPickUpDate).format('YYYY/MM/DD') <= moment(reportParams.startDate).format('YYYY/MM/DD') && moment(reportData.pack.nextPickUpDate).add(3, 'd').format('YYYY/MM/DD') <= moment(reportParams.endDate).format('YYYY/MM/DD')) {
            patientServiceIdentifierService.apiGetAllByPatientId(reportData.episode.patientServiceIdentifier.id,0,0).then((identifier) =>{
              if (identifier.length > 0) {
                  if (identifier[0].service.id === reportParams.clinicalService) {
                      const absentPatientReport = new AbsentPatientReport()
                        patientService.apiFetchById(patientVisit.patient.id).then((patient) =>{
                      if (patient.length > 0) {
                       const dateIdentifiedAbandonment = moment(reportData.pack.nextPickUpDate).add(60, 'd').format('YYYY/MM/DD')
                      absentPatientReport.nid = identifier[0].value
                      absentPatientReport.firstNames = patient[0].firstNames + ' ' + patient[0].lastNames
                      absentPatientReport.cellphone = patient[0].cellphone
                      absentPatientReport.dateBackUs = null
                      absentPatientReport.dateMissedPickUp = reportData.pack.nextPickUpDate
                      absentPatientReport.dateIdentifiedAbandonment = dateIdentifiedAbandonment > moment(reportParams.endDate).format('YYYY/MM/DD') ? dateIdentifiedAbandonment : ''
                      absentPatientReport.returnedPickUp = null
                      absentPatientReport.reportId = reportParams.id
                      absentPatientReport.year = reportParams.year
                      absentPatientReport.endDate = reportParams.endDate
                      this.localDbAddOrUpdate(absentPatientReport)
                    }
                    } )
                  }
                }

                  })
                  }
                }
    }
      } ,

    localDbAddOrUpdate (targetCopy: any) {
        return nSQL().onConnected(() => {
            nSQL(AbsentPatientReport.entity).query('upsert', targetCopy).exec()
        })
        },

    localDbGetAllByReportId (reportId: any) {
        return nSQL(AbsentPatientReport.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
            if (result !== undefined) {
            return result
            }
            return null
        })
        },
     getDataLocalReport (reportId: any) {
          let data = []
           this.localDbGetAllByReportId(reportId).then( reports => {
            const reportData = []
              if (reports !== null) {
                reports.forEach(report => {
                  if (report.reportId === reportId) {
                    reportData.push(report)
                  }
                })
              }
              data = reportData
            })
            return data
        }

}