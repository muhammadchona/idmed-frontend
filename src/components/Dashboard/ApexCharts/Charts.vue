<template>
  <div>
    <div class="row q-mt-lg">
      <div class="col"></div>
      <div class="col-10">
        <div class="row justify-center">
          <div
            class="q-ml-md"
            v-for="item in clinicalServiceReports"
            :key="item.id"
          >
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
      <div class="col q-mt-lg">
        <q-input
          class="col q-mr-md"
          dense
          outlined
          v-model="year"
          type="number"
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
          <!-- <LineBySex class="col graph-conainer" v-if="this.website"> </LineBySex> -->
          <LineBySex class="col graph-conainer"> </LineBySex>
        </div>
        <!-- <div class="row" v-if="this.mobile"> -->
        <!-- <LineBySex class="col graph-conainer" :serviceCode=serviceCode :year="year"> </LineBySex>
      <DispenseTypeByGenderTable class="col-6 " :serviceCode=serviceCode :year="year"/> -->
        <!-- </div> -->
        <div class="row q-mb-xl q-ma-md">
          <DispenseTypeByAgeTable class="col-4" />
          <StockAlert class="col q-mx-md" />
          <!-- <DispenseTypeByGenderTable class="col-3 " :serviceCode=serviceCode :year="year" v-if="this.website"/> -->
          <DispenseTypeByGenderTable class="col-3" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted, provide } from 'vue';
import reportService from 'src/services/api/report/reportService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

/*Variables*/
const { closeLoading, showloading } = useLoading();
const dataLoaded = inject('dataLoaded');
const loading = ref(false);
const year = new Date().getFullYear();
const serviceCode = ref('TARV');
const clinicalServiceReports = ref([]);
const currClinic = inject('currClinic');

/*Components*/

import BarByDispenseType from 'src/components/Dashboard/ApexCharts/BarReportDispenseType.vue';
import LineByAge from 'src/components/Dashboard/ApexCharts/LineChartAgeTarv.vue';
import PieGenderChart from 'src/components/Dashboard/ApexCharts/PieGenderChart.vue';
import LineBySex from 'src/components/Dashboard/ApexCharts/LineChartSex.vue';
import DispenseTypeByAgeTable from 'src/components/Dashboard/ApexCharts/DispenseTypeByAgeTable.vue';
import StockAlert from 'src/components/Dashboard/ApexCharts/StockAlert.vue';
import DispenseTypeByGenderTable from 'src/components/Dashboard/ApexCharts/DispenseTypeByGenderTable.vue';

//   methods: {
const reload = () => {
  getDashboardServiceButton();
};
const setServiceCode = (code) => {
  serviceCode.value = code;
};
const getDashboardServiceButton = () => {
  reportService
    .getDashboardServiceButton(year, currClinic.value.id)
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
            const randomColor = require('randomcolor'); // import the script
            const color = randomColor(); // a hex code for an attractive color
            item.style = 'background-color:' + color + ';' + 'color: ##ffffff';
          }
        });
      }
    });
};

onMounted(() => {
  getDashboardServiceButton();
  closeLoading();
});

provide('serviceCode', serviceCode);
provide('year', year);
provide('currClinic', currClinic.value);
//   computed: {
//     getCodeService () {
//       return this.serviceCode
//     },
//     clinic () {
//     if (SessionStorage.getItem('currClinic') === null || SessionStorage.getItem('currClinic').id === null) {
//         const clinic = Clinic.query()
//                               .with('province.*')
//                               .with('facilityType.*')
//                               .with('district.*')
//                               .with('sectors.*')
//                               .where('mainClinic', true)
//                               .first()
//          SessionStorage.set('currClinic', clinic)
//          return clinic
//       } else {
//         return new Clinic(SessionStorage.getItem('currClinic'))
//       }
//   },
//     loaded () {
//       return !this.loading
//     }
//   },
//
watch(year.value, (newVal, oldVal) => {
  reload();
  console.log('Prop changed:', newVal, '| was:', oldVal);
  // getClinicalServicesOptions();
  // serviceCode.value = 'TARV';
  // setServiceCode('TARV');
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
