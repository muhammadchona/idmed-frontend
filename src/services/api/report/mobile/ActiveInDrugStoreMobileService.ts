import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import patientVisitService from '../../patientVisit/patientVisitService';
import { v4 as uuidv4 } from 'uuid';
import ActiveInDrugStore from 'src/stores/models/report/patient/ActiveInDrugStore';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';
import moment from 'moment';
import clinicService from '../../clinicService/clinicService';
import startStopReasonService from '../../startStopReasonService/startStopReasonService';
import patientService from '../../patientService/patientService';
import therapeuticalRegimenService from '../../therapeuticalRegimenService/therapeuticalRegimenService';
import therapeuticLineService from '../../therapeuticLineService/therapeuticLineService';

// const activeInDrugStore = useRepo(ActiveInDrugStore);



export default {

    async getDataLocalDb(params: any) {      
        
        const reportParams = ReportDatesParams.determineStartEndDate(params)
        const clinic = clinicService.getById(reportParams.clinicId)
          const patientVisitDetails = []
         const patientVisits = await patientVisitService.localDbGetAllPatientVisit()

            for (const pvisit of patientVisits) {
              for (const pVisitDetail of   pvisit.patientVisitDetails ) {
                pVisitDetail.patientVisit = pvisit
                patientVisitDetails.push(pVisitDetail)
              }

            }
            const reportDatas =   this.groupedPatientVisits(patientVisitDetails, reportParams)

           for (const reportData of reportDatas) {
              const activePatient = new ActiveInDrugStore()
              activePatient.reportId = reportParams.id
              activePatient.year = reportParams.year
              activePatient.startDate = reportParams.startDate
              activePatient.endDate = reportParams.endDate
              activePatient.province = clinic.province.description

              const reportResp = reportData[1] 
                const identifier = reportResp[0].episode.patientServiceIdentifier
                const startStopReasonType = reportResp[0].episode.startStopReason
                if (identifier.service.id === reportParams.clinicalService && startStopReasonType.isStartReason) {
                  const pack = reportResp[0].pack
                  const clinicObj = clinic
                  const idPatient =reportResp[0].patientVisit.patient.id
                  const patient = await  patientService.getPatientByIdMobile( idPatient)
                  console.log('PATIENTOBJ: ', patient)
                  const prescription = reportResp[0].prescription
                  const therapeuticRegimen =therapeuticalRegimenService.getById( prescription.prescriptionDetails[0].therapeuticRegimen.id)
                  const therapeuticLine =  therapeuticLineService.getById( prescription.prescriptionDetails[0].therapeuticLine.id)
                    activePatient.clinic = clinicObj.clinicName
                    activePatient.district = clinicObj.district.description
                    activePatient.nid = identifier.value
                    activePatient.firstNames = patient[0].firstNames
                    activePatient.middleNames = patient[0].middleNames
                    activePatient.lastNames = patient[0].lastNames
                    activePatient.cellphone = patient[0].cellphone
                    activePatient.patientType = prescription.patientType
                    activePatient.pickupDate = pack.pickupDate
                    activePatient.nextPickUpDate = pack.nextPickUpDate
                    activePatient.therapeuticRegimen = therapeuticRegimen.description
                    activePatient.therapeuticLine = therapeuticLine.description
                    activePatient.age = this.idadeCalculator(patient[0].dateOfBirth)
                    activePatient.id = uuidv4()
                    console.log('activePatient: ', activePatient)
                   this.localDbAddOrUpdate(activePatient)
                }
            }
    },
     groupedPatientVisits (patientVisitDetails: any, reportParams: any) {
      // &&  moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').isAfter( moment(reportParams.endDate)
        const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.pack!== undefined  )
        console.log('RESULT: ', result)
        console.log('RESULT: ', result)
        const sortedArray =  result.sort((a, b) => { return a.patientVisit.visitDate - b.patientVisit.visitDate })
        console.log('SORTEDARRAY: ', sortedArray)
        const resultGroupedPatientVisits = this.groupedMapChild(sortedArray)
        return resultGroupedPatientVisits
      }, 
      getStartStopReasonTypeById  (id: any) {
        return startStopReasonService.getById( id)
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
     async getDataLocalReport (reportId: string) {
          
      return nSQL(ActiveInDrugStore.entity).query('select').where(['reportId', '=', reportId]).exec().then( result => {
        return result
    })
          
           
        }

}