<template>
<div ref="filterDPatientHistorySection">
  <ListHeader
  v-if="resultFromLocalStorage"
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{serviceAux !== null ? serviceAux.code : ''}}: Histórico de Levantamento
  </ListHeader>
  <ListHeader
  v-else
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection(params)"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Histórico de Levantamento
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section  class="col" >
            <FiltersInput
              :id="id"
              :totalRecords="totalRecords"
              :qtyProcessed="qtyProcessed"           
              :progress="progress"
              :reportType="report"
              :tabName="name"
              :params="params"
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
 import moment from 'moment'
 import Report from 'src/services/api/report/ReportService'
import { LocalStorage } from 'quasar'
import { ref, provide } from 'vue'
 import patientHistoryTS from 'src/services/reports/ClinicManagement/PatientHistory.ts'


//components
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientHistoryMobileService from 'src/services/api/report/mobile/PatientHistoryMobileService';

const { isOnline } = useSystemUtils();
const { alertSucess, alertError, alertWarningAction } = useSwal();

const name =  'PatientHistory'
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params'])
const totalRecords =  ref(0)
const qtyProcessed = ref(0)
const progress = ref(0.00)
const filterDPatientHistorySection = ref('')
const report = 'HISTORICO_DE_LEVANTAMENTO';

const serviceAux = ref(null)
const resultFromLocalStorage = ref(false)

const closeSection = (params) => {
  filterDPatientHistorySection.value.remove()
  if(params)
  LocalStorage.remove(params.id)
}

   const  initReportProcessing = (params) => {
        progress.value = 0.001
        if (isOnline.value) {
            LocalStorage.set(params.id, params)
            Report.apiInitReportProcess('historicoLevantamentoReport',params).then(resp => {
            setTimeout(() => {
              getProcessingStatus(params)
            }, 3000);
          })
          } else {
            LocalStorage.set(params.id, params)
            PatientHistoryMobileService.getDataLocalDb(params)
            progress.value = 100
            params.progress = 100
          }
        }

      const getProcessingStatus =  (params) => {
        Report.getProcessingStatus('historicoLevantamentoReport', params).then(resp => {
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


const generateReport = (id, fileType) => {
  //  UID da tab corrente
  if (isOnline.value) {
    Report.printReport('historicoLevantamentoReport', id, fileType).then(
      (resp) => {
        if (!resp.data[0]) {
          alertError('Nao existem Dados para o periodo selecionado');
        } else {
          const firstReg = resp.data[0];
          if (fileType === 'PDF') {
            patientHistoryTS.downloadPDF(
              firstReg.province,
              moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
              moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
              resp.data
            );
          } else {
            patientHistoryTS.downloadExcel(
              firstReg.province,
              moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
              moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
              resp.data
            );
          }
        }
      })
     } else {
    PatientHistoryMobileService.localDbGetAllByReportId(id).then((reports) => {
      const firstReg = reports[0];
      if (fileType === 'PDF') {
        patientHistoryTS.downloadPDF(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports
        );
      } else {
        patientHistoryTS.downloadExcel(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports
        );
      }
    });
  }
};
      
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
