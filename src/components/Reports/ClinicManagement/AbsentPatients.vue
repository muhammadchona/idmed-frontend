<template>
<div ref="filterDrugStoreSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Pacientes Faltosos ao levantamento
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section  class="col" >
            <FiltersInput
              :id="id"
              :clinicalService="selectedService"
              :totalRecords="totalRecords"
              :qtyProcessed="qtyProcessed"
              :reportType="report"
              :progress="progress"
              :tabName="name"
              :params="params"
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
import { LocalStorage, SessionStorage } from 'quasar'
import { ref, onMounted, inject} from 'vue'
import absentPatientsTs from 'src/services/reports/ClinicManagement/AbsentPatients.ts'
// import { v4 as uuidv4 } from 'uuid'
import reportDatesParams from 'src/services/reports/ReportDatesParams'
// import AbsentPatientReport from 'src/store/models/report/pharmacyManagement/AbsentPatientReport'
// import Pack from 'src/store/models/packaging/Pack'
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails'
import Patient from '../../../stores/models/patient/Patient'
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier'
import AbsentPatientReport from 'src/stores/models/report/pharmacyManagement/AbsentPatientReport'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
import { useSwal } from 'src/composables/shared/dialog/dialog';  

const { website } = useSystemUtils(); 
const {  alertError } = useSwal();
const  name =  'AbsentPatients'
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params'])
const totalRecords = ref(0)
const qtyProcessed = ref(0)
const report = 'FALTOSOS_AO_LEVANTAMENTO'
const progress = ref(0)
const filterDrugStoreSection = ref('')

onMounted( () => {
         if (props.params) {
          getProcessingStatus(props.params)
        }
    })

const closeSection=  () => {
        filterDrugStoreSection.value.remove()
        LocalStorage.remove(id)
      }

const initReportProcessing = (params) => {
        if (params.localOrOnline === 'online') {
          Report.apiInitReportProcess('absentPatientsReport',params).then((response) => {
         setTimeout(getProcessingStatus(params), 2)
      })
        } else {
          getDataLocalDb(params)
        }
      }

 const getProcessingStatus = (params) => {
        if (website) {
        Report.getProcessingStatus('absentPatientsReport', params).then(resp => {
          progress.value = resp.data.progress
          if (progress.value < 100) {
            setTimeout(getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      }
      }

  const generateReport = (id, fileType) => {
            Report.apiGenerateAbsentPatientsReport(id,fileType).then(resp => {
              if (!resp.data[0]) {
              alertError('Nao existem Dados para o periodo selecionado')
            } else {
              const patientAux = resp.data[0]
              if (fileType === 'PDF') {
                absentPatientsTs.downloadPDF(
                  patientAux.clinic,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.data
                )
              } else {
                absentPatientsTs.downloadExcel(
                  patientAux.clinic,
                  moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
                  moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
                  resp.data
                )
              }
            }
            })
      }

     const  getDataLocalDb = (params) => {
        const reportParams = reportDatesParams.determineStartEndDate(params)
        console.log(reportParams)
        PatientVisitDetails.localDbGetAll().then(patientVisitDetails => {
          console.log(patientVisitDetails)
       const result = patientVisitDetails.filter(patientVisitDetail => patientVisitDetail.pack.nextPickUpDate >= reportParams.startDate && moment(patientVisitDetail.pack.nextPickUpDate).add(3, 'd').format() <= reportParams.endDate)
          console.log(result)
          return result
        }).then(reportDatas => {
          reportDatas.forEach(reportData => {
          PatientServiceIdentifier.localDbGetById(reportData.episode.patientServiceIdentifier.id).then(identifier => {
          if (identifier.service.id === reportParams.clinicalService) {
           // console.log(reportData.pack.nextPickUpDate)
            console.log(moment(reportData.pack.nextPickUpDate, 'YYYY-MM-DD').add(3, 'days'))
          //  const newDate = moment(reportData.pack.nextPickUpDate).add(3, 'd')
          //  console.log(newDate.format())
            const absentPatientReport = new AbsentPatientReport()
            Patient.localDbGetById(reportData.patientVisit.patient.id).then(patient => {
              absentPatientReport.nid = identifier.value
              absentPatientReport.firstNames = patient.firstNames + ' ' + patient.lastNames
              absentPatientReport.cellphone = patient.cellphone
              absentPatientReport.dateBackUs = ''
              absentPatientReport.dateMissedPickUp = reportData.pack.nextPickUpDate
              absentPatientReport.dateIdentifiedAbandonment = ''
              absentPatientReport.returnedPickUp = ''
              console.log(absentPatientReport)
            })
          }
        })
          })
        })
          progress.value = 100
          params.progress = 100
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
