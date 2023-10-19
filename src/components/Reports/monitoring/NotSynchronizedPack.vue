<template>
  <div ref="filterDrugStoreSection">
    <ListHeader
    v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Lista
      de Dispensas Não Sicronizadas
    </ListHeader>
    <ListHeader
    v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Lista
      de Dispensas Não Sicronizadas
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
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
import Report from 'src/services/api/report/ReportService';
import reportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import { LocalStorage } from 'quasar';
import { ref, onMounted, provide } from 'vue';
//compontes
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import NotSynchronizedPack from 'src/services/reports/monitoring/NotSynchronizedPack';
// import { Script } from 'vm';

const { website, isDeskTop, isMobile } = useSystemUtils();
const { alertSucess, alertError, alertWarningAction } = useSwal();
const filterArvDailyRegisterSection = ref('');

const name = 'NotSynchronizedPack';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params'])
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.00);
const filterDrugStoreSection = ref('');
const report = 'DISPENSAS_NAO_SINCRONIZADAS'
const serviceAux = ref(null)
const resultFromLocalStorage = ref(false)

onMounted(() => {
  if (props.params) {
    getProcessingStatus(props.params);
  }
});

const closeSection = (params) => {
  filterDrugStoreSection.value.remove()
  LocalStorage.remove(params.id)
};

const initReportProcessing = (params) => {
  LocalStorage.set(params.id, params)
  progress.value = 0.001
  Report.apiInitReportProcess(
    'notSynchronizingPacksOpenMrsReport',
    params
  ).then((response) => {
    // reset your component inputs like textInput to nul    // or your custom route redirect with vue-router
    // or your custom route redirect with vue-router
    setTimeout(() => {
      getProcessingStatus(params)
    }, 3000);
  });
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('notSynchronizingPacksOpenMrsReport', params).then(
    (resp) => {
      progress.value = resp.data.progress;
      if (progress.value < 100) {
        setTimeout(() => {
          getProcessingStatus(params)
        }, 3000);
      } else {
        params.progress = 100;
        LocalStorage.set(params.id, params);
      }
    }
  );
};

const generateReport = (id, fileType, params) => {
  if (fileType === 'PDF') {
    NotSynchronizedPack.downloadPDF(params).then((resp) => {
      if (resp === 204)
        alertError('Nao existem Dados para o periodo selecionado');
    });
  } else {
    NotSynchronizedPack.downloadExcel(params).then((resp) => {
      if (resp === 204)
        alertError('Nao existem Dados para o periodo selecionado');
    });
  }
};

provide('serviceAux', serviceAux)
provide('resultFromLocalStorage', resultFromLocalStorage)
</script>
