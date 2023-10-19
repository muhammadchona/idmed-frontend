<template>
<div ref="filterDrugStoreSection">
  <ListHeader
  v-if="resultFromLocalStorage"
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{serviceAux !== null ? serviceAux.code : ''}}: Voltaram da Referencia
  </ListHeader>
  <ListHeader
  v-else
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Voltaram da Referencia
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
import { ref, onMounted, provide } from 'vue'
import referredBackPatients from 'src/services/reports/ReferralManagement/ReferredBackPatients.ts'
import referredPatintsMobileService from 'src/services/api/report/mobile/ReferredPatintsMobileService.ts'
import reportDatesParams from 'src/services/reports/ReportDatesParams'
import ListHeader from 'components/Shared/ListHeader.vue'
import FiltersInput from 'components/Reports/shared/FiltersInput.vue'
import clinicService from 'src/services/api/clinicService/clinicService.ts';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { isOnline } = useSystemUtils();
const { alertSucess, alertError, alertWarningAction } = useSwal();


      const name = 'ReferredBackPatients'
      const props= defineProps(['selectedService', 'menuSelected', 'id', 'params'])
      const totalRecords= ref(0)
      const qtyProcessed = ref(0)
      const  report= 'VOLTOU_REFERENCIA'
        const progress = ref(0.00)
        const filterDrugStoreSection = ref('')
        const serviceAux = ref(null)
const resultFromLocalStorage = ref(false)   

        onMounted (()=> {
        if (props.params) {
          (getProcessingStatus(props.params))
        }
    })

     const closeSection= (params)=> {
        filterDrugStoreSection.value.remove()
        if(params)
        LocalStorage.remove(params.id)
      }

      const initReportProcessing = (params) => {
        progress.value = 0.001
        if (isOnline.value) {
          LocalStorage.set(params.id, params)
          Report.apiInitReportProcess('referredPatientsReport', params).then((response) => {
            progress.value = response.data.progress
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          })
        } else {
          LocalStorage.set(params.id, params)
          const reportParams = reportDatesParams.determineStartEndDate(params)
            Report.referredBackPatientsMobileOffline(reportParams.startDate, reportParams.endDate, reportParams.clinicId).then(respReferredPatients => {
              const clinic = clinicService.getById(reportParams.clinicId)
              referredPatintsMobileService.saveReferredPatientsOnNano(respReferredPatients, reportParams, clinic)
              progress.value = 100
              params.progress = 100
            })

        }
      }

      const  getProcessingStatus= (params)=>{
        Report.getProcessingStatus('referredPatientsReport', params).then(resp => {
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
      }

      const generateReport =  async (id, fileType, params) => {
          if (isOnline.value) {
            if (fileType === 'PDF') {
               referredBackPatients.downloadPDF(null, params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
               })
            } else {
               referredBackPatients.downloadExcel(null, params).then(resp => {
                  if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
               })
            }
          } else {
            referredPatintsMobileService.getDataLocalReport(id).then(resp => {
              if (resp <= 0) {
                alertError('Nao existem Dados para o periodo selecionado')
              } else {
                console.log(params)
                if (fileType === 'PDF') {
                  referredBackPatients.downloadPDF(resp, params)
                } else {
                  referredBackPatients.downloadExcel(resp, params)
                }
              }
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
