<template>
<div ref="filterReceivedStockSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Stock Recebido
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
import Report from 'src/services/api/report/ReportService'
import ReceivedStockReport from 'src/services/reports/stock/ReceivedStockReport.ts'
import { LocalStorage } from 'quasar'
import { ref } from 'vue'
import reportDatesParams from 'src/services/reports/ReportDatesParams'
import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';  
import ReceivedStockMobileService from 'src/services/api/report/mobile/ReceivedStockMobileService.'

const {  isOnline } = useSystemUtils(); 
const { alertSucess, alertError, alertWarningAction } = useSwal();

   const name = 'ReceivedStock'
   const props = defineProps(['selectedService', 'menuSelected', 'id'])
    const totalRecords = ref(0)
    const qtyProcessed=ref(0)

   const progress= ref(0)
   const filterReceivedStockSection = ref('')

     const  closeSection = ()  =>{
        filterReceivedStockSection.value.remove()
         LocalStorage.remove(id)
      }

     const  initReportProcessing = (params) => {
        if (isOnline.value) {
          Report.apiInitReportProcess('stockReportTemp', params).then(resp => {
            console.log(resp.data.progress)
            progress.value = resp.data.progress
            setTimeout(getProcessingStatus(params), 2)
          })
        } else {
          reportDatesParams.determineStartEndDate(params)
          console.log(params)
         ReceivedStockMobileService.getDataLocalDb(params)
         progress.value = 100
         params.progress = 100
        }
      }

    const  getProcessingStatus = (params) => {
        Report.getProcessingStatus('stockReportTemp', params).then(resp => {
          progress.value = resp.data.progress
          if (progress.value < 100) {
            setTimeout(getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      }

     const generateReport = (id, fileType, params) => {
        // UID da tab corrent
      if (fileType === 'PDF') {
           ReceivedStockReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) alertError( 'Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
           ReceivedStockReport.downloadExcel(id, fileType, params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
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
