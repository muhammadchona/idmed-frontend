<template>
  <div ref="filterDPatientHistorySection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Histórico de
      Levantamento
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Histórico de Levantamento
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
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
import moment from 'moment';
import Report from 'src/services/api/report/ReportService';
import { LocalStorage } from 'quasar';
import { ref, provide, onMounted, reactive } from 'vue';
import patientHistoryTS from 'src/services/reports/ClinicManagement/PatientHistory.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientHistoryMobileService from 'src/services/api/report/mobile/PatientHistoryMobileService';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const name = 'PatientHistory';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.0);
const filterDPatientHistorySection = ref('');
const report = 'HISTORICO_DE_LEVANTAMENTO';
const downloadingPdf = reactive(ref(false));
const downloadingXls = reactive(ref(false));
const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

onMounted(() => {
  if (props.params) {
    getProcessingStatus(props.params);
  }
});

const closeSection = (params) => {
  filterDPatientHistorySection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  } else {
    isReportClosed.value = true;
    LocalStorage.remove(props.id);
  }
};

const initReportProcessing = async (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    updateParamsOnLocalStrage(params, isReportClosed);
    Report.apiInitReportProcess('historicoLevantamentoReport', params).then(
      (resp) => {
        setTimeout(() => {
          getProcessingStatus(params);
        }, 3000);
      }
    );
  } else {
    updateParamsOnLocalStrage(params, isReportClosed);
    try {
      await PatientHistoryMobileService.getDataLocalDb(params);
      progress.value = 100;
      params.progress = 100;
      updateParamsOnLocalStrage(params, isReportClosed);
    } catch (error) {
      progress.value = 0;
      console.error(
        'Unable to prepare the offline patient history report',
        error
      );
      alertError('Não foi possível preparar o relatório');
    }
  }
};

const getProcessingStatus = (params) => {
  if (isOnline.value) {
    Report.getProcessingStatus('historicoLevantamentoReport', params).then(
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
  }
};

const generateReport = async (id, fileType) => {
  //  UID da tab corrente
  if (isOnline.value) {
    Report.printReport('historicoLevantamentoReport', id, fileType).then(
      (resp) => {
        if (!resp.data[0]) {
          alertError('Não existem Dados para o período selecionado');
          downloadingXls.value = false;
          downloadingPdf.value = false;
        } else {
          const firstReg = resp.data[0];
          if (fileType === 'PDF') {
            downloadingPdf.value = true;
            patientHistoryTS.downloadPDF(
              firstReg.province,
              moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
              moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
              resp.data,
              'tarv',
              downloadingPdf
            );
          } else {
            downloadingXls.value = true;
            patientHistoryTS.downloadExcel(
              firstReg.province,
              moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
              moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
              resp.data,
              'tarv',
              downloadingXls
            );
          }
        }
      }
    );
  } else {
    try {
      const reports = await PatientHistoryMobileService.localDbGetAllByReportId(
        id
      );
      if (!reports?.length) {
        alertError('Não existem Dados para o período selecionado');
        downloadingXls.value = false;
        downloadingPdf.value = false;
        return;
      }
      const firstReg = reports[0];
      if (fileType === 'PDF') {
        await patientHistoryTS.downloadPDF(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports,
          'tarv',
          downloadingPdf
        );
      } else {
        await patientHistoryTS.downloadExcel(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports,
          'tarv',
          downloadingXls
        );
      }
    } catch (error) {
      downloadingXls.value = false;
      downloadingPdf.value = false;
      console.error(
        'Unable to print the offline patient history report',
        error
      );
      alertError('Não foi possível imprimir o relatório');
    }
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
