<template>
     <div  class="row">
      <div class="col">
        <q-table
         style="max-width: 100%; "
          :rows="rows"
          :columns="columnsGender"
           class="my-sticky-header-table text-color-white"
            title="Alerta de Stock"
           >
        <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="drug" :props="props">
                {{ props.row.drug }}
            </q-td>
            <q-td key="avgConsuption" :props="props">
                {{ props.row.avgConsuption }}
            </q-td>
              <q-td key="balance" :props="props">
                {{ props.row.balance }}
            </q-td>
              <q-td key="state" :props="props">
                <q-chip :color="this.getConsuptionRelatedColor(props.row.state)" text-color="white">
                  {{ props.row.state }}
                </q-chip>
            </q-td>
            </q-tr>
        </template>
    </q-table>
      </div>
    </div>
</template>
<script>
import Clinic from '../../../store/models/clinic/Clinic'
import Report from 'src/store/models/report/Report'
import { SessionStorage } from 'quasar'

const columnsGender = [
  { name: 'drug', required: true, label: 'Medicamento', align: 'left', field: row => row.drug, format: val => `${val}` },
  { name: 'avgConsuption', required: true, label: 'Média de Consumo Mensal', align: 'left', field: row => row.avgConsuption, format: val => `${val}` },
  { name: 'balance', required: true, label: 'Saldo actual', align: 'left', field: row => row.balance, format: val => `${val}` },
   { name: 'state', required: true, label: 'Estado', align: 'left', field: row => row.state, format: val => `${val}` }
]

export default {
  props: ['serviceCode'],
  data () {
    return {
        columnsGender,
        rowData: []
    }
  },
  methods: {
    getStockAlert () {
      Report.apiGetStockAlert(this.clinic.id, this.serviceCode).then(resp => {
        this.rowData = resp.response.data
      })
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
      return Clinic.query()
                  .where('id', SessionStorage.getItem('currClinic').id)
                  .first()
    },
    rows () {
      return this.rowData
    }
  },
    created () {
      this.getStockAlert()
    },
    watch: {
   serviceCode: function (newVal, oldVal) {
        this.getStockAlert()
    }
  }
}
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: $light-green-1

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
