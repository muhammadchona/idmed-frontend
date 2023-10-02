<template>
  <div>
    <div class="q-mb-md text-weight-bold text-subtitle1">
      <q-bar style="background-color: #9e9e9e2e">
        <div class="cursor-pointer non-selectable">Tipo de Identificador</div>
      </q-bar>
      <q-separator class="q-my-md max-width" color="primary" ></q-separator>
    </div>
    <div class="">
      <q-table
        :loading="loading"
        :rows="identifierTypes"
        :columns="columns"
        :filter="filter"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Procurar">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <div class="q-pa-md q-gutter-sm">
            <q-btn
              v-if="!website"
              color="primary"
              label="Adicionar Novo"
              no-caps
              outline
              rounded
              @click="addIdentifierType()"
            />
          </div>
        </template>
        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
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
    <div class="absolute-bottom">
      <q-page-sticky v-if="website" position="bottom-right" :offset="[18, 18]">
        <q-btn size="xl" fab icon="add" @click="addIdentifierType" color="primary" />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showAddEditIdentifierType">
      <AddEditIdentifierType @close="showAddEditIdentifierType = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { ref, inject, provide, onMounted, computed } from 'vue';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService.ts';
import AddEditIdentifierType from 'src/components/Settings/IdentifierType/IdentifierType.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

/*Declarations*/
const { website } = useSystemUtils();
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
const identifierType = ref(identifierTypeService.newInstanceEntity());
const filter = ref('');
const loading = ref(true);

/*injects*/
const step = inject('step');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const identifierTypes = computed(() => {
  const identifierTypes = ref(null);
  identifierTypes.value = identifierTypeService.getAllIdentifierTypes();
  if (identifierTypes.value && identifierTypes.value.length >= 0) stopLoading();
  return identifierTypes.value;
});

const stopLoading = () => {
  loading.value = false;
};

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
  identifierType.value = ref(identifierTypeService.newInstanceEntity());

  showAddEditIdentifierType.value = true;
  editMode.value = false;
  viewMode.value = false;
};
</script>
