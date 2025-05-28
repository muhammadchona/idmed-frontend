<template>
  <div class="q-mt-lg">
    <TitleBar />
    <div class="q-mx-xl">
      <div class="row items-center q-my-md">
        <q-icon name="person_outline" size="sm" />
        <span class="q-pl-sm text-subtitle2">Pesquisar Paciente/Utente</span>
      </div>
      <div class="q-mt-lg q-mb-md">
        <q-separator color="grey-13" size="1px" />
      </div>
      <div>
        <q-table
          class="col"
          dense
          :rows="patientList"
          :columns="columns"
          row-key="name"
          :filter="filter"
          ref="tableRef"
          v-model:currPatient="currPatient"
          @row-click="onPatientClick"
        >
          <template v-slot:top-right>
            <q-input
              dense
              debounce="600"
              color="primary"
              v-model="filter"
              placeholder="Procurar Paciente"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:no-data="{ icon, filter }">
            <div
              class="full-width row flex-center text-primary q-gutter-sm text-body2"
            >
              <span> Sem resultados para visualizar </span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
        </q-table>
      </div>
    </div>
  </div>
</template>
<script setup>
import TitleBar from 'src/components/Shared/TitleBar.vue';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { inject, ref } from 'vue';

const { preferedIdentifierValue, fullName } = usePatient();
const { idadeCalculator, getDDMMYYYFromJSDate } = useDateUtils();
const filter = ref('');
const patientList = inject('patientList');
const currPatient = inject('currPatient');
const onPatientClick = inject('onPatientClick');

const columns = [
  {
    name: 'identifier',
    align: 'left',
    label: 'Identificador',
    field: (row) => preferedIdentifierValue(row),
    sortable: false,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    field: (row) => fullName(row),
    sortable: false,
  },
  {
    name: 'age',
    align: 'center',
    label: 'Idade',
    field: (row) => idadeCalculator(getDDMMYYYFromJSDate(row.dateOfBirth)),
    sortable: false,
  },
  {
    name: 'gender',
    align: 'center',
    label: 'Sexo',
    field: (row) => row.gender,
    sortable: false,
  },
];
</script>
