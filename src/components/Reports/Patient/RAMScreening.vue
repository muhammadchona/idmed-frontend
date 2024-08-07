<template>
  <div ref="filterTbScreeningSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Rastreio de
      pacientes de RAM
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Rastreio de pacientes de RAM
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
import { ref, provide, onMounted } from 'vue';
import RAMScreeningReportTs from 'src/services/reports/Patients/RAMScreening.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import PatientsWithScreeningMobileService from 'src/services/api/report/mobile/PatientsWithScreeningMobileService';
import moment from 'moment';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();
const name = 'TBScreening';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'TB_SCREENING';
const progress = ref(0.0);
const filterTbScreeningSection = ref('');
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const isReportClosed = ref(false);

const closeSection = (params) => {
  filterTbScreeningSection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  }
};

const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const initReportProcessing = async (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    /*updateParamsOnLocalStrage(params, isReportClosed);
    Report.apiInitReportProcess('TBScreening', params).then((response) => {
      getProcessingStatus(params);
    }); */
  } else {
    PatientsWithScreeningMobileService.getDataLocalDbRAM(params);
    updateParamsOnLocalStrage(params, isReportClosed);
    progress.value = 100;
    params.progress = 100;
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('TBScreening', params).then((resp) => {
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

const generateReport = async (id, fileType) => {
  if (isOnline.value) {
    //TODO:
  } else {
    const data =
      await PatientsWithScreeningMobileService.localDbGetAllByReportId(id);
    if (data.length === 0) {
      alertError('Não existem Dados para o período selecionado');
      downloadingXls.value = false;
      downloadingPdf.value = false;
    } else {
      const patientAux = data[0];

      if (fileType === 'PDF') {
        RAMScreeningReportTs.downloadPDF(
          patientAux.province,
          moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
          moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
          data
        );
        downloadingPdf.value = false;
      } else {
        RAMScreeningReportTs.downloadExcel(
          patientAux.province,
          moment(new Date(patientAux.startDate)).format('DD-MM-YYYY'),
          moment(new Date(patientAux.endDate)).format('DD-MM-YYYY'),
          data
        );
        downloadingXls.value = false;
      }
    }
  }
};

onMounted(() => {
  console.log(name);
});

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
