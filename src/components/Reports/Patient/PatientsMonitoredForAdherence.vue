<template>
  <div ref="filterDrugStoreSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Lista de
      Pacientes Monitorados Para Adesão
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Lista
      de Pacientes Monitorados Para Adesão
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
import { v4 as uuidv4 } from 'uuid';
import { LocalStorage } from 'quasar';
import { ref, onMounted, provide } from 'vue';
//compontes
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientsMonitoredForAdhrence from 'src/services/reports/Patients/PatientsMonitoredForAdhrence';
import PatientsWithScreeningMobileService from 'src/services/api/report/mobile/PatientsWithScreeningMobileService';
const { alertError } = useSwal();

const name = 'PatientsMonitoredForAdherence';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.0);
const filterDrugStoreSection = ref('');
const report = 'Patients_monitored_for_adherence';
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
  console.log(props.params);
  filterDrugStoreSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  } else {
    isReportClosed.value = true;
    LocalStorage.remove(props.id);
  }
};

const initReportProcessing = (params) => {
  updateParamsOnLocalStrage(params, isReportClosed);
  PatientsWithScreeningMobileService.getDataLocalDbMonitoredForAdherence(
    params
  );
  progress.value = 100;
  params.progress = 100;
};

const getProcessingStatus = (params) => {
  progress.value = 100;
  params.progress = 100;
};

const generateReport = (id, fileType, params) => {
  if (fileType === 'PDF') {
    PatientsMonitoredForAdhrence.downloadPDF(params).then((resp) => {
      if (resp === 204)
        alertError('Não existem Dados para o período selecionado');
      downloadingPdf.value = false;
    });
  } else {
    PatientsMonitoredForAdhrence.downloadExcel(params).then((resp) => {
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
