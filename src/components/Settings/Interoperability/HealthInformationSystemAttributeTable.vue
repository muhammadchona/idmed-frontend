<template>
  <q-table :rows="rows" :columns="columns" :filter="filter" virtual-scroll>
    <template v-slot:no-data="{ icon, filter }">
      <div
        class="full-width row flex-center text-primary q-gutter-sm text-body2"
      >
        <span> Sem resultados para visualizar </span>
        <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
      </div>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="interoperabilityType" :props="props">
          {{
            props.row.interoperabilityType === null
              ? ''
              : props.row.interoperabilityType.description
          }}
        </q-td>
        <q-td key="value" :props="props">
          <q-input
            v-model="props.row.value"
            dense
            autofocus
            counter
            :disable="viewMode"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>
<script setup>
/*imports*/
import { inject } from 'vue';

/*injects*/
const filter = inject('filter');
const props = defineProps(['rows', 'viewMode']);

const columns = [
  {
    name: 'interoperabilityType',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.interoperabilityType.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'value',
    required: true,
    label: 'Valor',
    align: 'left',
    field: (row) => row.value,
    format: (val) => `${val}`,
    sortable: true,
  },
];

/*Hooks*/
</script>
