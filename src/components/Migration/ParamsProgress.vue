<template>
  <div>
    <apexchart
      style="max-width: 100%; "
      height="500"
      type="radialBar"
      :options="chartOptions"
      :series="series"
      />
      <div class="column items-center">
        <q-table
          flat
            separator="vertical"
          :rows="rows"
          :columns="columns"
          row-key="name"
          hide-bottom
        >
        </q-table>
      </div>
   </div>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
const columns = [
  { name: 'total', align: 'center', label: 'Total', field: 'total', sortable: true },
  { name: 'migrated', label: 'Migrados', field: 'migrated', sortable: true },
  { name: 'rejected', label: 'Rejeitados', field: 'rejected' }
]
export default {
  props: ['data'],
  components: {
    apexchart: VueApexCharts
  },
  watch: {
    data: function (newVal, oldVal) {
      this.series[0] = newVal.stage_progress.toFixed(2)
    }
  },
  computed: {
    rows () {
      return [
        {
          total: this.data.total_records,
          migrated: this.data.total_migrated,
          rejected: this.data.total_rejcted
        }
      ]
    }
  },
  data () {
    return {
      columns,
      series: [this.data.stage_progress.toFixed(2)],
          chartOptions: {
            chart: {
              height: 350,
              type: 'radialBar',
              offsetY: -10
            },
            plotOptions: {
              radialBar: {
                startAngle: -135,
                endAngle: 135,
                dataLabels: {
                  name: {
                    fontSize: '16px',
                    color: undefined,
                    offsetY: 120
                  },
                  value: {
                    offsetY: 76,
                    fontSize: '22px',
                    color: undefined,
                    formatter: function (val) {
                      return val + '%'
                    }
                  }
                }
              }
            },
            fill: {
              type: 'gradient',
              gradient: {
                  shade: 'dark',
                  shadeIntensity: 0.15,
                  inverseColors: false,
                  opacityFrom: 1,
                  opacityTo: 1,
                  stops: [0, 50, 65, 91]
              }
            },
            stroke: {
              dashArray: 4
            },
            labels: ['Parametros']
          }
    }
  }
}
</script>

<style>

</style>
