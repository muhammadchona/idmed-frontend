<template>
<div ref="filterQuantityRemainSection">
  <ListHeader
  v-if="resultFromLocalStorage"
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{serviceAux !== null ? serviceAux.code : ''}}: Medicamentos Remanescentes (Sobras/Perdas)
  </ListHeader>
  <ListHeader
  v-else
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Medicamentos Remanescentes (Sobras/Perdas)
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
import QuantityRemainReport from 'src/services/reports/stock/QuantityRemainReport.ts'
import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import QuantityRemainMobileService from 'src/services/api/report/mobile/QuantityRemainMobileService.ts';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const filterQuantityRemainSection = ref('');

    const name = 'QuantityRemain'
    const props=  defineProps(['selectedService', 'menuSelected', 'id', 'params'])
    const totalRecords = ref(0)
    const qtyProcessed = ref(0)
    const downloadingPdf = ref(false)
  const downloadingXls = ref(false) 

const progress = ref(0.0);

const isReportClosed = ref(false)
  const updateParamsOnLocalStrage = (params, isReportClosed) => {
    if(!isReportClosed.value) LocalStorage.set(params.id, params)
  }

    const  closeSection = (params) => {
        filterQuantityRemainSection.value.remove()
        if(params) {
    const paramId = params.id
    isReportClosed.value = true
    LocalStorage.remove(paramId)
  } 
      }

      const serviceAux = ref(null)
      const resultFromLocalStorage = ref(false)

      const initReportProcessing = (params) => {
        progress.value = 0.001
        if (isOnline.value) {
          updateParamsOnLocalStrage(params, isReportClosed) 
          Report.apiInitReportProcess('usedStockReportTemp', params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          })
        } else {
          updateParamsOnLocalStrage(params, isReportClosed) 
          QuantityRemainMobileService.getDataLocalDb(params)
          progress.value = 100
            params.progress = 100
        }
      }

      const getProcessingStatus = (params) => {
        Report.getProcessingStatus('usedStockReportTemp', params).then(resp => {
          if (resp.data.progress > 0.001) {
            progress.value = resp.data.progress;
            if (progress.value < 100) {
              updateParamsOnLocalStrage(params, isReportClosed) ;
              params.progress = resp.data.progress;
              setTimeout(() => {
                getProcessingStatus(params)
              }, 3000);
            } else {
              progress.value = 100;
              params.progress = 100;
              updateParamsOnLocalStrage(params, isReportClosed) ;
            }
          } else {
            setTimeout(() => {
                getProcessingStatus(params)
              }, 3000);
          }
        });
      };

      const generateReport=  (id, fileType, params) => {
       if (fileType === 'PDF') {
        QuantityRemainReport.downloadPDF(id, fileType, params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
                  downloadingPdf.value = false
               })
        } else if (fileType === 'XLS') {
          QuantityRemainReport.downloadExcel(id, fileType, params).then(resp => {
              if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
              downloadingXls.value = false
            })
        }
      }


      
  provide('downloadingPdf', downloadingPdf)
  provide('downloadingXls', downloadingXls)
  provide('serviceAux', serviceAux)
  provide('resultFromLocalStorage', resultFromLocalStorage)
  provide('getProcessingStatus',getProcessingStatus)
    
</script>

<style lang="scss" scoped>
.param-container {
  border-bottom: 1px dashed $grey-13;
  border-left: 1px dashed $grey-13;
  border-right: 1px dashed $grey-13;
  border-radius: 0px 0px 5px 5px;
}
</style>
