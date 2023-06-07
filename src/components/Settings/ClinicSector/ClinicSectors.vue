<template>
  <div>
    <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
      Sector Clínico
    </div>
    <div class="">
      <q-table :rows="clinicSectors" :columns="columns" :filter="filter">
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
        <q-btn
          size="xl"
          fab
          icon="add"
          @click="addClinicSectorr()"
          color="primary"
        />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showClinicSectorRegistrationScreen">
      <addClinicSector @close="showClinicSectorRegistrationScreen = false" />
    </q-dialog>

    <!--
    <q-dialog v-model="alert.visible">
      <Dialog :type="alert.type" @closeDialog="closeDialog">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog> -->
  </div>
</template>
<script setup>
/*imports*/
import { useQuasar } from 'quasar';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import ClinicSector from '../../../stores/models/clinicSector/ClinicSector';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService.ts';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

/*components import*/
import addClinicSector from 'src/components/Settings/ClinicSector/AddClinicSector.vue';
// import Dialog from 'src/components/Shared/Dialog/Dialog.vue';

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
const filter = ref('');
const clinicSector = reactive(ref(clinicSectorService.newInstanceEntity()));

/*injects*/
const step = inject('step');
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');

/*Hooks*/
const clinicSectors = computed(() => {
  return clinicSectorService.getAllClinicSectors();
});

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});

/*provides*/
provide('selectedClinicSector', clinicSector);
provide(
  'showClinicSectorRegistrationScreen',
  showClinicSectorRegistrationScreen
);
provide('stepp', step);

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
  isCreateStep.value = false;
  isEditStep.value = true;
  clinicSector.value = clinicSectorParam;
  step.value = 'edit';
  showClinicSectorRegistrationScreen.value = true;
  editMode.value = true;
  viewMode.value = false;
};
const addClinicSectorr = () => {
  isEditStep.value = false;
  isCreateStep.value = true;
  clinicSector.value = new ClinicSector();
  clinicSector.value.clinic = currClinic.value;
  step.value = 'create';
  showClinicSectorRegistrationScreen.value = true;
  editMode.value = false;
  viewMode.value = false;
};
const visualizeClinicSector = (clinicSectorParam) => {
  isCreateStep.value = false;
  isEditStep.value = false;
  clinicSector.value = clinicSectorParam;
  viewMode.value = true;
  showClinicSectorRegistrationScreen.value = true;
  editMode.value = false;
};
const promptToConfirm = (clinicSectorParam) => {
  const question = clinicSectorParam.active
    ? 'Deseja Inactivar o Sector Clinico?'
    : 'Deseja Activar o Sector Clinico?';
  alertWarningAction(question).then((response) => {
    if (response) {
      if (clinicSectorParam.active) {
        clinicSectorParam.active = false;
      } else {
        clinicSectorParam.active = true;
      }
      // if (this.mobile) {
      //   console.log('FrontEnd');
      //   if (clinicSectorParam.syncStatus !== 'R') clinicSectorParam.syncStatus = 'U';
      //   ClinicSector.localDbAdd(JSON.parse(JSON.stringify(clinicSectorParam)));
      //   ClinicSector.insertOrUpdate({ data: clinicSectorParam });
      //   this.displayAlert('info', 'Sector Clinico actualizado com sucesso');
      // } else {
      console.log('BackEnd');
      clinicSectorService
        .patch(clinicSectorParam.id, clinicSectorParam)
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
