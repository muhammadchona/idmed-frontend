<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Tipo de Identificador
    </div>
    <div class="">
      <q-table :rows="identifierTypes" :columns="columns" :filter="filter">
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
            <q-td key="code" :props="props">
              {{ props.row.code }}
            </q-td>
            <q-td key="description" :props="props">
              {{ props.row.description }}
            </q-td>
            <q-td key="pattern" :props="props">
              {{ props.row.pattern }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  color="amber-8"
                  icon="edit"
                  @click="editIdentifierType(props.row)"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="showIdentifierType(props.row)"
                >
                  <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
    <div class="absolute-bottomg">
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          size="xl"
          fab
          icon="add"
          @click="addIdentifierType"
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showAddEditIdentifierType">
      <AddEditIdentifierType @close="showAddEditIdentifierType = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

/*Components Import*/
import AddEditIdentifierType from 'src/components/Settings/IdentifierType/IdentifierType.vue';

/*Declarations*/
const { alertWarningAction } = useSwal();
const columns = [
  {
    name: 'code',
    required: true,
    label: 'Código',
    align: 'left',
    field: (row) => row.code,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'description',
    required: true,
    label: 'Descrição',
    align: 'left',
    field: (row) => row.description,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'pattern',
    required: true,
    label: 'Padrão',
    align: 'left',
    field: (row) => row.pattern,
    format: (val) => `${val}`,
    sortable: true,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const showAddEditIdentifierType = ref(false);
const identifierType = reactive(ref(identifierTypeService.newInstanceEntity()));
const filter = ref('');

/*injects*/
const step = inject('step');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const identifierTypes = computed(() => {
  return identifierTypeService.getAllIdentifierTypes();
});

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});

/*Provides*/
provide('selectedIdentifierType', identifierType);
provide('stepp', step);
provide('showAddEditIdentifierType', showAddEditIdentifierType);
provide('identifierTypes', identifierTypes);
provide('identifierTypeParam', identifierType.value);

/*Methods*/
const getIconActive = (clinicSector) => {
  if (clinicSector.active) {
    return 'stop_circle';
  } else if (!clinicSector.active) {
    return 'play_circle';
  }
};
const getColorActive = (clinicSector) => {
  if (clinicSector.active) {
    return 'red';
  } else if (!clinicSector.active) {
    return 'green';
  }
};
const getTooltipClass = (clinicSector) => {
  if (clinicSector.active) {
    return 'bg-red-5';
  } else if (!clinicSector.active) {
    return 'bg-green-5';
  }
};

const showIdentifierType = (identifierTypeParam) => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCreateStep.value = false;
  isEditStep.value = false;
  identifierType.value = identifierTypeParam;
  step.value = 'display';
  viewMode.value = true;
  editMode.value = false;
  showAddEditIdentifierType.value = true;
};

const editIdentifierType = (identifierTypeParam) => {
  isCreateStep.value = false;
  isEditStep.value = true;
  isCreateStep.value = false;
  isEditStep.value = true;
  identifierType.value = identifierTypeParam;
  step.value = 'edit';
  showAddEditIdentifierType.value = true;
  editMode.value = true;
  viewMode.value = false;
};

const addIdentifierType = () => {
  isCreateStep.value = true;
  isEditStep.value = false;
  isCreateStep.value = true;
  isEditStep.value = false;
  step.value = 'create';
  identifierType.value = reactive(
    ref(identifierTypeService.newInstanceEntity())
  );
  showAddEditIdentifierType.value = true;
  editMode.value = false;
  viewMode.value = false;
};
</script>
