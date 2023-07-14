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
  import Report from 'src/services/api/report/ReportService'
  import { LocalStorage } from 'quasar'
  import { ref} from 'vue'
  import absentPatientsTs from 'src/services/reports/ClinicManagement/AbsentPatients.ts'
  
  
  import ListHeader from 'components/Shared/ListHeader.vue'
  import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
  import { useSwal } from 'src/composables/shared/dialog/dialog';  
  import AbsentPatientMobileService from 'src/services/api/report/mobile/AbsentPatientMobileService'
  import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
  
  const {  isOnline } = useSystemUtils(); 
  const {  alertError } = useSwal();
  const  name =  'AbsentPatients'
  const props = defineProps(['selectedService', 'menuSelected', 'id', 'params'])
  const totalRecords = ref(0)
  const qtyProcessed = ref(0)
  const report = 'FALTOSOS_AO_LEVANTAMENTO'
  const progress = ref(0)
  const filterDrugStoreSection = ref('')
  

  const closeSection=  () => {
          filterDrugStoreSection.value.remove()
         // LocalStorage.remove(id)
        }
  
  const initReportProcessing = async (params) => {
          if (isOnline.value) {
            Report.apiInitReportProcess('absentPatientsReport',params).then((response) => {
           setTimeout(getProcessingStatus(params), 2)
        })
          } else {
           const resp = await  AbsentPatientMobileService.getDataLocalDb(params)
            progress.value = 100
            params.progress = 100
          }
        }
  
   const getProcessingStatus = (params) => {
    if (isOnline.value) {
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
  
    const generateReport = (id, fileType, params) => {
      if (fileType === 'PDF') {
          absentPatientsTs.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
          absentPatientsTs.downloadExcel(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
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
  