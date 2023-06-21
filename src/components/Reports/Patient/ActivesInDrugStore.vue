<template>
<div ref="filterDrugStoreSection">
   <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Activos na Farmácia
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section  class="col" >
         
            <FiltersInput
              :id="id"
              :typeService="selectedService"
              :progress="progress"
               :clinicalService="selectedService"
              :applicablePeriods="periodType"
              @generateReport="generateReport"
              @initReportProcessing="initReportProcessing"
            />
        </q-item-section>
    </q-item>
  </div>
  </div>
</template>

<script setup>
        import moment from 'moment'
        import Report from 'src/services/api/report/ReportService'
        import { LocalStorage } from 'quasar'
        import activePatients from 'src/services/reports/Patients/ActivePatients.ts'
        import { ref } from 'vue'
        import { v4 as uuidv4 } from 'uuid'
        import StartStopReason from 'src/stores/models/startStopReason/StartStopReason'
        // import Episode from 'src/store/models/episode/Episode'
        import reportDatesParams from 'src/services/reports/ReportDatesParams'
        import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails'
        // import ReportDatesParams from '../../../reports/ReportDatesParams'
        import ActiveInDrugStore from 'src/stores/models/report/patient/ActiveInDrugStore'
        import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier'
        import Patient from '../../../stores/models/patient/Patient'
        // import PrescriptionDetail from '../../../store/models/prescriptionDetails/PrescriptionDetail'
        import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen'
        import Prescription from 'src/stores/models/prescription/Prescription'
        import TherapeuticLine from '../../../stores/models/therapeuticLine/TherapeuticLine'
        import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
        import { useSwal } from 'src/composables/shared/dialog/dialog';


          import ListHeader from 'components/Shared/ListHeader.vue'
          import FiltersInput from 'components/Reports/shared/FiltersInput.vue'


        const { website, isDeskTop, isMobile } = useSystemUtils();
        const { alertSucess, alertError, alertWarningAction } = useSwal();
        const name= 'DrugStore'
        const props= defineProps(['selectedService', 'menuSelected', 'id'])
        const   totalRecords= ref(0)
        const   qtyProcessed= ref(0)
        const   progress= ref(0)
        const filterDrugStoreSection = ref('')

     

    const  closeSection =  () =>{
        filterDrugStoreSection.value.remove()
      }

      const initReportProcessing = (params) => {
        if (params.localOrOnline === 'online') {
          Report.apiInitActiveInDrugStoreProcessing(params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(getProcessingStatus(params), 2)
          })
         // Pack.api().post('/receivedStockReport/initReportProcess' params)
        } else {
          getDataLocalDb(params)
        }
      }

      const getProcessingStatus  = (params) => {
        Report.getProcessingStatus('activePatientReport', params).then(resp => {
          progress.value = resp.data.progress
          if (progress.value < 100) {
            setTimeout(getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      }

      const generateReport =  (id, fileType) => {
        if (website) {
          Report.apiPrintActivePatientReport(id).then(resp => {
            if (!resp.data[0]) {
              alertError('Nao existem Dados para o periodo selecionado')
            } else {
              const patientAux = resp.data[0]

              if (fileType === 'PDF') {
                activePatients.downloadPDF(
                  patientAux.province,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.data
                )
              } else {
                activePatients.downloadExcel(
                  patientAux.province,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.data
                )
              }
            }
        })
        } else {
          ActiveInDrugStore.localDbGetAll().then(reports => {
         const reportData = []
         reports.forEach(report => {
                 if (report.reportId === id) {
                  reportData.push(report)
                 }
            })
             const firstReg = reportData[0]
             if (fileType === 'PDF') {
                activePatients.downloadPDF(
                  firstReg.province,
                  moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                  reportData
                )
              }
        })
        }
      }


      const getDataLocalDb = (params) => {
        const reportParams = reportDatesParams.determineStartEndDate(params)
        console.log(reportParams)
        PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          console.log(patientVisitDetails)
       const result = patientVisitDetails.filter(patientVisitDetail => moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').format() >= reportParams.endDate)
          console.log(result)
          const sortedArray = result.sort((a, b) => { return a.patientVisit.visitDate - b.patientVisit.visitDate })
          console.log(sortedArray)
       const resultGroupedPatientVisits = groupedMapChild(sortedArray)
           console.log(resultGroupedPatientVisits)
          return resultGroupedPatientVisits
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
            const activePatient = new ActiveInDrugStore()
            activePatient.reportId = reportParams.id
          activePatient.year = reportParams.year
          activePatient.startDate = reportParams.startDate
          activePatient.endDate = reportParams.endDate
          activePatient.province = reportParams.clinic.province.description
          activePatient.description = reportParams.clinic.province.description
          PatientServiceIdentifier.localDbGetById(reportData[0].episode.patientServiceIdentifier.id).then(identifier => {
              if (identifier.service.id === reportParams.clinicalService && getStartStopReasonTypeById(reportData[0].episode.startStopReason.id).isStartReason === true) {
              const pack = reportData[0].pack
          const clinic = reportData[0].clinic
          activePatient.clinic = clinic.clinicName
          Patient.localDbGetById(reportData[0].patientVisit.patient.id).then(patient => {
           Prescription.localDbGetById(reportData[0].prescription.id).then(prescription => {
          TherapeuticRegimen.localDbGetById(prescription.prescriptionDetails[0].therapeuticRegimen.id).then(therapeuticRegimen => {
            TherapeuticLine.localDbGetById(prescription.prescriptionDetails[0].therapeuticLine.id).then(therapeuticLine => {
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
         activePatient.age = idadeCalculator(patient.dateOfBirth)
         activePatient.id = uuidv4()
         ActiveInDrugStore.localDbAdd(activePatient)
         console.log(activePatient)
            })
          })
               })
          })
      }
      })
          })
          progress.value = 100
          params.progress = 100
          }
          )
      }

      const getStartStopReasonTypeById  = (id) => {
        return StartStopReason.query().where('id', id).first()
      }


      const groupedMapChild = (items) => {
    return items.reduce(
        (entryMap, e) => entryMap.set(e.patientVisit.patient.id, [...(entryMap.get(e.patientVisit.patient.id) || []), e], console.log(e.patientVisit.patient.id)),
        new Map()
      )
    }

    const   idadeCalculator =(birthDate) => {
            if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
               const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD')
               const todayDate = moment(new Date())
               const idade = todayDate.diff(utentBirthDate, 'years')
               console.log(idade)
              return idade
            }
        }

</script>

<style lang="scss" scoped>
  .param-container {
    border-bottom: 1px dashed $grey-13;
    border-left: 1px dashed $grey-13;
    border-right: 1px dashed $grey-13;
    border-radius: 0px 0px 5px 5px;
  }
</style>
