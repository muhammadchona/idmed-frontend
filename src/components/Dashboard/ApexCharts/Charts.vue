<template>
  <div>
    <div class="row q-mt-lg">
      <div class="col"></div>
      <div class="col-10">
        <div class="row justify-center">
          <div class="q-ml-md" v-for="item in clinicalServiceReports" :key="item.id">
            <q-btn
              :color="item.colour"
              @click="setServiceCode(item.service)"
              :style="item.style"
            >
              <q-icon left size="6em" :name="item.icon" />
              <div>
                Serviço {{ item.service }} <br />
                {{ item.quantity }} Pacientes Activos ao Levantamento
              </div>
            </q-btn>
          </div>
        </div>
      </div>
      <div class="col q-mt-lg q-pr-md">
        <q-select
          outlined
          v-model="year"
          :options="yearsToShow"
          option-label="name"
          option-value="name"
          filled
          dense
          label="Ano"
        />
      </div>
    </div>
    <div class="q-mt-lg">
      <p align="center">
        <strong>Serviço {{ serviceCode }} </strong>
      </p>
    </div>
    <div class="q-mt-lg">
      <BarByDispenseType class="graph-conainer" />
      <div class="" key="allCharts">
        <div class="row">
          <LineByAge class="col graph-conainer"> </LineByAge>
          <PieGenderChart class="col graph-conainer"> </PieGenderChart>
          <LineBySex class="col graph-conainer"> </LineBySex>
        </div>
        <div class="row q-mb-xl q-ma-md">
          <DispenseTypeByAgeTable class="col-4" />
          <StockAlert class="col q-mx-md" />
          <DispenseTypeByGenderTable class="col-3" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted, provide, reactive, computed } from 'vue';
import reportService from 'src/services/api/report/reportService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

/*Components*/

import BarByDispenseType from 'src/components/Dashboard/ApexCharts/BarReportDispenseType.vue';
import LineByAge from 'src/components/Dashboard/ApexCharts/LineChartAgeTarv.vue';
import PieGenderChart from 'src/components/Dashboard/ApexCharts/PieGenderChart.vue';
import LineBySex from 'src/components/Dashboard/ApexCharts/LineChartSex.vue';
import DispenseTypeByAgeTable from 'src/components/Dashboard/ApexCharts/DispenseTypeByAgeTable.vue';
import StockAlert from 'src/components/Dashboard/ApexCharts/StockAlert.vue';
import DispenseTypeByGenderTable from 'src/components/Dashboard/ApexCharts/DispenseTypeByGenderTable.vue';

/*Variables*/
const { closeLoading } = useLoading();
const year = ref(new Date().getFullYear());
const serviceCode = ref('TARV');
const clinicalServiceReports = ref([]);
const currClinic = inject('currClinic');


//   methods:
const reload = () => {
  getDashboardServiceButton();
  closeLoading();
};

const setServiceCode = (code) => {
  serviceCode.value = code;
};
const getDashboardServiceButton = () => {
  reportService
    .getDashboardServiceButton(year.value, currClinic.value.id)
    .then((resp) => {
      clinicalServiceReports.value = resp.data;
      if (clinicalServiceReports.value.length > 0) {
        clinicalServiceReports.value.forEach((item) => {
          if (item.service === 'TARV') {
            item.colour = 'green';
            item.icon = 'medication';
          } else if (item.service === 'TPT') {
            item.colour = 'red';
            item.icon = 'vaccines';
          } else if (item.service === 'PREP') {
            item.colour = 'teal';
            item.icon = 'health_and_safety';
          } else {
            item.icon = 'health_and_safety';
            const color = Math.floor(Math.random() * 16777215).toString(16);
            item.style = 'background-color: #' + color + ';' + 'color: ##ffffff';
          }
        });
      }
    });
};

const yearsToShow = computed(() => {
  const years = [];
  const currentYear = new Date().getFullYear();
  years.push(currentYear);
  for (let i = 1; i < 5; i++) {
    years.push(currentYear - i);
  }
  return years;
});

provide('serviceCode', serviceCode);
provide('year', year);
provide('currClinic', currClinic);

onMounted(() => {
  getDashboardServiceButton();
  closeLoading();
});

watch(year, (newVal, oldVal) => {
  reload();
});
</script>

<style lang="scss">
.graph-conainer {
  border: 1px solid $grey-13;
  border-radius: 10px;
  margin: 15px;
  padding: 15px;
  background-color: $light-green-1;
}
</style>
