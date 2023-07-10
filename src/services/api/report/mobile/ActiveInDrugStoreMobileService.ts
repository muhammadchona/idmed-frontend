import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import { v4 as uuidv4 } from 'uuid';
import ActiveInDrugStore from 'src/stores/models/report/patient/ActiveInDrugStore';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import moment from 'moment';
import clinicService from '../../clinicService/clinicService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

     getDataLocalDb(params: any) {      
        
        const reportParams = ReportDatesParams.determineStartEndDate(params)
        const clinic = clinicService.getById(reportParams.clinicId)
          const patientVisitDetails = []
          patientVisitService.localDbGetAllPatientVisit().then(patientVisits => {
            patientVisits.forEach(pvisit => {
              pvisit.patientVisitDetails.forEach(pVisitDetail => {
                patientVisitDetails.push(pVisitDetail)
              })
              pvisit.patientVisitDetails[0].patientVisit = pvisit
            })
            return this.groupedPatientVisits(patientVisitDetails, reportParams)
          }).then(reportDatas => {
              reportDatas.forEach(reportData => {
                
              const activePatient = new ActiveInDrugStore()
              activePatient.reportId = reportParams.id
              activePatient.year = reportParams.year
              activePatient.startDate = reportParams.startDate
              activePatient.endDate = reportParams.endDate
              activePatient.province = clinic.province.description

                const identifier = reportData[0].episode.patientServiceIdentifier
                const startStopReasonType = reportData[0].episode.startStopReason
                if (identifier.service.id === reportParams.clinicalService && startStopReasonType.isStartReason) {
                  const pack = reportData[0].pack
                  const clinicObj = clinic
                  const patient = reportData[0].patientVisit.patient
                  const prescription = reportData[0].prescription
                  const therapeuticRegimen = prescription.prescriptionDetails[0].therapeuticRegimen
                  const therapeuticLine = prescription.prescriptionDetails[0].therapeuticLine
                    activePatient.clinic = clinicObj.clinicName
                    activePatient.district = clinicObj.district.description
                    activePatient.nid = identifier.value
                    activePatient.firstNames = patient.firstNames
                    activePatient.middleNames = patient.middleNames
                    activePatient.lastNames = patient.lastNames
                    activePatient.cellphone = patient.cellphone
                    activePatient.patientType = prescription.patientType
                    activePatient.pickupDate = pack.pickupDate
                    activePatient.nextPickUpDate = pack.nextPickUpDate
                    activePatient.therapeuticRegimen = therapeuticRegimen.description
                    activePatient.therapeuticLine = therapeuticLine.description
                    activePatient.age = this.idadeCalculator(patient.dateOfBirth)
                    activePatient.id = uuidv4()
                    console.log('activePatient: ', activePatient)
                   this.localDbAddOrUpdate(activePatient)
                }
            })
          })
    },
    async groupedPatientVisits (patientVisitDetails: any, reportParams: any) {
        const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.pack!== undefined &&  moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').format() >= reportParams.endDate)
        console.log('RESULT: ', result)
        console.log('RESULT: ', result)
        const sortedArray = await result.sort((a, b) => { return a.patientVisit.visitDate - b.patientVisit.visitDate })
        console.log('SORTEDARRAY: ', sortedArray)
        const resultGroupedPatientVisits = this.groupedMapChild(sortedArray)
        return resultGroupedPatientVisits
      }, 
        getStartStopReasonTypeById  (id: any) {
        return StartStopReason.where('id', id).first()
      },


     groupedMapChild (items: any) {
    return items.reduce(
        (entryMap, e) => entryMap.set(e.patientVisit.patient.id, [...(entryMap.get(e.patientVisit.patient.id) || []), e], console.log(e.patientVisit.patient.id)),
        new Map()
      )
    },

      idadeCalculator(birthDate: any) {
            if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
               const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD')
               const todayDate = moment(new Date())
               const idade = todayDate.diff(utentBirthDate, 'years')
               console.log(idade)
              return idade
            }
        },

    localDbAddOrUpdate (targetCopy: any) {
        return nSQL().onConnected(() => {
            nSQL(ActiveInDrugStore.entity).query('upsert', targetCopy).exec()
        })
        },

    async localDbGetAllByReportId (reportId: any) {
        return nSQL(ActiveInDrugStore.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
            if (result !== undefined) {
            return result
            }
            return null
        })
        },
     async getDataLocalReport (reportId: any) {
          
          const reports = await  this.localDbGetAllByReportId(reportId)
         
            const reportData = []
              if (reports !== null) {
                reports.forEach(report => {
                  if (report.reportId === reportId) {
                    reportData.push(report)
                  }
                })
              }
          
            return reportData
        }

}