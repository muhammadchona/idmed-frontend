<template>
  <div>
    <div class="">
      <div class="q-mb-md text-weight-bold text-subtitle1">
        <q-bar style="background-color: #9e9e9e2e">
          <div class="cursor-pointer non-selectable">Clínicos</div>
        </q-bar>
        <q-separator class="q-my-md max-width" color="primary" ></q-separator>
      </div>
      <q-table
        :rows="doctors"
        :columns="columns"
        :loading="loadingOnTable"
        :filter="filter"
        virtual-scroll
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
              @click="addDoctor()"
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
            <q-td key="firstnames" :props="props">
              {{ props.row.firstnames }}
            </q-td>
            <q-td key="lastname" :props="props">
              {{ props.row.lastname }}
            </q-td>
            <q-td key="telephone" :props="props">
              {{ props.row.telephone }}
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
                  @click="editDoctor(props.row)"
                >
                  <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  class="q-ml-md"
                  color="green-8"
                  icon="search"
                  @click="visualizeDoctor(props.row)"
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
    </div>
    <div class="absolute-bottom">
      <q-page-sticky v-if="website" position="bottom-right" :offset="[18, 18]">
        <q-btn size="xl" fab icon="add" @click="addDoctor()" color="primary" />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showDoctorRegistrationScreen">
      <addDoctorComp @close="showDoctorRegistrationScreen = false" />
    </q-dialog>
  </div>
</template>
<script setup>
/*Imports*/
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, provide, onMounted, computed } from 'vue';
import doctorService from 'src/services/api/doctorService/doctorService.ts';
import addDoctorComp from 'src/components/Settings/Doctor/AddDoctor.vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

/*Declarations*/
const { alertWarningAction, alertError, alertSucess } = useSwal();
const { website } = useSystemUtils();
const showDoctorRegistrationScreen = ref(false);
const doctor = ref(doctorService.newInstanceEntity());
const filter = ref('');
// const loading = ref(true);
const columns = [
  {
    name: 'firstnames',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.firstnames,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'lastname',
    required: true,
    label: 'Apelido',
    align: 'left',
    field: (row) => row.lastname,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'telephone',
    required: true,
    label: 'Telefone',
    align: 'left',
    field: (row) => row.telephone,
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

/*injects*/
const step = inject('step');
const editMode = inject('editMode');
const viewMode = inject('viewMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const loadingOnTable = ref(true);

/*Hooks*/
const doctors = computed(() => {
  const doctorsRes = ref(null);
  doctorsRes.value = doctorService.getAlldoctors();
  if (doctorsRes.value && doctorsRes.value.length >= 0) stopLoading();

  return doctorsRes.value;
});

const stopLoading = () => {
  loadingOnTable.value = false;
};

onMounted(() => {
  isEditStep.value = false;
  isCreateStep.value = false;
  step.value = '';
  editMode.value = false;
  viewMode.value = false;
});

/*provides*/
provide('selectedDoctor', doctor);
provide('showDoctorRegistrationScreen', showDoctorRegistrationScreen);
provide('stepp', step);

/*Methods*/
const getIconActive = (doctor) => {
  if (doctor.active) {
    return 'stop_circle';
  } else if (!doctor.active) {
    return 'play_circle';
  }
};
const getColorActive = (doctor) => {
  if (doctor.active) {
    return 'red';
  } else if (!doctor.active) {
    return 'green';
  }
};
const getTooltipClass = (doctor) => {
  if (doctor.active) {
    return 'bg-red-5';
  } else if (!doctor.active) {
    return 'bg-green-5';
  }
};
const editDoctor = (doctorParam) => {
  isCreateStep.value = false;
  isEditStep.value = true;
  doctor.value = doctorParam;
  doctor.value.clinic = currClinic.value;
  step.value = 'edit';
  editMode.value = true;
  viewMode.value = false;
  showDoctorRegistrationScreen.value = true;
};
const addDoctor = () => {
  isEditStep.value = false;
  isCreateStep.value = true;
  doctor.value = ref(doctorService.newInstanceEntity());
  doctor.value.clinic = currClinic.value;
  step.value = 'create';
  editMode.value = false;
  viewMode.value = false;
  showDoctorRegistrationScreen.value = true;
};
const visualizeDoctor = (doctorParam) => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCreateStep.value = false;
  isEditStep.value = false;
  doctor.value = doctorParam;
  viewMode.value = true;
  editMode.value = false;
  showDoctorRegistrationScreen.value = true;
};
const promptToConfirm = (doctorParam) => {
  const question = doctorParam.active
    ? 'Deseja Inactivar o Clínico?'
    : 'Deseja Activar o Clínico?';
  alertWarningAction(question).then((response) => {
    if (response) {
      if (doctorParam.active) {
        doctorParam.active = false;
      } else {
        doctorParam.active = true;
      }
      doctorService
        .patch(doctorParam.id, doctorParam)
        .then(() => {
          alertSucess('Clínico actualizado com sucesso.');
        })
        .catch(() => {
          alertError('Aconteceu um erro inesperado ao actualizar o Clínico.');
        });
    }
  });
};
</script>
