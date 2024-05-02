<template>
  <div ref="filterDrugStoreSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Historico de
      Levantamento de Pacientes Referidos
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Historico de Levantamento de Pacientes Referidos
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
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
import Report from 'src/services/api/report/ReportService';
import { LocalStorage } from 'quasar';
import { ref, onMounted, provide } from 'vue';
import referredPatientDispenseHistory from 'src/services/reports/ReferralManagement/ReferredPatientDispenseHistory.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { alertError } = useSwal();

const name = 'ReferredPatientDispenseHistory';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);

const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'HISTORICO_LEVANTAMENTO_PACIENTES_REFERIDOS';
const progress = ref(0.0);
const filterDrugStoreSection = ref('');
const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);
const downloadingPdf = ref(false);
const downloadingXls = ref(false);

onMounted(() => {
  if (props.params) {
    getProcessingStatus(props.params);
  }
});

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const closeSection = (params) => {
  filterDrugStoreSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  }
};

const initReportProcessing = (params) => {
  progress.value = 0.001;
  updateParamsOnLocalStrage(params, isReportClosed);
  Report.apiInitReportProcess('referredPatientsReport', params).then(
    (response) => {
      setTimeout(() => {
        getProcessingStatus(params);
      }, 3000);
    }
  );
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('referredPatientsReport', params).then((resp) => {
    if (resp.data.progress > 0.001) {
      progress.value = resp.data.progress;
      if (progress.value < 100) {
        updateParamsOnLocalStrage(params, isReportClosed);
        params.progress = resp.data.progress;
        setTimeout(() => {
          getProcessingStatus(params);
        }, 3000);
      } else {
        progress.value = 100;
        params.progress = 100;
        updateParamsOnLocalStrage(params, isReportClosed);
      }
    } else {
      setTimeout(() => {
        getProcessingStatus(params);
      }, 3000);
    }
  });
};

const generateReport = (id, fileType, params) => {
  if (fileType === 'PDF') {
    referredPatientDispenseHistory.downloadPDF(params).then((resp) => {
      if (resp === 204)
        alertError('Não existem Dados para o período selecionado');
      downloadingPdf.value = false;
    });
  } else {
    referredPatientDispenseHistory.downloadExcel(params).then((resp) => {
      if (resp === 204)
        alertError('Não existem Dados para o período selecionado');
      downloadingXls.value = false;
    });
  }
};

provide('downloadingPdf', downloadingPdf);
provide('downloadingXls', downloadingXls);
provide('serviceAux', serviceAux);
provide('resultFromLocalStorage', resultFromLocalStorage);
provide('getProcessingStatus', getProcessingStatus);
</script>

<style lang="scss" scoped>
.param-container {
  border-bottom: 1px dashed $grey-13;
  border-left: 1px dashed $grey-13;
  border-right: 1px dashed $grey-13;
  border-radius: 0px 0px 5px 5px;
}
</style>
