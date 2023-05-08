<template>
  <q-card style="width: 900px; max-width: 90vw;">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="row items-center text-subtitle1 q-pa-md">
        <q-icon  name="report" size="md" color="primary"/>
        <div class="text-bold text-grey-10 q-ml-sm">Detalhes do progresso da migração de {{getStageDescription}}</div>
      </div>
      <q-separator/>
    </q-card-section>
    <q-table
      flat
      class="q-my-lg q-mx-md"
      separator="horizontal"
      :rows="rows"
      :columns="columns"
      row-key="name"
      hide-bottom
    >
      <template #body="props">
          <q-tr :props="props">
            <q-td key="total" :props="props">
              {{props.row.total_records}}
            </q-td>
            <q-td key="migrated" :props="props">
              {{props.row.migrated}}
            </q-td>
            <q-td key="rejected" :props="props">
              {{props.row.rejcted}}
            </q-td>
            <q-td key="id" :props="props">
              {{props.row.id}}
            </q-td>
            <q-td key="migration_progress" :props="props">
              {{props.row.migration_progress.toFixed(2)}}%
            </q-td>
          </q-tr>
        </template>
    </q-table>
    <q-btn unelevated color="red" label="Fechar" @click="$emit('close')" class="float-right q-mr-md q-mb-md" />
  </q-card>
</template>

<script>
import Report from 'src/store/models/report/Report'
import { QSpinnerBall, useQuasar } from 'quasar'
const columns = [
  { name: 'total', align: 'center', label: 'Total', field: 'total_records', sortable: true },
  { name: 'migrated', label: 'Migrados', field: 'migrated', sortable: true },
  { name: 'rejected', label: 'Rejeitados', field: 'rejcted' },
  { name: 'id', label: 'Tipo de registo', field: 'id' },
  { name: 'migration_progress', label: 'Progresso', field: 'migration_progress' }
]
export default {
  props: ['stage'],
  data () {
    return {
      columns,
      rows: [],
      $q: useQuasar()
    }
  },
  methods: {
    showloading () {
      console.log('loaging')
       this.$q.loading.show({
          spinner: QSpinnerBall,
          spinnerColor: 'gray',
          spinnerSize: 140,
          message: 'Carregando informação, aguarde por favor...',
          messageColor: 'white'
        })
    },
    hideLoading () {
      this.$q.loading.hide()
    },
    getMigrationProgressDetails () {
      Report.apiMigrationStatusDetails(this.stage).then(resp => {
        this.rows = resp.response.data
        console.log(this.rows)
        this.hideLoading()
      })
    }
  },
  mounted () {
    this.showloading()
    this.getMigrationProgressDetails()
  },
  computed: {
    getStageDescription () {
      if (this.stage === 'PATIENT_MIGRATION_STAGE') return 'pacientes'
      if (this.stage === 'STOCK_MIGRATION_STAGE') return 'stock'
      if (this.stage === 'PARAMS_MIGRATION_STAGE') return 'params'
      return ''
    }
  }
}
</script>

<style>

</style>
