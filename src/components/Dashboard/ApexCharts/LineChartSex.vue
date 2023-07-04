<template>
  <div
    style="width: 850px; min-height: 200px; linear-gradient( 135deg, #343E59 10%, #2B2D3E 40%)"
    class="relative-position"
  >
    <apexchart
      style="max-width: 100%"
      height="500"
      type="area"
      :options="chartOptions"
      :series="series"
    ></apexchart>
    <div v-if="!loaded" class="absolute-center">
      <q-spinner-ball color="primary" size="xl" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, inject, watchEffect } from "vue";
import reportService from "src/services/api/report/reportService.ts";
import apexchart from "vue3-apexcharts";

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

const loading = ref(false);
const series = ref([
  {
    name: "series-1",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
]);

const clinic = inject("currClinic");
const serviceCode = inject("serviceCode");
const year = inject("year");

const loaded = computed(() => {
  return !loading.value;
});

const chartOptions = {
  chart: {
    id: "vue-chart-line",
    toolbar: {
      show: true,
      offsetY: 7,
    },
  },
  colors: ["#0096FF", "#FF1493"],
  title: {
    text:
      "Total de Pacientes no Serviço " +
      serviceCode.value +
      " que iniciaram o levantamento",
    align: "center",
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

onMounted(() => {
  getPatientsFirstDispenseByGender();
});

watchEffect(() => {
  getPatientsFirstDispenseByGender();
});

function getPatientsFirstDispenseByGender() {
  loading.value = true;
  const fm = { name: "Feminino", data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
  const ms = {
    name: "Masculino",
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  reportService
    .getPatientsFirstDispenseByGender(year.value, clinic.value.id, serviceCode.value)
    .then((resp) => {
      for (let i = 1; i <= 12; i++) {
        resp.data.forEach((item) => {
          if (item.gender === "Feminino" && item.month === i) {
            fm.data[i - 1] = item.quantity;
          } else if (item.gender === "Masculino" && item.month === i) {
            ms.data[i - 1] = item.quantity;
          }
        });
      }
      series.value = [ms, fm];
      loading.value = false;
    });
}

watch([serviceCode, year], () => {
  getPatientsFirstDispenseByGender();
});
</script>
