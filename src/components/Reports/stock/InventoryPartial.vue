<template>
  <div ref="filterPartialInventorySection">
    <ListHeader
      v-if="resultFromLocalStorage"
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ serviceAux !== null ? serviceAux.code : '' }}: Relatório de
      Inventário Parcial
    </ListHeader>
    <ListHeader
      v-else
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection(params)"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}:
      Relatório de Inventário Parcial
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
import InventoryPartialTS from 'src/services/reports/stock/InventoryPartial.ts';
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useQuasar } from 'quasar';
import moment from 'moment';

const { isOnline } = useSystemUtils();
const { alertError } = useSwal();
const name = 'InventoryPartial';
const props = defineProps(['selectedService', 'menuSelected', 'id', 'params']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const report = 'INVENTARIO_PARCIAL';
const progress = ref(0.0);
const filterPartialInventorySection = ref('');
const downloadingPdf = ref(false);
const downloadingXls = ref(false);
const isReportClosed = ref(false);
const $q = useQuasar();

const closeSection = (params) => {
  filterPartialInventorySection.value.remove();
  if (params) {
    const paramId = params.id;
    isReportClosed.value = true;
    LocalStorage.remove(paramId);
  }
};

const serviceAux = ref(null);
const resultFromLocalStorage = ref(false);

const checkBox = (items, reportId, fileType) => {
  const inventories = items.map((obj) => {
    return {
      value: obj.id, // Example of transforming property
      label: moment(obj.endDate).format('DD-MM-YYYY'), // Example of transforming property
    };
  });

  $q.dialog({
    title: 'Lista de Inventarios',
    message: 'Seleccione o inventario:',
    options: {
      type: 'checkbox',
      model: [],
      // inline: true
      items: inventories,
    },
    cancel: true,
    persistent: true,
  })
    .onOk((data) => {
      data.forEach((id) => {
        printReportInv(id, reportId, fileType);
      });
      downloadingPdf.value = false;
    })
    .onCancel(() => {
      downloadingXls.value = false;
      downloadingPdf.value = false;
    })
    .onDismiss(() => {
      downloadingXls.value = false;
      downloadingPdf.value = false;
    });
};
const printReportInv = (id, reportId, fileType) => {
  Report.apiPrintInventoryReport(id, reportId).then((resp) => {
    if (!resp.data[0]) {
      alertError('Não existem Dados para o período selecionado');
      downloadingXls.value = false;
      downloadingPdf.value = false;
    } else {
      const patientAux = resp.data[0].adjustments[0];

      if (fileType === 'PDF') {
        InventoryPartialTS.downloadPDF(
          patientAux.province,
          patientAux.startDate,
          patientAux.endDate,
          resp.data
        );
        downloadingPdf.value = false;
      } else {
        downloadingPdf.value;
        InventoryPartialTS.downloadExcel(
          patientAux.province,
          patientAux.startDate,
          patientAux.endDate,
          resp.data
        );
        downloadingXls.value = false;
      }
    }
  });
};

const updateParamsOnLocalStrage = (params, isReportClosed) => {
  if (!isReportClosed.value) LocalStorage.set(params.id, params);
};

const initReportProcessing = async (params) => {
  progress.value = 0.001;
  if (isOnline.value) {
    updateParamsOnLocalStrage(params, isReportClosed);
    Report.apiInitInventoryReportProcessing(params).then((response) => {
      getProcessingStatus(params);
    });
  } else {
    updateParamsOnLocalStrage(params, isReportClosed);
    // const resp = await patientWithoutDispenseService.getDataLocalDb(params);
    //progress.value = 100;
    //params.progress = 100;
  }
};

const getInventoryList = (params, fileType) => {
  Report.getInventoryList('inventoryReport', params).then((resp) => {
    if (resp.data.length === 0) {
      alertError('Não existem Dados para o período selecionado');
      downloadingXls.value = false;
      downloadingPdf.value = false;
    } else {
      checkBox(resp.data, params, fileType);
    }
  });
};

const getProcessingStatus = (params) => {
  Report.getProcessingStatus('inventoryReport', params).then((resp) => {
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
    getInventoryList(id, fileType);
    // alert('testee');
    // viewInvenvtories.value = true;
    /*  Report.apiPrintInventoryReport(id).then((resp) => {
      if (!resp.data[0]) {
        alertError('Não existem Dados para o período selecionado');
        downloadingXls.value = false;
        downloadingPdf.value = false;
      } else {
        const patientAux = resp.data[0];

        if (fileType === 'PDF') {
          InventoryPartialTS.downloadPDF(
            patientAux.province,
            patientAux.startDate,
            patientAux.endDate,
            resp.data
          );
          downloadingPdf.value = false;
        } else {
          InventoryPartialTS.downloadExcel(
            patientAux.province,
            patientAux.startDate,
            patientAux.endDate,
            resp.data
          );
          downloadingXls.value = false;
        }
      }
    }); */
  } else {
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
