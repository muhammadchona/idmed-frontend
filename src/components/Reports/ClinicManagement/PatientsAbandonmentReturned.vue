<template>
  <div ref="filterPatientsAbandonmentSection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
    >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Pacientes Abandono Que Retornaram
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
    >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Pacientes Abandono Que Retornaram
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
import { ref, provide } from 'vue';
import patientsAbandonmentReturnedTS from 'src/services/reports/ClinicManagement/PatientsAbandonmentReturned.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientHistoryMobileService from 'src/services/api/report/mobile/PatientHistoryMobileService';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();

const name = 'PatientsAbandonmentReturned';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0.0);
const filterPatientsAbandonmentSection = ref('');
const report = 'PATIENTES_ABANDONMENT_RETURNED';
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const isReportClosed = ref(false);
const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const closeSection = (params) => {
  filterPatientsAbandonmentSection.value.remove();
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
    Report.apiInitReportProcess('patientsAbandonmentReport', params).then((resp) => {
      setTimeout(() => {
        getProcessingStatus(params);
      }, 3000);
    });
  } else {
    updateParamsOnLocalStrage(params, isReportClosed);
    PatientHistoryMobileService.getDataLocalDb(params);
    progress.value = 100;
    params.progress = 100;
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('patientsAbandonmentReport', params).then((resp) => {
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
  //  UID da tab corrente
  if (isOnline.value) {
    if (fileType === 'PDF') {
      downloadingPdf.value = true;
      patientsAbandonmentReturnedTS.downloadPDF(
        id, fileType, params
      ).then((resp) => {
        if (resp === 204)
          alertError('Não existem Dados para o período selecionado');
        downloadingPdf.value = false;
      });
      downloadingPdf.value = false;
    } else {
      downloadingXls.value = true;
      patientsAbandonmentReturnedTS.downloadExcel(
        id, fileType, params
      ).then((resp) => {
        if (resp === 204)
          alertError('Não existem Dados para o período selecionado');
        downloadingPdf.value = false;
      });
      downloadingXls.value = false;
    }
  } else {
    PatientHistoryMobileService.localDbGetAllByReportId(id).then((reports) => {
      const firstReg = reports[0];
      if (fileType === 'PDF') {
        patientsAbandonmentReturnedTS.downloadPDF(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports
        ).then((resp) => {
          if (resp === 204)
            alertError('Não existem Dados para o período selecionado');
          downloadingPdf.value = false;
        });
      } else {
        patientsAbandonmentReturnedTS.downloadExcel(
          '',
          moment(new Date(firstReg.startDate)).format('DD-MM-YYYY'),
          moment(new Date(firstReg.endDate)).format('DD-MM-YYYY'),
          reports
        ).then((resp) => {
          if (resp === 204)
            alertError('Não existem Dados para o período selecionado');
          downloadingXls.value = false;
        });
      }
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
