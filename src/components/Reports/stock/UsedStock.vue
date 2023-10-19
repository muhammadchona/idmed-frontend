<template>
<div ref="filterUsedStockSection">
  <ListHeader
  v-if="resultFromLocalStorage"
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{serviceAux !== null ? serviceAux.code : ''}}: Lista de Stock Usado
  </ListHeader>
  <ListHeader
  v-else
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Stock Usado
  </ListHeader>
  <div class="param-container">
    <q-item>
       <q-item-section  class="col" >
            <FiltersInput
              :totalRecords="totalRecords"
              :qtyProcessed="qtyProcessed"
              :reportType="report"
              :tabName="name"
              :params="params"
              :id="id"
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
import { LocalStorage } from 'quasar'
import {ref, provide } from 'vue'
import UsedStockReport from 'src/services/reports/stock/UsedStockReport.ts'
import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import UsedStockMobileService from 'src/services/api/report/mobile/UsedStockMobileService.';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const filterUsedStockSection = ref('');

    const name = 'UsedStock'
    const props=  defineProps(['selectedService', 'menuSelected', 'id', 'params'])
    const totalRecords = ref(0)
    const qtyProcessed = ref(0)

const progress = ref(0.0);

    const  closeSection = (params) => {
        filterUsedStockSection.value.remove()
        if(params)
        LocalStorage.remove(params.id)   
      }

      const serviceAux = ref(null)
const resultFromLocalStorage = ref(false)

      const initReportProcessing = (params) => {
        progress.value = 0.001
        if (isOnline.value) {
          LocalStorage.set(params.id, params)
          Report.apiInitReportProcess('usedStockReportTemp', params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          })
        } else {
          LocalStorage.set(params.id, params)
          UsedStockMobileService.getDataLocalDb(params)
          progress.value = 100
            params.progress = 100
        }
      }

      const getProcessingStatus = (params) => {
        Report.getProcessingStatus('usedStockReportTemp', params).then(resp => {
          progress.value = resp.data.progress
          if (progress.value < 100) {
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          } else {
            LocalStorage.set(params.id, params)
            progress.value = 100
            params.progress = 100
          }
        })
      }

      const generateReport=  (id, fileType, params) => {
       if (fileType === 'PDF') {
           UsedStockReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
               })
        } else if (fileType === 'XLS') {
           UsedStockReport.downloadExcel(id, fileType, params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
               })
        }
        // UID da tab corrent
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
