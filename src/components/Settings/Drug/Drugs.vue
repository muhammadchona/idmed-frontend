<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Medicamentos
    </div>
    <div class="">
      <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->

      <q-table :rows="drugs" :columns="columns" :filter="filter">
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
            <q-td key="name" :props="props">
              {{ props.row.name }}
            </q-td>
            <q-td key="packSize" :props="props">
              {{ props.row.packSize }}
            </q-td>
            <q-td key="defaultTimes" :props="props">
              {{ props.row.defaultTimes }}
            </q-td>
            <q-td key="defaultTreatment" :props="props">
              {{ props.row.defaultTreatment }}
            </q-td>
            <q-td key="defaultPeriodTreatment" :props="props">
              {{ props.row.defaultPeriodTreatment }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <!-- <q-btn flat round
                    color="amber-8"
                    icon="edit"
                    v-if="props.row.active === true"
                   @click="editDrug(props.row)">
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn> -->

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeDrug(props.row)"
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
    <!-- <div v-if="false" class="absolute-bottomg">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn size="xl" fab icon="add" @click="addDrug" color="primary" />
      </q-page-sticky>
    </div>
    -->
    <q-dialog persistent v-model="showDrugRegistrationScreen">
      <addDrug @close="showDrugRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import Drug from '../../../stores/models/drug/Drug';
import Form from '../../../stores/models/form/Form';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import drugService from 'src/services/api/drugService/drugService.ts';
import formService from 'src/services/api/formService/formService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

/*Components Import*/
import addDrug from 'src/components/Settings/Drug/AddDrug.vue';

/*Declarations*/
const { alertWarningAction } = useSwal();
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'packSize',
    required: true,
    label: 'Tamanho do Pacote',
    align: 'left',
    field: (row) => row.packSize,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'defaultTimes',
    required: true,
    label: 'Numero de toma',
    align: 'left',
    field: (row) => row.defaultTimes,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'defaultTreatment',
    required: true,
    label: 'Numero de Vezes a Tomar',
    align: 'left',
    field: (row) => row.defaultTreatment,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'defaultPeriodTreatment',
    required: true,
    label: 'Periodo a Tomar',
    align: 'left',
    field: (row) => (row) => row.defaultPeriodTreatment,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const showDrugRegistrationScreen = ref(false);
const drug = reactive(ref(drugService.newInstanceEntity()));
const filter = ref('');

/*injects*/
const step = inject('step');
const clinic = inject('clinic');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const forms = computed(() => {
  return formService.getAllForms();
});

const drugs = computed(() => {
  return drugService.getAllDrugs();
});

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});

/*Provides*/
provide('selectedDrug', drug);
provide('forms', forms);
provide('drugs', drugs);

/*Methods*/
const getIconActive = (drug) => {
  if (drug.active) {
    return 'stop_circle';
  } else if (!drug.active) {
    return 'play_circle';
  }
};
const getColorActive = (drug) => {
  if (drug.active) {
    return 'red';
  } else if (!drug.active) {
    return 'green';
  }
};
const getTooltipClass = (drug) => {
  if (drug.active) {
    return 'bg-red-5';
  } else if (!drug.active) {
    return 'bg-green-5';
  }
};
const visualizeDrug = (drugParam) => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCreateStep.value = false;
  isEditStep.value = false;
  drug.value = drugParam;
  viewMode.value = true;
  showDrugRegistrationScreen.value = true;
  editMode.value = false;
};
const promptToConfirm = (drugParam) => {
  const question = drugParam.active
    ? 'Deseja Inactivar o medicamento?'
    : 'Deseja Activar o medicamento?';
  alertWarningAction(question).then((response) => {
    if (response) {
      if (drugParam.active) {
        drugParam.active = false;
      } else {
        drugParam.active = true;
      }
      // if (this.mobile) {
      //             if (drug.syncStatus !== 'R') drug.syncStatus = 'U';
      //             Drug.localDbAdd(JSON.parse(JSON.stringify(drug)));
      //             Drug.insertOrUpdate({ data: drug });
      //             this.displayAlert('info', msg);
      //           } else {
      drugService
        .patch(drugParam.id, drugParam)
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
