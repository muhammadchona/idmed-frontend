<template>
<div>
  <div class="row q-mt-lg">
    <div class="col">
    </div>
    <div class="col-10">
     <div class="row justify-center ">
      <div class="q-ml-md" v-for="(item) in this.clinicalServiceReports" :key="item.id">
        <q-btn :color=item.colour @click="setServiceCode(item.service)" :style=item.style>
          <q-icon left size="6em" :name=item.icon  />
          <div >Serviço  {{item.service}} <br> {{item.quantity}} Pacientes Activos ao Levantamento </div>
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
  <p align="center"> <strong>Serviço {{serviceCode}} </strong></p>
  </div>
        <div class="q-mt-lg">
          <BarByDispenseType class="graph-conainer" v-bind:serviceCode=serviceCode :year="year" />
        <div
      class=""
      key="allCharts"
    >
    <div class="row">
      <LineByAge class="col graph-conainer" :serviceCode=serviceCode :year="year" > </LineByAge>
      <PieGenderChart class="col graph-conainer" :serviceCode=serviceCode :year="year" > </PieGenderChart>
      <LineBySex class="col graph-conainer" :serviceCode=serviceCode :year="year" v-if="this.website"> </LineBySex>
    </div>
    <div class="row" v-if="this.mobile">
      <LineBySex class="col graph-conainer" :serviceCode=serviceCode :year="year"> </LineBySex>
      <DispenseTypeByGenderTable class="col-6 " :serviceCode=serviceCode :year="year"/>
    </div>
      <div class="row q-mb-xl q-ma-md" >
        <DispenseTypeByAgeTable class="col-4 " :serviceCode=serviceCode :year="year" />
        <StockAlert class="col q-mx-md" :serviceCode=serviceCode :year="year" />
        <DispenseTypeByGenderTable class="col-3 " :serviceCode=serviceCode :year="year" v-if="this.website"/>
      </div>
    </div>
         </div>
</div>
</template>

<script>
import Clinic from '../../../store/models/clinic/Clinic'
import { ref } from 'vue'
import Report from 'src/store/models/report/Report'
import { SessionStorage } from 'quasar'
import mixinplatform from 'src/mixins/mixin-system-platform'
export default {
    mixins: [mixinplatform],
     props: ['dataLoaded'],
    data () {
      const loading = ref(false)
        return {
          loading,
          year: new Date().getFullYear(),
          serviceCode: 'TARV',
          clinicalServiceReports: []
        }
    },
    components: {
      PieGenderChart: require('components/Dashboard/ApexCharts/PieGenderChart.vue').default,
      BarByDispenseType: require('components/Dashboard/ApexCharts/BarReportDispenseType.vue').default,
      LineByAge: require('components/Dashboard/ApexCharts/LineChartAgeTarv.vue').default,
      LineBySex: require('components/Dashboard/ApexCharts/LineChartSex.vue').default,
      StockAlert: require('components/Dashboard/ApexCharts/StockAlert.vue').default,
      DispenseTypeByAgeTable: require('components/Dashboard/ApexCharts/DispenseTypeByAgeTable.vue').default,
      DispenseTypeByGenderTable: require('components/Dashboard/ApexCharts/DispenseTypeByGenderTable.vue').default
    },
    methods: {
      reload () {
        this.loading = true
        this.getDashboardServiceButton()
      },
      setServiceCode (code) {
        console.log(code)
        this.serviceCode = code
      },
      getDashboardServiceButton () {
        Report.apiGetDashboardServiceButton(this.year, this.clinic.id).then(resp => {
          console.log(resp.response.data)
          this.clinicalServiceReports = resp.response.data
          if (this.clinicalServiceReports.length > 0) {
            this.clinicalServiceReports.forEach((item) => {
              if (item.service === 'TARV') {
                item.colour = 'green'
                item.icon = 'medication'
              } else if (item.service === 'TPT') {
                item.colour = 'red'
                item.icon = 'vaccines'
              } else if (item.service === 'PREP') {
                item.colour = 'teal'
                item.icon = 'health_and_safety'
              } else {
                item.icon = 'health_and_safety'
                const randomColor = require('randomcolor') // import the script
                const color = randomColor() // a hex code for an attractive color
                item.style = 'background-color:' + color + ';' + 'color: ##ffffff'
              }
            })
            }
          this.loading = false
        })
      }
    },
    computed: {
      getCodeService () {
        return this.serviceCode
      },
      clinic () {
      if (SessionStorage.getItem('currClinic') === null || SessionStorage.getItem('currClinic').id === null) {
          const clinic = Clinic.query()
                                .with('province.*')
                                .with('facilityType.*')
                                .with('district.*')
                                .with('sectors.*')
                                .where('mainClinic', true)
                                .first()
           SessionStorage.set('currClinic', clinic)
           return clinic
        } else {
          return new Clinic(SessionStorage.getItem('currClinic'))
        }
    },
      loaded () {
        return !this.loading
      }
    },
    created () {
      this.loading = true
      this.getDashboardServiceButton()
    },
   watch: {
      year: function (newVal, oldVal) {
        this.reload()
        console.log('Prop changed: ', newVal, ' | was: ', oldVal)
        // this.getClinicalServicesOptions()
        // this.serviceCode = 'TARV'
        // this.setServiceCode('TARV')
      }
     }
}
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
