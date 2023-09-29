<template>
  <div>
    <div class="row q-gutter-xss q-mt-sm">
      <div class="col-10">
        <div class="row justify-center">
          <div v-if="clinicalServiceReports.length == 0">
            <div class="q-pa-sm" v-for="item in clinicalServices" :key="item.id">
              <q-btn
                :color="colour"
                @click="changeSevice(item.code, colour)"
                style="background-color: black; color: #ffffff"
              >
                <q-icon left size="6em" name="health_and_safety" />
                <div>
                  Serviço {{ item.code }} <br />
                  Nenhum Pacientes Activos ao Levantamento
                </div>
              </q-btn>
            </div>
          </div>
          <div class="q-pa-sm" v-for="item in clinicalServiceReports" :key="item.id">
            <q-btn
              :color="item.colour"
              @click="changeSevice(item.service, item.colour)"
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
      <div class="col-2 q-mt-lg q-pr-md">
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

    <div class="row q-gutter-xss justify-center">
      <div class="col-12">
        <p align="center">
          <q-knob
            show-value
            font-size="17px"
            :class="'text-' + colour + ' q-ma-sm'"
            v-model="value"
            size="80px"
            :thickness="0.04"
            :color="colour"
            track-color="grey-3"
          >
            Serviço <strong>{{ serviceCode }} </strong>
          </q-knob>
          <q-spinner-facebook
            class="gt-xs"
            dense
            color="primary"
            size="2em"
            v-if="!serviceLoaded"
          ></q-spinner-facebook>
        </p>
      </div>
    </div>

    <div class="row q-gutter-xss justify-center">
      <div class="col-12">
        <BarByDispenseType class="graph-conainer" />
      </div>
    </div>

    <div class="row q-gutter-xss justify-center" key="allCharts">
      <div class="col-4">
        <LineByAge class="graph-conainer"> </LineByAge>
      </div>
      <div class="col-4">
        <PieGenderChart class="graph-conainer"> </PieGenderChart>
      </div>
      <div class="col-4">
        <LineBySex class="graph-conainer"> </LineBySex>
      </div>
    </div>

    <div class="row q-gutter-xss justify-center">
      <div class="col-4">
        <DispenseTypeByAgeTable class="q-mx-md" />
      </div>
      <div class="col-4">
        <StockAlert class="q-mx-md" />
      </div>
      <div class="col-4">
        <DispenseTypeByGenderTable class="q-mx-md" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted, provide, computed } from 'vue';
import reportService from 'src/services/api/report/ReportService.ts';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import { useLoading } from 'src/composables/shared/loading/loading';

/*Components*/

import BarByDispenseType from 'src/components/Dashboard/ApexCharts/BarReportDispenseType.vue';
import LineByAge from 'src/components/Dashboard/ApexCharts/LineChartAgeTarv.vue';
import PieGenderChart from 'src/components/Dashboard/ApexCharts/PieGenderChart.vue';
import LineBySex from 'src/components/Dashboard/ApexCharts/LineChartSex.vue';
import DispenseTypeByAgeTable from 'src/components/Dashboard/ApexCharts/DispenseTypeByAgeTable.vue';
import StockAlert from 'src/components/Dashboard/ApexCharts/StockAlert.vue';
import DispenseTypeByGenderTable from 'src/components/Dashboard/ApexCharts/DispenseTypeByGenderTable.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

/*Variables*/
const value = ref(100);
const { isOnline } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const year = ref(new Date().getFullYear());
const serviceCode = ref('TARV');
const colour = ref('green');
const clinicalServiceReports = ref([]);
const currClinic = inject('currClinic');
const serviceLoaded = ref(false);

/*methods:*/
const reload = () => {
  getDashboardServiceButton();
  closeLoading();
};

const changeSevice = (service, colourParam) => {
  serviceCode.value = service;
  colour.value = colourParam;
};

const getDashboardServiceButton = () => {
  serviceLoaded.value = false;
  reportService
    .getDashboardServiceButton(year.value, currClinic.value.id)
    .then((resp) => {
      serviceLoaded.value = true;
      if (isOnline.value) {
        clinicalServiceReports.value = resp.data;
      } else {
        clinicalServiceReports.value = resp;
      }
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

const clinicalServices = computed(() => {
  return clinicalServiceService.get(0);
});

provide('serviceCode', serviceCode);
provide('year', year);
provide('currClinic', currClinic);

onMounted(() => {
  showloading();
  getDashboardServiceButton();
  closeLoading();
});

watch(year, () => {
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
