<template>
  <div>
    <q-table
            :class=headerClass
            dense
            :rows="rows"
            :columns="columns"
            :filter="filter"
            row-key="id"
            :style=getStyleIfCharts()
             :title=title
            >
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                v-if=!isCharts
                style="width: 400px"
                debounce="300"
                v-model="filter"
                placeholder="Pesquisar por medicamento">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:no-data="{ icon, filter }">
              <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
                <span>
                  Sem resultados para visualizar
                </span>
                <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              </div>
            </template>
            <template #header="props">
                  <q-tr class="text-left bg-grey-3"  :props="props">
                    <q-th style="width: 70px"  v-if="false">{{columns[0].label}}</q-th>
                    <q-th class="col" >{{columns[1].label}}</q-th>
                    <q-th class="text-center" style="width: 190px" >{{columns[2].label}}</q-th>
                    <q-th class="text-center" style="width: 190px" >{{columns[3].label}}</q-th>
                    <q-th class="text-center" style="width: 190px" >{{columns[4].label}}</q-th>
                    <q-th class="text-center" style="width: 110px" v-if=!isCharts >{{columns[5].label}}</q-th>
                  </q-tr>
            </template>
            <template #body="props">
              <q-tr :props="props">
                <q-td key="order" :props="props" v-if="false">
                </q-td>
                <q-td key="drug" :props="props">
                  {{props.row.drug}}
                </q-td>
                <q-td key="avgConsuption" :props="props">
                  {{props.row.avgConsuption}}
                </q-td>
                <q-td key="balance" :props="props">
                  {{props.row.balance}}
                </q-td>
                <q-td key="state" :props="props">
                    <q-chip :color="getConsuptionRelatedColor(props.row.state)" text-color="white">
                      {{ props.row.state }}
                    </q-chip>
                </q-td>
                <q-td key="options" :props="props" v-if=!isCharts>
                  <div class="col">
                    <q-btn flat round
                    color="primary"
                    icon="description"
                      v-if=!isCharts
                    @click="openDrugFile(props.row)">
                    <q-tooltip class="bg-primary">Visualizar Ficha</q-tooltip>
                  </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
        </q-table>
  </div>
</template>

<script>
import { SessionStorage } from 'quasar'
import Report from 'src/store/models/report/Report'
import { ref } from 'vue'
import Clinic from '../../store/models/clinic/Clinic'
import Drug from '../../store/models/drug/Drug'
import mixincrypt from 'src/mixins/mixin-encryption'
import db from 'src/store/localbase'
import mixinplatform from 'src/mixins/mixin-system-platform'
import StockAlert from '../../store/models/stockAlert/StockAlert'
import mixinutils from 'src/mixins/mixin-utils'

// import CryptoJS from 'crypto-js'
const columns = [
  { name: 'order', required: true, label: 'Ordem', align: 'left', sortable: false },
  { name: 'drug', required: true, label: 'Medicamento', align: 'left', field: row => row.drug, format: val => `${val}` },
  { name: 'avgConsuption', required: true, label: 'Média de Consumo Mensal', align: 'left', field: row => row.avgConsuption, format: val => `${val}` },
  { name: 'balance', required: true, label: 'Saldo actual', align: 'left', field: row => row.balance, format: val => `${val}` },
  { name: 'state', required: true, label: 'Estado', align: 'left', field: row => row.state, format: val => `${val}` },
  { name: 'options', align: 'center', label: 'Opções', sortable: false }
]
export default {
   props: ['isCharts', 'dataLoaded', 'serviceCode'],
   mixins: [mixincrypt, mixinplatform, mixinutils],
  data () {
    const filter = ref('')
    return {
      rowData: [],
      columns,
      headerClass: '',
      title: '',
      filter
    }
  },
  methods: {
    openDrugFile (drugInfo) {
      const drug = Drug.find(drugInfo.id)
      console.log(drug)
      SessionStorage.set('selectedDrug', drug)
      this.$router.push('/stock/drugFile')
    },
    getStickyHeaderClass () {
      if (this.isCharts) {
      this.headerClass = 'my-sticky-header-table text-center'
       this.title = 'Alerta de Stock'
      } else {
         this.headerClass = 'col'
       this.title = ''
      }
    },
    getStyleIfCharts () {
         if (this.isCharts) {
      return 'width: 1000px'
      } else {
         return ''
      }
    },
    getStockAlert () {
      if (this.website) {
        this.showloading()
      Report.apiGetStockAlertAll(this.clinic.id).then(resp => {
        this.rowData = resp.response.data
        this.hideLoading()
      })
      } else {
          db.newDb().collection('stockAlert').get().then(stockAlert => {
                StockAlert.insert(
                  {
                    data: stockAlert
                  })
              })
              this.rowData = StockAlert.all()
      }
    },
    getConsuptionRelatedColor (state) {
      if (state === 'Sem Consumo') {
        return 'blue'
      } else if (state === 'Ruptura de Stock') {
        return 'red'
      } else if (state === 'Acima do Consumo Máximo') {
        return 'info'
      } else {
        return 'primary'
      }
    }
  },
  computed: {
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
    rows () {
      return this.rowData
    },
    stockList () {
      return []
    }
  },
  created () {
    this.getStockAlert()
    }
}
</script>
<style lang="sass" scoped>
.my-sticky-header-table
  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $light-green-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

</style>
