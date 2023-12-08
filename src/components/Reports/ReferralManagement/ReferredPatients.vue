<template>
<div ref="filterDrugStoreSection">
  <ListHeader
  v-if="resultFromLocalStorage"
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{serviceAux !== null ? serviceAux.code : ''}}: Referidos Para Outras Farmacias
  </ListHeader>
  <ListHeader
  v-else
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
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
import { ref, onMounted, provide} from 'vue'
import referredPatients from 'src/services/reports/ReferralManagement/ReferredPatients.ts'
import reportDatesParams from 'src/services/reports/ReportDatesParams'
import referredPatintsMobileService from 'src/services/api/report/mobile/ReferredPatintsMobileService.ts'
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const name = 'ReferredPatients';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);

const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'REFERIDO_PARA';
const progress = ref(0.0);
const filterDrugStoreSection = ref('');
const downloadingPdf = ref(false)
const downloadingXls = ref(false)

onMounted(() => {
  if (props.params) {
    getProcessingStatus(props.params);
  }
});

const serviceAux = ref(null)
const resultFromLocalStorage = ref(false)

    onMounted (() => {
       if (props.params) {
          (getProcessingStatus(props.params))
        }
    })

    const isReportClosed = ref(false)
    const updateParamsOnLocalStrage = (params, isReportClosed) => {
      if(!isReportClosed.value) LocalStorage.set(params.id, params)
      console.log(!isReportClosed.value)
    }

      const closeSection = (params) => {
        filterDrugStoreSection.value.remove()
        if(params) {
    const paramId = params.id
    isReportClosed.value = true
    LocalStorage.remove(paramId)
  }
      }

      const initReportProcessing = (params) => {
        progress.value = 0.001
        if (isOnline.value) {
          updateParamsOnLocalStrage(params, isReportClosed) 
          Report.apiInitReferredPatientsProcessing(params).then(resp => {
            progress.value = resp.data.progress
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          })
        } else {
          updateParamsOnLocalStrage(params, isReportClosed) 
          const reportParams = reportDatesParams.determineStartEndDate(params)
            Report.referredPatientsMobileOffline(reportParams.startDate, reportParams.endDate, reportParams.clinicId).then(respReferredPatients => {
              const clinic = clinicService.getById(reportParams.clinicId)
              referredPatintsMobileService.saveReferredPatientsOnNano(respReferredPatients, reportParams, clinic)
              progress.value = 100
              params.progress = 100
            })

        }
      }

      const getProcessingStatus = (params) => {
        Report.getProcessingStatus('referredPatientsReport', params).then(resp => {
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

      const generateReport =  async (id, fileType, params) => {
        if (isOnline.value) {
          if (fileType === 'PDF') {
            downloadingPdf.value = true
              referredPatients.downloadPDF(id,fileType, params).then(resp => {
                if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
                downloadingPdf.value = false
              })
          } else {
            downloadingXls.value = true
              referredPatients.downloadExcel(id,fileType, params).then(resp => {
                if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
                downloadingXls.value = false
              })
          }
        } else {
          referredPatintsMobileService.getDataLocalReport(id).then(resp => {
            if (resp <= 0) {
              alertError('Nao existem Dados para o periodo selecionado')
            } else {
              console.log(params)
              if (fileType === 'PDF') {
                referredPatients.downloadPDF(resp, params)
                downloadingPdf.value = false
              } else {
                referredPatients.downloadExcel(resp, params)
                downloadingXls.value = false
              }
            }
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
