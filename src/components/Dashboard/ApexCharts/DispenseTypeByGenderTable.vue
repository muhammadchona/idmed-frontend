<template>
     <div  class="row">
      <div class="col">
        <q-table
         style="max-width: 100%; "
          :rows="rows"
          :columns="columnsGender"
           class="my-sticky-header-table text-color-white"
            title="Total de dispensa por Genero no Serviço"
           hide-bottom>
        <template v-slot:body="props">
            <q-tr :props="props">
            <q-td key="dispenseType" :props="props">
                {{ props.row.dispenseType }}
            </q-td>
            <q-td key="masculino" :props="props">
                {{ props.row.masculino }}
            </q-td>
              <q-td key="femenino" :props="props">
                {{ props.row.femenino }}
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
  { name: 'dispenseType', required: true, label: 'Tipo de Dispensa', align: 'left', field: row => row.dispenseType, format: val => `${val}` },
  { name: 'masculino', required: true, label: 'Masculino', align: 'left', field: row => row.masculino, format: val => `${val}` },
   { name: 'femenino', required: true, label: 'Feminino', align: 'left', field: row => row.femenino, format: val => `${val}` }
]

export default {
  props: ['serviceCode', 'year'],
  data () {
    return {
        columnsGender,
        rowData: []
    }
  },
  methods: {
    getDispensesByGender () {
      Report.apiGetDispensesByGender(this.year, this.clinic.id, this.serviceCode).then(resp => {
        this.rowData = resp.response.data
      })
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
      this.getDispensesByGender()
    },
    watch: {
   serviceCode: function (newVal, oldVal) {
          this.getDispensesByGender()
      },
      year: function (newVal, oldVal) {
        this.getDispensesByGender()
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
