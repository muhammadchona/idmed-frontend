<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="row items-center text-subtitle1 q-pa-md">
        <q-icon name="report" size="md" color="primary" />
        <div class="text-bold text-grey-10 q-ml-sm">
          Detalhes do progresso da migração de {{ getStageDescription }}
        </div>
      </div>
      <q-separator />
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
            {{ props.row.total_records }}
          </q-td>
          <q-td key="migrated" :props="props">
            {{ props.row.migrated }}
          </q-td>
          <q-td key="rejected" :props="props">
            {{ props.row.rejcted }}
          </q-td>
          <q-td key="id" :props="props">
            {{ props.row.id }}
          </q-td>
          <q-td key="migration_progress" :props="props">
            {{ props.row.migration_progress.toFixed(2) }}%
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-btn
      unelevated
      color="red"
      label="Fechar"
      @click="$emit('close')"
      class="float-right q-mr-md q-mb-md"
    />
  </q-card>
</template>

<script setup>
import ReportService from 'src/services/api/report/ReportService';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, onMounted, computed } from 'vue';
const columns = [
  {
    name: 'total',
    align: 'center',
    label: 'Total',
    field: 'total_records',
    sortable: true,
  },
  { name: 'migrated', label: 'Migrados', field: 'migrated', sortable: true },
  { name: 'rejected', label: 'Rejeitados', field: 'rejcted' },
  { name: 'id', label: 'Tipo de registo', field: 'id' },
  {
    name: 'migration_progress',
    label: 'Progresso',
    field: 'migration_progress',
  },
];

const props = defineProps(['stage']);
const { alertSucess } = useSwal();
const { closeLoading, showloading } = useLoading();

const rows = ref([]);

const getMigrationProgressDetails = () => {
  ReportService.apiMigrationStatusDetails(props.stage).then((resp) => {
    rows.value = resp.data;
    console.log(rows);
    closeLoading();
  });
};

onMounted(() => {
  showloading();
  getMigrationProgressDetails();
});

const getStageDescription = computed(() => {
  if (props.stage === 'PATIENT_MIGRATION_STAGE') return 'pacientes';
  if (props.stage === 'STOCK_MIGRATION_STAGE') return 'stock';
  if (props.stage === 'PARAMS_MIGRATION_STAGE') return 'params';
  return '';
});
</script>
<style></style>
