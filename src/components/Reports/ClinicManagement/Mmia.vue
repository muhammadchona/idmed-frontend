<template>
  <div ref="filterMmiaSection">
    <ListHeader
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Mapa
      Mensal de Informação de ARV (MMIA)
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :typeService="selectedService"
            :progress="progress"
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
import { ref } from 'vue';
import { LocalStorage } from 'quasar';
import mmiaReport from 'src/services/reports/ClinicManagement/Mmia.ts';

import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import MmiaMobileService from 'src/services/api/report/mobile/MmiaMobileService';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const name = 'Mmia';
const props = defineProps(['selectedService', 'menuSelected', 'id']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const filterMmiaSection = ref('');

const periodType = { id: 2, description: 'Mensal', code: 'MONTH' };
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

const progress = ref(0.0);
const closeSection = () => {
  LocalStorage.remove(props.id);
  filterMmiaSection.value.remove();
};

const initReportProcessing = async (params) => {
  if (params.periodType !== 'MONTH') {
    alertError(
      'O período seleccionado não é aplicavel a este relatório, por favor seleccionar o período [Mensal]'
    );
  } else {
    progress.value = 0.001;
    if (isOnline.value) {
      LocalStorage.set(params.id, params)
      Report.apiInitMmiaProcessing(params).then((resp) => {
        console.log(resp);
        getProcessingStatus(params);
      });
    } else {
      LocalStorage.set(params.id, params)
      const reportParams = await MmiaMobileService.getMmiaStockReport(params);
      const listRegimenSubReport =
        await MmiaMobileService.getMmiaRegimenSubReport(reportParams);
      const beta = await MmiaMobileService.getMmiaReport(
        reportParams,
        listRegimenSubReport
      );
      console.log('MMia: ', beta);
      progress.value = 100;
      params.progress = 100;
    }
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('mmiaReport', params).then((resp) => {
    progress.value = resp.data.progress;
    if (progress.value < 100) {
      setTimeout(() => {
        getProcessingStatus(params);
      }, 3000);
    } else {
      params.progress = 100;
      LocalStorage.set(params.id, params);
    }
  });
};

const generateReport = (id, fileType) => {
  if (fileType === 'PDF') {
    mmiaReport.downloadPDF(id).then((resp) => {
      if (resp === 204)
        alertError('Nao existem Dados para o periodo selecionado');
    });
  } else {
    mmiaReport.downloadExcel(id).then((resp) => {
      if (resp === 204)
        alertError('Nao existem Dados para o periodo selecionado');
    });
  }
};
</script>

<style lang="scss" scoped>
.param-container {
  border-bottom: 1px dashed $grey-13;
  border-left: 1px dashed $grey-13;
  border-right: 1px dashed $grey-13;
  border-radius: 0px 0px 5px 5px;
}
</style>
