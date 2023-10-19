<template>
  <div ref="filterDrugStoreSection">
    <ListHeader
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Referidos Para Outras Farmacias
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :clinicalService="selectedService"
            :totalRecords="totalRecords"
            :qtyProcessed="qtyProcessed"
            :progress="progress"
            :reportType="report"
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
import { ref, onMounted } from 'vue';
import referredPatients from 'src/services/reports/ReferralManagement/ReferredPatients.ts';
import reportDatesParams from 'src/services/reports/ReportDatesParams';
import referredPatintsMobileService from 'src/services/api/report/mobile/ReferredPatintsMobileService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';

const { isOnline } = useSystemUtils();
const { alertSucess, alertError, alertWarningAction } = useSwal();

const name = 'ReferredPatients';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);

const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'REFERIDO_PARA';
const progressValue = ref(0);
const progress = ref(0.0);
const filterDrugStoreSection = ref('');

onMounted(() => {
  if (props.params) {
    getProcessingStatus(props.params);
  }
});

const closeSection = () => {
  LocalStorage.remove(props.id);
  filterDrugStoreSection.value.remove();
};

// const initReportProcessing =(params) => {
//   console.log(params)
// Report.apiInitReportProcess('referredPatientsReport', params).then((response) => {
//   // reset your component inputs like textInput to nul    // or your custom route redirect with vue-router
//   // or your custom route redirect with vue-router
//     setTimeout(getProcessingStatus(params), 2)
// })
// }

const initReportProcessing = (params) => {
  progress.value = 0.001;
  console.log(params);
  if (isOnline.value) {
    Report.apiInitReferredPatientsProcessing(params).then((resp) => {
      progress.value = resp.data.progress;
      getProcessingStatus(params);
    });
  } else {
    const reportParams = reportDatesParams.determineStartEndDate(params);
    Report.referredPatientsMobileOffline(
      reportParams.startDate,
      reportParams.endDate,
      reportParams.clinicId
    ).then((respReferredPatients) => {
      const clinic = clinicService.getById(reportParams.clinicId);
      referredPatintsMobileService.saveReferredPatientsOnNano(
        respReferredPatients,
        reportParams,
        clinic
      );
      progress.value = 100;
      params.progress = 100;
    });
  }
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('referredPatientsReport', params).then((resp) => {
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

// const generateReport= (id, fileType, params) => {
//       if (fileType === 'PDF') {
//          referredPatients.downloadPDF(params).then(resp => {
//             if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
//          })
//       } else {
//          referredPatients.downloadExcel(params).then(resp => {
//             if (resp === 204) alertError('Nao existem Dados para o periodo selecionado')
//          })
//       }
// }

const generateReport = async (id, fileType, params) => {
  if (isOnline.value) {
    if (fileType === 'PDF') {
      referredPatients.downloadPDF(null, params).then((resp) => {
        if (resp === 204)
          alertError('Nao existem Dados para o periodo selecionado');
      });
    } else {
      referredPatients.downloadExcel(null, params).then((resp) => {
        if (resp === 204)
          alertError('Nao existem Dados para o periodo selecionado');
      });
    }
  } else {
    referredPatintsMobileService.getDataLocalReport(id).then((resp) => {
      if (resp <= 0) {
        alertError('Nao existem Dados para o periodo selecionado');
      } else {
        console.log(params);
        if (fileType === 'PDF') {
          referredPatients.downloadPDF(resp, params);
        } else {
          referredPatients.downloadExcel(resp, params);
        }
      }
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
