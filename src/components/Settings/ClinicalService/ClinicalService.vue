<template>
  <div>
    <div class="q-mb-md text-weight-bold text-subtitle1">
      <q-bar style="background-color: #9e9e9e2e">
        <div class="cursor-pointer non-selectable">Serviço Clínico</div>
      </q-bar>
      <q-separator class="q-my-md max-width" color="primary"></q-separator>
    </div>
    <div class="">
      <q-table
        :loading="loading"
        :rows="clinicalServices"
        :columns="columns"
        :filter="filter"
      >
        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
        <template v-slot:top-right>
          <div class="row q-gutter-sm">
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
            <q-btn
              color="primary"
              icon-right="refresh"
              label="Actualizar Lista"
              @click="getClinicalServicesFromProvincialServer"
              no-caps
            />
          </div>
          <div class="q-pa-md q-gutter-sm">
            <q-btn
              v-if="!website"
              color="primary"
              label="Adicionar Novo"
              no-caps
              outline
              rounded
              @click="addClinicService()"
            />
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
              {{ props.row.active ? 'Sim' : 'Nao' }}
            </q-td>
            <q-td key="options" :props="props">
              <div class="col">
                <q-btn
                  flat
                  round
                  color="amber-8"
                  icon="edit"
                  v-if="props.row.active === true"
                  @click="editClinicService(props.row)"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeClinicalService(props.row)"
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
    <div class="absolute-bottom">
      <q-page-sticky
        v-if="website && isProvincialInstalation()"
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          size="xl"
          fab
          icon="add"
          @click="addClinicService"
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showClinicServiceRegistrationScreen">
      <addClinicalService />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { ref, inject, onMounted, computed, provide, reactive } from 'vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService.ts';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService.ts';
import clinicalServiceAttrTypeService from 'src/services/api/clinicalServiceAttrTypeService/ClinicalServiceAttrTypeService.ts';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService.ts';

import addClinicalService from 'src/components/Settings/ClinicalService/AddClinicalService.vue';
import ClinicalService from 'src/stores/models/ClinicalService/ClinicalService';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

/*Declarations*/
const { alertWarningAction, alertError, alertSucess } = useSwal();
const { closeLoading, showloading } = useLoading();
const { isProvincialInstalation } = useSystemConfig();
const { website } = useSystemUtils();
const loading = ref(true);
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
const showClinicServiceRegistrationScreen = ref(false);
const filter = ref('');
const clinicalService = reactive(ref(new ClinicalService()));
const clinicalServiceAttributeTypesObjectList = reactive(ref([]));
const isNewClinicalService = ref(false);
const loadingStep = ref(false);

/*injects*/
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');

/*Hooks*/
const clinicalServices = computed(() => {
  const clinicalServicesRes = ref(null);
  clinicalServicesRes.value = clinicalServiceService.getAllClinicalServices();
  if (clinicalServicesRes.value && clinicalServicesRes.value.length >= 0)
    stopLoading();
  return clinicalServicesRes.value;
});

const stopLoading = () => {
  loading.value = false;
};

onMounted(() => {
  editMode.value = false;
  viewMode.value = false;
});

/*methods*/
const getIconActive = (clinicalService) => {
  if (clinicalService.active) {
    return 'stop_circle';
  } else if (!clinicalService.active) {
    return 'play_circle';
  }
};
const getColorActive = (clinicalService) => {
  if (clinicalService.active) {
    return 'red';
  } else if (!clinicalService.active) {
    return 'green';
  }
};
const getTooltipClass = (clinicalService) => {
  if (clinicalService.active) {
    return 'bg-red-5';
  } else if (!clinicalService.active) {
    return 'bg-green-5';
  }
};
const visualizeClinicalService = (clinicalServiceParam) => {
  showClinicServiceRegistrationScreen.value = true;
  clinicalService.value = clinicalServiceParam;
  isNewClinicalService.value = false;
  editMode.value = false;
  viewMode.value = true;
};
const editClinicService = (clinicalServiceParam) => {
  showClinicServiceRegistrationScreen.value = true;
  clinicalService.value = clinicalServiceParam;
  isNewClinicalService.value = false;
  editMode.value = true;
  viewMode.value = false;
};
const addClinicService = () => {
  showClinicServiceRegistrationScreen.value = true;
  clinicalService.value = new ClinicalService();
  isNewClinicalService.value = true;
  editMode.value = false;
  viewMode.value = false;
};
const close = () => {
  showClinicServiceRegistrationScreen.value = false;
  isNewClinicalService.value = false;
  editMode.value = false;
  viewMode.value = false;
  loadingStep.value = false;
  closeLoading();
};

