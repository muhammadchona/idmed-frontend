<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Regime Terapêutico
    </div>
    <div class="">
      <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->
      <q-table
        :rows="therapeuticRegimens"
        :columns="columns"
        :filter="filter"
        row-key="regimenScheme"
      >
        <template v-slot:no-data="{ icon, filter }">
          <div
            class="full-width row flex-center text-primary q-gutter-sm text-body2"
          >
            <span> Sem resultados para visualizar </span>
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
          </div>
        </template>
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Procurar"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td key="regimenScheme" :props="props">
              {{ props.row.regimenScheme }}
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>
            <q-td key="active" :props="props">
              {{ props.row.active ? 'Sim' : 'Nao' }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <!-- <q-btn flat round
                    color="amber-8"
                    icon="edit"
                    v-if="props.row.active === true"
                   @click="editTherapeuticRegimen(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn> -->
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeTherapeuticRegimen(props.row)"
                >
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  :color="getColorActive(props.row)"
                  :icon="getIconActive(props.row)"
                  @click.stop="promptToConfirm(props.row)"
                >
                  <q-tooltip :class="getTooltipClass(props.row)">{{
                    props.row.active ? 'Inactivar' : 'Activar'
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="absolute-bottomg">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <!-- <q-btn size="xl" fab icon="add" @click="addTherapeuticRegimen" color="primary" /> -->
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showTherapeuticRegimenRegistrationScreen">
      <AddTherapeuticRegimen
        @close="showTherapeuticRegimenRegistrationScreen = false"
      />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService.ts';
import formService from 'src/services/api/formService/formService.ts';
import clinicalService from 'src/services/api/clinicalServiceService/clinicalServiceService.ts';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import drugService from 'src/services/api/drugService/drugService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

/*Components import*/
import AddTherapeuticRegimen from 'src/components/Settings/TherapeuticRegimen/AddTherapeuticRegimen.vue';

/*Declarations*/
const { alertWarningAction } = useSwal();
const columns = [
  {
    name: 'regimenScheme',
    required: true,
    label: 'Esquema do Regime',
    align: 'left',
    field: (row) => row.regimenScheme,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'description',
    required: true,
    label: 'Descricao',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'active',
    required: true,
    label: 'Activo',
    align: 'left',
    field: (row) => row.active,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const filter = ref('');
const showTherapeuticRegimenRegistrationScreen = ref(false);
const therapeuticRegimen = reactive(
  ref(therapeuticalRegimenService.newInstanceEntity())
);

/*injects*/
const step = inject('step');
const clinic = inject('clinic');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const therapeuticRegimens = computed(() => {
  return therapeuticalRegimenService.getAllTherapeuticalRegimens();
});

const forms = computed(() => {
  return formService.getAllForms();
});

const drugs = computed(() => {
  return drugService.getAllDrugs();
});

/*Provides*/
provide('forms', forms);
provide('drugs', drugs);
provide('selectedTherapeuticRegimen', therapeuticRegimen);
provide('therapeuticRegimens', therapeuticRegimens);

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});

/*methods*/
const getIconActive = (therapeuticRegimen) => {
  if (therapeuticRegimen.active) {
    return 'stop_circle';
  } else if (!therapeuticRegimen.active) {
    return 'play_circle';
  }
};
const getColorActive = (therapeuticRegimen) => {
  if (therapeuticRegimen.active) {
    return 'red';
  } else if (!therapeuticRegimen.active) {
    return 'green';
  }
};
const getTooltipClass = (therapeuticRegimen) => {
  if (therapeuticRegimen.active) {
    return 'bg-red-5';
  } else if (!therapeuticRegimen.active) {
    return 'bg-green-5';
  }
};
// editTherapeuticRegimen(therapeuticRegimen) {
//   this.viewMode = false;
//   this.therapeuticRegimen = Object.assign({}, therapeuticRegimen);
//   this.showTherapeuticRegimenRegistrationScreen = true;
// },
// addTherapeuticRegimen() {
//   this.viewMode = false;
//   this.therapeuticRegimen = new TherapeuticRegimen();
//   this.showTherapeuticRegimenRegistrationScreen = true;
// },
const visualizeTherapeuticRegimen = (therapeuticRegimenParam) => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCreateStep.value = false;
  isEditStep.value = false;
  therapeuticRegimen.value = therapeuticRegimenParam;
  viewMode.value = true;
  showTherapeuticRegimenRegistrationScreen.value = true;
  editMode.value = false;
};

const promptToConfirm = (therapeuticRegimenParam) => {
  const question = therapeuticRegimenParam.active
    ? 'Deseja Inactivar o Regime?'
    : 'Deseja Activar o Regime?';
  alertWarningAction(question).then((response) => {
    if (response) {
      if (therapeuticRegimenParam.active) {
        therapeuticRegimenParam.active = false;
      } else {
        therapeuticRegimenParam.active = true;
      }
      // if (this.mobile) {
      //   if (therapeuticRegimenParam.syncStatus !== 'R') therapeuticRegimenParam.syncStatus = 'U';
      //   ClinicSector.localDbAdd(JSON.parse(JSON.stringify(therapeuticRegimenParam)));
      //   ClinicSector.insertOrUpdate({ data: therapeuticRegimenParam });
      //   this.displayAlert('info', 'Sector Clinico actualizado com sucesso');
      // } else {
      therapeuticalRegimenService
        .patch(therapeuticRegimenParam.id, therapeuticRegimenParam)
        .then((resp) => {
          //
        })
        .catch((error) => {
          //
        });
      // }
    }
  });
};
</script>
