<template>
   <div class="relative-position">
    <apexchart
    style="max-width: 100%; "
      height="500"
      type="bar"
      :options="chartOptions"
      :series="series"
    ></apexchart>
   <div v-if="!loaded" class="absolute-center">
        <q-spinner-ball
          color="primary"
          size="xl"
        />
      </div>
   </div>
</template>

<script>
 import VueApexCharts from 'vue3-apexcharts'
import { ref } from 'vue'
 import { SessionStorage } from 'quasar'
import Report from 'src/store/models/report/Report'
import Clinic from '../../../store/models/clinic/Clinic'
const monthsX = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEC']
const toDateStr = str => new Date(str.replace(/^(\d+)\/(\d+)\/(\d+)$/, '$2/$1/$3'))
const monthsEng = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
export default {
      props: ['serviceCode', 'year'],
      mapDispenseMonthly: new Map(),
      mapDispenseQuarterly: new Map(),
      mapDispenseSemestraly: new Map(),
       arrDispenseMonthly: [],
      arrDispenseQuarterly: [],
      arrDispenseSemestraly: [],
       monthsX,
       toDateStr,
       monthsEng,
      components: {
        apexchart: VueApexCharts
      },
  data: function () {
    const loading = ref(false)
    return {
      loading,
      chartOptions: { // ApexCharts options
        chart: {
          id: 'vue-chart-bar'
        },
        colors: ['#F44336', '#13c185', '#13a6c1'],
         animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 1000
        },
         title: {
          text: 'Total de Pacientes com Levantamentos no Serviço ' + this.serviceCode,
          align: 'center',
          style: {
            color: '#000000'
          }
          },
           plotOptions: {
              bar: {
                borderRadius: 10
              }
           },
          stroke: {
            show: true,
            curve: 'smooth',
            lineCap: 'butt',
            colors: undefined,
            width: 2,
            dashArray: 0
        },
        fill: {
                  opacity: 2
                },
                tooltip: {
                  y: {
                    formatter: function (val) {
                      return val
                    }
                  }
                },
              dataLabels: {
                  enabled: true
                },
                xaxis: {
              categories: [...monthsX]
              }
      },
      series: [{
          name: 'series-1',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }]
      }
  },
  methods: {
    getRegisteredPatientByDispenseType () {
      this.loading = true
      const dms = { name: 'Dispensa Mensal', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      const dts = { name: 'Dispensa Trimestral', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
      const dss = { name: 'Dispensa Semestral', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }

      console.log(this.year)
      console.log(this.serviceCode)

      Report.apiGetRegisteredPatientByDispenseType(this.year, this.clinic.id, this.serviceCode).then(resp => {
        console.log(resp.response.data)
        for (let i = 1; i <= 12; i++) {
          resp.response.data.forEach((item) => {
            if (item.dispense_type === 'DM' && item.month === i) {
              dms.data[i - 1] = item.quantity
            } else if (item.dispense_type === 'DT' && item.month === i) {
              dts.data[i - 1] = item.quantity
            } else if (item.dispense_type === 'DS' && item.month === i) {
              dss.data[i - 1] = item.quantity
            }
          })
        }
        this.series = []
        this.series[0] = dms
        this.series[1] = dts
        this.series[2] = dss
        this.loading = false
      })
    },
    reload () {
      this.getRegisteredPatientByDispenseType()
    }
  },
  computed: {
      clinic () {
      return Clinic.query()
                  .where('id', SessionStorage.getItem('currClinic').id)
                  .first()
    },
    loaded () {
      return !this.loading
    }
  },
    created () {
      this.getRegisteredPatientByDispenseType()
    },
     watch: {
      serviceCode: function (newVal, oldVal) { this.reload() },
      year: function (newVal, oldVal) { this.reload() }
    }
}
</script>