/*methods*/
const submitClinicalService = () => {
  showloading();
  loadingStep.value = true;
  clinicalService.value.active = true;
  clinicalService.value.drugs = [];
  clinicalService.value.clinicSectors.forEach((clinicSector) => {
    clinicSector.clinicSectorType = {};
    clinicSector.clinicSectorType.id = clinicSector.clinic_sector_type_id;
  });

  if (isNewClinicalService.value) {
    clinicalServiceService
      .post(clinicalService.value)
      .then(() => {
        closeLoading();
        alertSucess('Serviço Clínico adicionado com sucesso.');
        close();
      })
      .catch((error) => {
        closeLoading();
        console.log(error);
        alertError('Aconteceu um erro ao gravar o Serviço Clínico');
        close();
      });
  } else {
    clinicalServiceService
      .patch(clinicalService.value.id, clinicalService.value)
      .then(() => {
        closeLoading();
        alertSucess('Serviço Clínico actualizado com sucesso.');
        close();
      })
      .catch((error) => {
        closeLoading();
        console.log(error);
        alertError('Aconteceu um erro ao actualizar o Serviço Clínico');
        close();
      });
  }
};

// Computed
const clinicalServiceAttributeTypes = computed(() => {
  return clinicalServiceAttrTypeService.getAllClinicalServiceAttrTypes();
});
const therapeuticRegimens = computed(() => {
  return therapeuticalRegimenService.getActiveTherapeuticalRegimens();
});
const clinicSectors = computed(() => {
  return clinicSectorService.getActivebyClinicId(currClinic.value.id);
});
const identifierTypes = computed(() => {
  return identifierTypeService.getAllIdentifierTypes();
});
const promptToConfirm = (clinicalServiceParam) => {
  const question = clinicalServiceParam.active
    ? 'Deseja Inactivar o Serviço Clínico?'
    : 'Deseja Activar o Serviço Clínico?';

  alertWarningAction(question).then((response) => {
    if (response) {
      if (clinicalServiceParam.active) {
        clinicalServiceParam.active = false;
      } else {
        clinicalServiceParam.active = true;
      }
      clinicalServiceService
        .patch(clinicalServiceParam.id, clinicalServiceParam)
        .then(() => {
          alertSucess('Serviço Clínico actualizado com sucesso.');
        })
        .catch(() => {
          alertError(
            'Aconteceu um erro inesperado ao actualizar o Serviço Clínico.'
          );
        });
      // }
    }
  });
};

const getClinicalServicesFromProvincialServer = () => {
  showloading();
  clinicalServiceService
    .getFromProvincial(0)
    .then(() => {
      console.log('Inicio actualizacao da lista de Servicos');
    })
    .catch((error) => {
      closeLoading();
      alertError('Erro na comunicação com o Servidor Central.');
      console.log('Erro', error);
    });
};
/*Provides*/

provide('clinicalService', clinicalService);
provide(
  'clinicalServiceAttributeTypesObjectList',
  clinicalServiceAttributeTypesObjectList
);
provide(
  'showClinicServiceRegistrationScreen',
  showClinicServiceRegistrationScreen
);
provide('clinicalServiceAttributeTypes', clinicalServiceAttributeTypes);
provide('therapeuticRegimens', therapeuticRegimens);
provide('clinicSectors', clinicSectors);
provide('identifierTypes', identifierTypes);
provide('isNewClinicalService', isNewClinicalService);
provide('close', close);
provide('submitClinicalService', submitClinicalService);
provide('loadingStep', loadingStep);
</script>
