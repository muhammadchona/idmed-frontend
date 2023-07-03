<template>
<div ref="filterDPatientHistorySection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Histórico de Levantamento
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
import { ref } from 'vue'
 import patientHistoryTS from 'src/services/reports/ClinicManagement/PatientHistory.ts'
 import reportDatesParams from 'src/services/reports/ReportDatesParams'
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails'
// import ReportDatesParams from '../../../reports/ReportDatesParams'
 import PatientHistoryReport from 'src/stores/models/report/pharmacyManagement/PatientHistoryReport'
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier'
import Patient from '../../../stores/models/patient/Patient'
// import PrescriptionDetail from '../../../store/models/prescriptionDetails/PrescriptionDetail'
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen'
import DispenseType from '../../../stores/models/dispenseType/DispenseType'
import Prescription from 'src/stores/models/prescription/Prescription'
 import DispenseMode from 'src/stores/models/dispenseMode/DispenseMode'
import ClinicalService from '../../../stores/models/ClinicalService/ClinicalService'
import { v4 as uuidv4 } from 'uuid'

//components
import ListHeader  from 'components/Shared/ListHeader.vue'
import FiltersInput  from 'components/Reports/shared/FiltersInput.vue'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { website, isDeskTop, isMobile } = useSystemUtils();
const { alertSucess, alertError, alertWarningAction } = useSwal();

const name =  'PatientHistory'
const props = defineProps(['selectedService', 'menuSelected', 'id'])
const totalRecords =  ref(0)
const qtyProcessed = ref(0)
 const progress = ref(0)
 const filterDPatientHistorySection = ref('')

const closeSection = () => {
        filterDPatientHistorySection.value.remove()
        if (!website.value) {
          PatientHistoryReport.localDbGetByReportId().then(reports => {
      //   const reportData = []
         reports.forEach(report => {
                 if (report.reportId === id) {
                  // reportData.push(report)
                  PatientHistoryReport.localDbDeleteById(report.reportId)
                 }
            })
        })
        }
      }
   const  initReportProcessing = (params) => {
        if (params.localOrOnline === 'online') {
            Report.apiInitReportProcess('historicoLevantamentoReport',params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(getProcessingStatus(params), 2)
          })
          } else {
            reportDatesParams.determineStartEndDate(params)
          console.log(params)
          getDataLocalDb(params)
          }
        }

      const getProcessingStatus =  (params) => {
        Report.getProcessingStatus('historicoLevantamentoReport', params).then(resp => {
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
         //  UID da tab corrente
        if (website.value) {
          Report.printReport('historicoLevantamentoReport',id, fileType).then(resp => {
           if (!resp.data[0]) {
              alertError('Nao existem Dados para o periodo selecionado')
            } else {
              const firstReg = resp.data[0]
              if (fileType === 'PDF') {
                patientHistoryTS.downloadPDF(
                  firstReg.province,
                  moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                  resp.data
                )
              } else {
                patientHistoryTS.downloadExcel(
                  firstReg.province,
                  moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                  resp.data
                )
              }
            }
            })
        } else {
          PatientHistoryReport.localDbGetByReportId(id).then(reports => {
         const reportData = []
         reports.forEach(report => {
                 if (report.reportId === id) {
                  reportData.push(report)
                 }
            })
             const firstReg = reportData[0]
            patientHistoryTS.downloadPDF(
                   '',
                    moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
                reportData)
        })
        }
      }

    const getDataLocalDb = (params) => {
        const reportParams = reportDatesParams.determineStartEndDate(params)
        console.log(reportParams)
       PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          console.log(patientVisitDetails)
       const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.patientVisit.visitDate >= reportParams.startDate && patientVisitDetail.patientVisit.visitDate <= reportParams.endDate)
          console.log(result)
          return result
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
            const patientHistory = new PatientHistoryReport()
          patientHistory.reportId = reportParams.id
          // patientHistory.period = reportParams.periodTypeView
          patientHistory.year = reportParams.year
          patientHistory.startDate = reportParams.startDate
          patientHistory.endDate = reportParams.endDate
          PatientServiceIdentifier.localDbGetById(reportData.episode.patientServiceIdentifier.id).then(identifier => {
              // const serviceIdentifier = identifier
              const pack = reportData.pack
          const clinic = reportData.clinic
           ClinicalService.localDbGetById(identifier.service.id).then(clinicalService => {
          Patient.localDbGetById(reportData.patientVisit.patient.id).then(patient => {
           Prescription.localDbGetById(reportData.prescription.id).then(prescription => {
          TherapeuticRegimen.localDbGetById(prescription.prescriptionDetails[0].therapeuticRegimen.id).then(therapeuticRegimen => {
           DispenseType.localDbGetById(prescription.prescriptionDetails[0].dispenseType.id).then(dispenseType => {
            DispenseMode.localDbGetById(pack.dispenseMode.id).then(dispenseMode => {
          // const episode = reportData.episode
         // const dispenseMode = DispenseMode.localDbGetById(pack.dispenseMode.id)
          patientHistory.nid = identifier.value
          patientHistory.firstNames = patient.firstNames
          patientHistory.middleNames = patient.middleNames
          patientHistory.lastNames = patient.lastNames
          patientHistory.cellphone = patient.cellphone
         // patientHistory.tipoTarv =
         patientHistory.pickUpDate = pack.pickupDate
         patientHistory.nexPickUpDate = pack.nextPickUpDate
         patientHistory.therapeuticalRegimen = therapeuticRegimen.description
         patientHistory.dispenseType = dispenseType.description
         patientHistory.age = idadeCalculator(patient.dateOfBirth)
         patientHistory.dispenseMode = dispenseMode.description
         patientHistory.clinicalService = clinicalService.description
         patientHistory.clinic = clinic.clinicName
         patientHistory.id = uuidv4()
         PatientHistoryReport.localDbAdd(patientHistory)
         console.log(patientHistory)
        })
        })
          })
               })
          })
        })
      })
         // const clinicalService = ClinicalService.localDbGetById(patientServiceIdentifier.service.id)
        // patientHistory.patientType =
          })
          }
          )
          progress.value = 100
          params.progress = 100
      }

      const idadeCalculator = (birthDate) => {
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
