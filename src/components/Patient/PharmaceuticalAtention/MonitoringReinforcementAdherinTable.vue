<template>
  <div class="q-pa-md" style="width: 900px; max-width: 90vw">
    <q-table
      title="Monitoria e Reforço de Adesão"
      :rows="monithoringQuestions"
      :columns="columns"
      row-key="question"
      :separator="separator"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      virtual-scroll
      hide-bottom
      table-header-class="text-white"
      class="my-sticky-header-table"
      title-class="text-bold text-white"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td
            key="question"
            v-if="props.row.code === '01' || props.row.code == '03'"
          >
            {{ props.row.question }}
          </q-td>
          <q-td
            key="question"
            v-if="
              (props.row.code === '02' && viewLateDaysWithout) ||
              (props.row.code === '04' && viewLateMotives)
            "
            align="left"
          >
            {{ props.row.question }}
          </q-td>
          <q-td
            key="completed"
            v-if="
              props.row.code !== '02' &&
              props.row.code !== '04' &&
              props.row.code !== '05'
            "
            align="right"
          >
            <q-radio
              v-model="props.row.completed"
              val="true"
              @update:model-value="handleInput(props.row)"
              :disable="onlyView"
            />
          </q-td>
          <q-td
            key="completed"
            v-if="
              props.row.code !== '02' &&
              props.row.code !== '04' &&
              props.row.code !== '05'
            "
            align="left"
          >
            <q-radio
              v-model="props.row.completed"
              val="false"
              @update:model-value="handleInput(props.row)"
              :disable="onlyView"
            />
          </q-td>
          <q-td
            key="days"
            v-if="
              (props.row.code === '02' && viewLateDaysWithout) ||
              (props.row.code === '04' && viewLateMotives)
            "
            align="left"
          >
            <q-input
              v-if="props.row.code === '02' && viewLateDaysWithout"
              :disable="onlyView"
              v-model.number="props.row.days"
              type="number"
              @update:model-value="handleInput(props.row)"
            />
            <q-input
              v-if="props.row.code === '04' && viewLateMotives"
              :disable="onlyView"
              v-model.number="props.row.days"
              type="number"
              @update:model-value="handleInput(props.row)"
            />
          </q-td>
          <q-td
            key="question"
            v-if="props.row.code === '05' && viewLateMotives"
          >
            <q-input
              filled
              v-if="!onlyView"
              v-model="props.row.text"
              label="Motivos"
              @update:model-value="handleInput(props.row)"
            />
            <q-input
              v-if="onlyView"
              :disable="onlyView"
              filled
              v-model="props.row.text"
              label="Motivos"
              @update:model-value="handleInput(props.row)"
            />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-card>
      <q-card-actions align="right" class="q-mb-md q-mr-sm" v-if="onlyView">
        <q-btn
          label="Sair"
          color="red"
          @click="closeButtonActions()"
          align="right"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>
<script setup>
import { computed, inject, onMounted, ref } from 'vue';
const columns = [
  {
    name: 'question',
    required: true,
    label: 'Perguntas de Monitoria e Reforço a Adesão',
    align: 'left',
    field: (row) => row.question,
    format: (val) => `${val}`,
  },
  { name: 'sim', label: 'Sim', field: (row) => row.completed, align: 'right' },
  { name: 'nao', label: 'Não', field: (row) => row.completed, align: 'left' },
];

const monithoringQuestions = ref([
  {
    question: 'O paciente veio na data marcada ?',
    completed: false,
    code: '01',
  },
  {
    question: 'Se não, quantos dias de atraso completou o paciente ?',
    completed: false,
    code: '02',
    days: '',
  },
  {
    question:
      'Nos ultimos 2 meses teria se esquecido de tomar os seus medicamentos algum dia na sua hora habitual ?',
    completed: false,
    code: '03',
    date: '',
  },
  {
    question: 'Quantos dias passou da hora sem tomar os medicamentos ?',
    completed: false,
    code: '04',
    days: '',
  },
  {
    question: '',
    completed: false,
    code: '05',
    date: '',
    text: '',
  },
]);

