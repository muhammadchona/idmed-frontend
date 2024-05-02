<template>
  <div ref="filterTptDailyRegisterSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Lista de
      Registro Diário de TPT
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Lista
      de Registro Diário de TPT
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
import TptDailyRegisterReport from 'src/services/reports/monitoring/TptDailyRegisterReport.ts';
import { LocalStorage } from 'quasar';
import { ref, provide } from 'vue';

//compontes
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import TptDailyRegisterMobileService from 'src/services/api/report/mobile/TptDailyRegisterMobileService';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();
const filterTptDailyRegisterSection = ref('');
const report = 'LIVRO_DIARIO_TPT';
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const name = 'TptDailyRegister';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.0);
const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const closeSection = (params) => {
  filterTptDailyRegisterSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  }
};

const initReportProcessing = (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    updateParamsOnLocalStrage(params, isReportClosed);
    Report.apiInitReportProcess('arvDailyRegisterReportTemp', params).then(
      (resp) => {
        progress.value = resp.data.progress;
        setTimeout(() => {
          getProcessingStatus(params);
        }, 3000);
      }
    );
  } else {
    updateParamsOnLocalStrage(params, isReportClosed);
    TptDailyRegisterMobileService.getDataLocalDb(params);
    progress.value = 100;
    params.progress = 100;
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('arvDailyRegisterReportTemp', params).then(
    (resp) => {
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
    }
  );
};

const generateReport = (id, fileType, params) => {
  // UID da tab corrent
  if (fileType === 'PDF') {
    TptDailyRegisterReport.downloadPDF(id, fileType, params).then((resp) => {
      if (resp === 204)
        alertError('Não existem Dados para o período selecionado');
      downloadingPdf.value = false;
    });
  } else if (fileType === 'XLS') {
    TptDailyRegisterReport.downloadExcel(id, fileType, params).then((resp) => {
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
