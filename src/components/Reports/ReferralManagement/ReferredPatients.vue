<template>
<div ref="filterDrugStoreSection">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Referidos Para Outras Farmacias
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section  class="col" >
            <FiltersInput
              :id="id"
              :clinicalService="selectedService"
              :totalRecords="totalRecords"
              :qtyProcessed="qtyProcessed"
              :progress="progress"
              :reportType="report"
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
import { ref, onMounted} from 'vue'
import referredPatients from 'src/services/reports/ReferralManagement/ReferredPatients.ts'


import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';  

const { website, isDeskTop, isMobile } = useSystemUtils(); 
const { alertSucess, alertError, alertWarningAction } = useSwal();


    const name = 'ReferredPatients'
    const props = defineProps(['selectedService', 'menuSelected', 'id', 'params'])
       
    const totalRecords = ref(0)
    const qtyProcessed= ref(0)
    const report = 'REFERIDO_PARA'
    const  progressValue= ref(0)
    const  progress = ref(0)
    const filterDrugStoreSection = ref('')
      
    onMounted (() => {
       if (props.params) {
          (getProcessingStatus(props.params))
        }
    })
    
      const closeSection = () => {
        LocalStorage.remove(props.id)
        filterDrugStoreSection.value.remove()
      }

      const initReportProcessing =(params) => {
        console.log(params)
      Report.apiInitReportProcess('referredPatientsReport', params).then((response) => {
        // reset your component inputs like textInput to nul    // or your custom route redirect with vue-router
        // or your custom route redirect with vue-router
          setTimeout(getProcessingStatus(params), 2)
      })
      }

      const getProcessingStatus = (params)=> {
        Report.getProcessingStatus('referredPatientsReport', params).then(resp => {
          progress.value = resp.data.progress
          console.log(progress)
          if (progress.value < 100) {
            setTimeout(getProcessingStatus(params), 2)
          } else {
            params.progress = 100
            LocalStorage.set(params.id, params)
          }
        })
      }

      const generateReport= (id, fileType, params) => {
            if (fileType === 'PDF') {
               referredPatients.downloadPDF(params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
               })
            } else {
               referredPatients.downloadExcel(params).then(resp => {
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
