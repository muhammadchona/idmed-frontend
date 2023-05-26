<template>
  <div class="q-pa-md" style="width: 900px; max-width: 90vw">
    <q-table
      title="Reações Adversas aos Medicamentos"
      :rows="monithoringQuestions"
      :columns="columns"
      row-key="question"
      :separator="separator"
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
      virtual-scroll
      hide-bottom
      class="my-sticky-header-table"
      table-header-class="text-white"
      title-class="text-bold text-white"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="question" v-if="props.row.code !== '02'">
            {{ props.row.question }}
          </q-td>
          <q-td key="question" v-if="props.row.code === '02'">
            <q-input
              filled
              v-if="visibleReaction"
              v-model="props.row.text"
              label=" Descreva brevemente a reação?"
              @update:model-value="handleInput(props.row)"
              :disable="onlyView"
            />
          </q-td>
          <q-td key="completed" v-if="props.row.code === '01'" align="right">
            <q-radio
              v-model="props.row.completed"
              val="true"
              @update:model-value="handleInput(props.row)"
              align="right"
              :disable="onlyView"
            />
          </q-td>
          <q-td key="completed" v-if="props.row.code === '01'" align="left">
            <q-radio
              v-model="props.row.completed"
              val="false"
              @update:model-value="handleInput(props.row)"
              align="left"
              :disable="onlyView"
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

// Declaration
const columns = [
  {
    name: 'question',
    required: true,
    label: 'Perguntas de Rastreio de Reacções Adversas aos Medicamentos',
    align: 'left',
    field: (row) => row.question,
    format: (val) => `${val}`,
  },
  { name: 'sim', label: 'Sim', field: (row) => row.completed, align: 'right' },
  { name: 'nao', label: 'Não', field: (row) => row.completed, align: 'left' },
];

const monithoringQuestions = ref([
  {
    question:
      'Tem alguma reação adversa que acha que e causada pelos medicamentos ?',
    completed: false,
    code: '01',
  },
  {
    question: '',
    completed: false,
    code: '02',
    text: '',
  },
]);

// inject
const onlyView = inject('onlyView');
const rAMScreening = inject('rAMScreening');
const closeButtonActions = inject('closeButtonActions');
const showPatientVisit = inject('showPatientVisit');

onMounted(() => {
  addingValueToArray();
});

//Computed
const selectedRamTracing = computed(() => {
  if (rAMScreening !== null && rAMScreening !== undefined) {
    return rAMScreening.value;
  } else {
    return showPatientVisit.value.ramScreenings[0];
  }
});

const visibleReaction = computed(() => {
  if (rAMScreening !== null && rAMScreening !== undefined) {
    return rAMScreening.value.adverseReactionMedicine === 'true' ? true : false;
  } else {
    return selectedRamTracing.value.adverseReactionMedicine === true
      ? true
      : false;
  }
});

//Methods
const handleInput = (row) => {
  switch (row.code) {
    case '01':
      rAMScreening.value.adverseReactionMedicine = row.completed;

      if (!visibleReaction.value) {
        rAMScreening.value.adverseReaction = '';
      }
      break;
    case '02':
      rAMScreening.value.adverseReaction = row.text;
      break;
    default:
      console.log('Sorry, we are out of .');
  }
};
const addingValueToArray = () => {
  if (selectedRamTracing.value) {
    monithoringQuestions.value.forEach((monithoringQuestion) => {
      if (monithoringQuestion.code === '01') {
        monithoringQuestion.completed = String(
          selectedRamTracing.value.adverseReactionMedicine
        );
        if (selectedRamTracing.value.adverseReactionMedicine === true) {
          visibleReaction.value = true;
        } else {
          visibleReaction.value = false;
        }
      }
      if (monithoringQuestion.code === '02')
        monithoringQuestion.text = selectedRamTracing.value.adverseReaction;
    });
  }
};
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */

  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #26A69A

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
