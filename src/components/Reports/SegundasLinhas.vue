<template>
  <div ref="filterSegundasSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
    >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Pacientes em Segunda Linha
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
    >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Pacientes em Segunda Linha
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :totalRecords="totalRecords"
            :qtyProcessed="qtyProcessed"
            :reportType="reportType"
            :progress="progress"
            :tabName="name"
            :params="params"
            :typeService="selectedService"
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
import Report from 'src/services/api/report/ReportService';
import { ref, provide } from 'vue';
import { LocalStorage } from 'quasar';
import segundasLinhasReport from 'src/services/reports/ClinicManagement/SegundasLinhas';

import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);
const name = 'SEGUNDAS_LINHAS';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const filterSegundasSection = ref('');
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const reportType = 'SEGUNDAS_LINHAS';
const periodType = { id: 2, description: 'Mensal', code: 'MONTH' };
const isReportClosed = ref(false);
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

const progress = ref(0.0);
const closeSection = (params) => {
  filterSegundasSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  }
};

const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const initReportProcessing = async (params) => {
  console.log(params)
  progress.value = 0.001;
  if (isOnline.value) {
    updateParamsOnLocalStrage(params, isReportClosed);
    Report.apiInitSegundasLinhasProcessing(params).then((resp) => {
      getProcessingStatus(params);
    });
  } else {
    // updateParamsOnLocalStrage(params, isReportClosed);
    // const reportParams = await MmiaMobileService.getMmiaStockReport(params);
    // const listRegimenSubReport =
    //   await MmiaMobileService.getMmiaRegimenSubReport(reportParams);
    // const beta = await MmiaMobileService.getMmiaReport(
    //   reportParams,
    //   listRegimenSubReport
    // );
    // progress.value = 100;
    // params.progress = 100;
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('segundasLinhasReport', params).then((resp) => {
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
      progress.value = 100;
      params.progress = 100;
      updateParamsOnLocalStrage(params, isReportClosed);
    }
  });
};

const generateReport = (id, fileType) => {
  if (fileType === 'PDF') {
    segundasLinhasReport.downloadPDF(id).then((resp) => {
      console.log(resp)
      if (resp === 204)
        alertError('Não existem Dados para o período selecionado');
      downloadingPdf.value = false;
    });
  } else {
    segundasLinhasReport.downloadExcel(id).then((resp) => {
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
