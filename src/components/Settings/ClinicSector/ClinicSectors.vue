<template>
  <div>
    <div class="q-mb-md text-weight-bold text-subtitle1">
      <q-bar style="background-color: #9e9e9e2e">
        <div class="cursor-pointer non-selectable">Sector Clínico</div>
      </q-bar>
      <q-separator class="q-my-md max-width" color="primary" ></q-separator>
    </div>
    <div class="">
      <q-table
        :loading="loading"
        :rows="clinicSectors"
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
              @click="addClinicSectorr()"
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
            <q-td key="active" :props="props">
              {{ props.row.active ? "Sim" : "Nao" }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  color="amber-8"
                  icon="edit"
                  v-if="props.row.active === true"
                  @click="editClinicSector(props.row)"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeClinicSector(props.row)"
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
                    props.row.active ? "Inactivar" : "Activar"
                  }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <div class="absolute-bottom" v-if="website">
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-btn size="xl" fab icon="add" @click="addClinicSectorr()" color="primary" />
        </q-page-sticky>
      </div>
    </div>

    <q-dialog persistent v-model="showClinicSectorRegistrationScreen">
      <addClinicSector @close="showClinicSectorRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*imports*/
import { ref, inject, provide, onMounted, computed } from 'vue';
import ClinicSector from '../../../stores/models/clinicSector/ClinicSector';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import addClinicSector from 'src/components/Settings/ClinicSector/AddClinicSector.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

/*Declarations*/
const { website } = useSystemUtils();
const { alertWarningAction, alertSucess, alertError } = useSwal();
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
    label: 'Nome',
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
const showClinicSectorRegistrationScreen = ref(false);
const isNewClinicSector = ref(false);
const loading = ref(true);

const filter = ref('');
const clinicSector = ref(clinicSectorService.newInstanceEntity());

/*injects*/
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const currClinic = inject('currClinic');

/*Hooks*/
const clinicSectors = computed(() => {
  const clinicSecs = ref(null);
  clinicSecs.value = clinicSectorService.getAllClinicSectors();
  if (clinicSecs.value && clinicSecs.value.length >= 0) stopLoading();
  return clinicSecs.value;
});

const stopLoading = () => {
  loading.value = false;
};

onMounted(() => {
  editMode.value = false;
  viewMode.value = false;
});

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
const editClinicSector = (clinicSectorParam) => {
  isNewClinicSector.value = false;
  clinicSector.value = clinicSectorParam;
  showClinicSectorRegistrationScreen.value = true;
  editMode.value = true;
  viewMode.value = false;
};
const addClinicSectorr = () => {
  isNewClinicSector.value = true;
  clinicSector.value = new ClinicSector();
  clinicSector.value.clinic = currClinic.value;
  showClinicSectorRegistrationScreen.value = true;
  editMode.value = false;
  viewMode.value = false;
};
const visualizeClinicSector = (clinicSectorParam) => {
  isNewClinicSector.value = false;
  clinicSector.value = clinicSectorParam;
  viewMode.value = true;
  showClinicSectorRegistrationScreen.value = true;
  editMode.value = false;
};
const promptToConfirm = (clinicSectorParam) => {
  const question = clinicSectorParam.active
    ? 'Deseja Inactivar o Sector Clínico?'
    : 'Deseja Activar o Sector Clínico?';
  alertWarningAction(question).then((response) => {
    if (response) {
      if (clinicSectorParam.active) {
        clinicSectorParam.active = false;
      } else {
        clinicSectorParam.active = true;
      }
      clinicSectorService
        .patch(clinicSectorParam.id, clinicSectorParam)
        .then(() => {
          alertSucess('Sector Clínico actualizado com sucesso.');
        })
        .catch(() => {
          alertError('Aconteceu um erro inesperado ao actualizar o Sector Clínico.');
        });
      // }
    }
  });
};

/*provides*/
provide('selectedClinicSector', clinicSector);
provide('showClinicSectorRegistrationScreen', showClinicSectorRegistrationScreen);
provide('isNewClinicSector', isNewClinicSector);
</script>
