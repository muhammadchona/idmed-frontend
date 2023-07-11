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
  
  
  import ListHeader from 'components/Shared/ListHeader.vue'
  import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
  import { useSwal } from 'src/composables/shared/dialog/dialog';  
  import AbsentPatientMobileService from 'src/services/api/report/mobile/AbsentPatientMobileService'
  import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
  
  const { isMobile, isOnline } = useSystemUtils(); 
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
          if (isOnline) {
            Report.apiInitReportProcess('absentPatientsReport',params).then((response) => {
           setTimeout(getProcessingStatus(params), 2)
        })
          } else {
            AbsentPatientMobileService.getDataLocalDb(params)
            progress.value = 100
            params.progress = 100
          }
        }
  
   const getProcessingStatus = (params) => {
          if (isOnline) {
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
  const data = null
      if (isOnline.value) {
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
          } else {
  
          const data =AbsentPatientMobileService.getDataLocalReport(id)
          if (!data || data.length === 0) {
                    alertError('Nao existem Dados para o periodo selecionado')
                  } else {
                    if (fileType === 'PDF') {
                      absentPatientsTs.downloadPDF(
                        data.clinic,
                        moment(new Date(data.startDate)).format('DD-MM-YYYY'),
                        moment(new Date(data.endDate)).format('DD-MM-YYYY'),
                        data
                      )
                    } else {
                      absentPatientsTs.downloadExcel(
                        data.clinic,
                        moment(new Date(data.startDate)).format('DD-MM-YYYY'),
                        moment(new Date(data.endDate)).format('DD-MM-YYYY'),
                        data
                      )
                    }
                  }
  
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
  