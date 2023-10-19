<template>
  <div ref="filterDrugStoreSection">
    <ListHeader
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Referidos Faltosos ao levantamento
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
import { ref, onMounted, inject } from 'vue';
import absentReferredPatients from 'src/services/reports/ReferralManagement/AbsentReferredPatients.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { alertError } = useSwal();
const { isOnline } = useSystemUtils();

const name = 'AbsentReferredPatients';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'REFERIDOS_FALTOSOS_AO_LEVANTAMENTO';
const progress = ref(0.0);
const filterDrugStoreSection = ref('');

onMounted(() => {
  if (props.params) {
    getProcessingStatus(props.params);
  }
});

const closeSection = () => {
  filterDrugStoreSection.value.remove();
  LocalStorage.remove(props.id);
};

const initReportProcessing = (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    Report.apiInitReportProcess('referredPatientsReport', params).then(
      (response) => {
        getProcessingStatus(params);
      }
    );
  } else {
    // Mobile to be implemented
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('referredPatientsReport', params).then((resp) => {
    if (resp.data.progress > 0.001) {
      progress.value = resp.data.progress;
      if (progress.value < 100) {
        setTimeout(() => {
          getProcessingStatus(params);
        }, 3000);
      } else {
        progress.value = 100;
        params.progress = 100;
        LocalStorage.set(params.id, params);
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
    absentReferredPatients.downloadPDF(params).then((resp) => {
      if (resp === 204)
        alertError('Nao existem Dados para o periodo selecionado');
    });
  } else {
    absentReferredPatients.downloadExcel(params).then((resp) => {
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
