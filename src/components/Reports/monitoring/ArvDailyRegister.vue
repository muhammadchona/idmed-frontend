<template>
<div ref="filterArvDailyRegisterSection">
  <ListHeader
  v-if="resultFromLocalStorage"
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{serviceAux !== null ? serviceAux.code : ''}}: Lista de Registro Diário de ARV
  </ListHeader>
  <ListHeader
  v-else
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Registro Diário de ARV
  </ListHeader>
  <div class="param-container">
    <q-item>
         <q-item-section  class="col" >
            <FiltersInput
              :id="id"
              :totalRecords="totalRecords"
              :qtyProcessed="qtyProcessed"
              :reportType="report"
              :tabName="name"
              :params="params"
              :progress="progress"
              :clinicalService="selectedService"
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
import ArvDailyRegisterReport from 'src/services/reports/monitoring/ArvDailyRegisterReport.ts'
import ClinicalService from '../../../stores/models/ClinicalService/ClinicalService'
 import { LocalStorage } from 'quasar'
import { ref, onMounted, provide } from 'vue'
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason'

//compontes
import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';  
import ArvDailyRegisterMobileService from 'src/services/api/report/mobile/ArvDailyRegisterMobileService'

const {  isOnline } = useSystemUtils(); 
const { alertSucess, alertError, alertWarningAction } = useSwal();
const filterArvDailyRegisterSection = ref('')
const report = 'LIVRO_DIARIO'
    

    const name = 'ArvDailyRegister'
    const props = defineProps(['selectedService', 'menuSelected', 'id', 'params'])
    const totalRecords= ref(0)
    const qtyProcessed = ref(0)
     const progress = ref(0.00)

    onMounted(() => {
     // getStartStopReasonsToVuex()
    })

    const serviceAux = ref(null)
const resultFromLocalStorage = ref(false)

     const closeSection = (params) =>{
        filterArvDailyRegisterSection.value.remove()
        LocalStorage.remove(params.id) 
      }
   const  initReportProcessing = (params) => {
      progress.value = 0.001
        if (isOnline.value) {
          LocalStorage.set(params.id, params)
          Report.apiInitReportProcess('arvDailyRegisterReportTemp', params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          })
        } else {
          LocalStorage.set(params.id, params)
          ArvDailyRegisterMobileService.getDataLocalDb(params)
          progress.value = 100
         params.progress = 100
        }
      }

     const getProcessingStatus = (params) => {
        Report.getProcessingStatus('arvDailyRegisterReportTemp', params).then(resp => {
          progress.value = resp.data.progress
          if (progress.value < 100) {
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
       /*
        getDataLocalDb(params)
        */
      }

     const generateReport = (id, fileType, params) => {
        // UID da tab corrent
          if (fileType === 'PDF') {
           ArvDailyRegisterReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
           ArvDailyRegisterReport.downloadExcel(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
        }
      }

      provide('serviceAux', serviceAux)
provide('resultFromLocalStorage', resultFromLocalStorage)
  
</script>

<style lang="scss" scoped>
  .param-container {
    border-bottom: 1px dashed $grey-13;
    border-left: 1px dashed $grey-13;
    border-right: 1px dashed $grey-13;
    border-radius: 0px 0px 5px 5px;
  }
</style>
