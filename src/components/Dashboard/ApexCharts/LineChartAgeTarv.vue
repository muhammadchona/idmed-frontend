<template>
  <div class="relative-position">
    <apexchart
      style="max-width: 100%"
      height="500"
      type="line"
      :options="chartOptions"
      :series="series"
    ></apexchart>
    <div v-if="!loaded" class="absolute-center">
      <q-spinner-ball color="primary" size="xl" />
    </div>
  </div>
</template>

<script setup>
import apexchart from "vue3-apexcharts";
import { ref, watch, onMounted, inject, computed } from "vue";
import reportService from "src/services/api/report/reportService.ts";

const month = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const serviceCode = inject("serviceCode");
const year = inject("year");
const currClinic = inject("currClinic");

const loading = ref(false);
// const clinic = computed(() => Clinic.query().where('id', SessionStorage.getItem('currClinic').id).first());
const chartOptions = {
  chart: {
    id: "vue-chart-line",
    toolbar: {
      show: true,
      offsetY: 7,
    },
  },
  colors: ["#6a0dad", "#AAFF00"],
  title: {
    text: `Total de Pacientes no Serviço ${serviceCode.value}\n que iniciaram o levantamento`,
    size: 10,
    align: "center",
    offsetY: -3,
    style: {
      color: "#000000",
      fontSize: "13px",
    },
  },
  animations: {
    enabled: true,
    easing: "easeinout",
    speed: 1000,
  },
  stroke: {
    show: true,
    curve: "smooth",
    lineCap: "butt",
    colors: undefined,
    width: 5,
    dashArray: 0,
    markers: {
      size: 1,
    },
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val;
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: [...month],
  },
};

const series = ref([
  {
    name: "series-1",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
]);

const loaded = computed(() => !loading.value);

const getPatientsFirstDispenseByAge = () => {
  loading.value = true;
  const fm = { name: "Criancas", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
  const ms = { name: "Adultos", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };

  reportService
    .getPatientsFirstDispenseByAge(year.value, currClinic.value.id, serviceCode.value)
    .then((resp) => {
      for (let i = 1; i <= 12; i++) {
        resp.data.forEach((item) => {
          if (item.faixa === "MENOR" && item.month === i) {
            fm.data[i - 1] = item.quantity;
          } else if (item.faixa === "ADULTO" && item.month === i) {
            ms.data[i - 1] = item.quantity;
          }
        });
      }
      series.value = [fm, ms];
      loading.value = false;
    });
};

onMounted(() => {
  getPatientsFirstDispenseByAge();
});

watch([serviceCode, year], () => {
  getPatientsFirstDispenseByAge();
});
</script>