//Inject
const adherenceScreening = inject('adherenceScreening');
const onlyView = inject('onlyView');
const closeButtonActions = inject('closeButtonActions');

const showPatientVisit = inject('showPatientVisit');

// Hook
onMounted(() => {
  addingValueToArray();
});

// Computed
const selectedAdherenceTracing = computed(() => {
  if (adherenceScreening !== null && adherenceScreening !== undefined) {
    return adherenceScreening.value;
  } else {
    return showPatientVisit.value.adherenceScreenings[0];
  }
});

const viewLateMotives = computed(() => {
  if (adherenceScreening !== null && adherenceScreening !== undefined) {
    return adherenceScreening.value.patientForgotMedicine === 'true' ||
      adherenceScreening.value.patientForgotMedicine === true
      ? true
      : false;
  } else {
    return selectedAdherenceTracing.value.patientForgotMedicine === 'true' ||
      selectedAdherenceTracing.value.patientForgotMedicine === true
      ? true
      : false;
  }
});

const viewLateDaysWithout = computed(() => {
  if (adherenceScreening !== null && adherenceScreening !== undefined) {
    return adherenceScreening.value.hasPatientCameCorrectDate === 'true' ||
      adherenceScreening.value.hasPatientCameCorrectDate === true
      ? false
      : true;
  } else {
    return selectedAdherenceTracing.value.hasPatientCameCorrectDate ===
      'true' ||
      selectedAdherenceTracing.value.hasPatientCameCorrectDate === true
      ? false
      : true;
  }
});

//Methods
const handleInput = (row) => {
  switch (row.code) {
    case '01':
      adherenceScreening.value.hasPatientCameCorrectDate = row.completed;
      if (
        viewLateDaysWithout.value === false ||
        viewLateDaysWithout.value === 'false'
      ) {
        adherenceScreening.value.daysWithoutMedicine = 0;
      }
      break;
    case '02':
      if (
        adherenceScreening.value.hasPatientCameCorrectDate === 'false' ||
        adherenceScreening.value.hasPatientCameCorrectDate === false
      ) {
        adherenceScreening.value.daysWithoutMedicine = row.days;
      } else {
        adherenceScreening.value.daysWithoutMedicine = 0;
      }
      break;
    case '03':
      adherenceScreening.value.patientForgotMedicine = row.completed;
      if (
        viewLateMotives.value === false ||
        viewLateMotives.value === 'false'
      ) {
        adherenceScreening.value.lateDays = 0;
      }
      break;
    case '04':
      if (
        adherenceScreening.value.patientForgotMedicine === 'true' ||
        adherenceScreening.value.patientForgotMedicine === true
      ) {
        adherenceScreening.value.lateDays = row.days;
      } else {
        adherenceScreening.value.lateDays = 0;
      }
      break;
    case '05':
      adherenceScreening.value.lateMotives = row.text;
      break;
    default:
      console.log('Sorry, we are out of .');
  }
};
const addingValueToArray = () => {
  if (selectedAdherenceTracing.value) {
    monithoringQuestions.value.forEach((monithoringQuestion) => {
      if (monithoringQuestion.code === '01')
        monithoringQuestion.completed = String(
          selectedAdherenceTracing.value.hasPatientCameCorrectDate
        );
      if (monithoringQuestion.code === '02')
        monithoringQuestion.days =
          selectedAdherenceTracing.value.daysWithoutMedicine;
      if (monithoringQuestion.code === '03')
        monithoringQuestion.completed = String(
          selectedAdherenceTracing.value.patientForgotMedicine
        );
      if (monithoringQuestion.code === '04')
        monithoringQuestion.days = selectedAdherenceTracing.value.lateDays;
      if (monithoringQuestion.code === '05')
        monithoringQuestion.text = selectedAdherenceTracing.value.lateMotives;
    });
    if (!selectedAdherenceTracing.value.hasPatientCameCorrectDate) {
      viewLateDaysWithout.value = true;
    }
    if (selectedAdherenceTracing.value.patientForgotMedicine) {
      viewLateMotives.value = true;
    }
  }
};
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: primary

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 0px
</style>
