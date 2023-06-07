<template>
  <div>
    <div class="">
      <!-- <nationalClinicsTable  :rows="getNationalClinicos" :columns="columns"  :showNationalClinicRegistrationScreen="showNationalClinicRegistrationScreen" /> -->
      <div class="row q-py-lg q-mt-md text-weight-bold text-subtitle1">
        Clínicos
      </div>
      <q-table
        :rows="doctors"
        :columns="columns"
        :filter="filter"
        virtual-scroll
      >
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
        <q-btn size="xl" fab icon="add" @click="addDoctor()" color="primary" />
      </q-page-sticky>
    </div>
    <q-dialog persistent v-model="showDoctorRegistrationScreen">
      <addDoctorComp @close="showDoctorRegistrationScreen = false" />
    </q-dialog>
    <!-- <q-dialog v-model="alert.visible">
      <Dialog :type="alert.type" @closeDialog="closeDialog">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog> -->
  </div>
</template>
<script setup>
/*Imports*/
import { useQuasar } from 'quasar';
import Doctor from '../../../stores/models/doctor/Doctor';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, inject, provide, onMounted, computed, reactive } from 'vue';
import doctorService from 'src/services/api/doctorService/doctorService.ts';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();

/*Components Import*/
import addDoctorComp from 'src/components/Settings/Doctor/AddDoctor.vue';

/*Declarations*/
const { alertWarningAction } = useSwal();

const showDoctorRegistrationScreen = ref(false);
const doctor = reactive(ref(doctorService.newInstanceEntity()));
const filter = ref('');
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

/*Hooks*/
const doctors = computed(() => {
  return doctorService.getAlldoctors();
});

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
  doctor.value = reactive(ref(doctorService.newInstanceEntity()));
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
      // if (this.mobile) {
      //   if (doctorParam.syncStatus !== 'R') doctorParam.syncStatus = 'U';
      //   ClinicSector.localDbAdd(JSON.parse(JSON.stringify(doctorParam)));
      //   ClinicSector.insertOrUpdate({ data: doctorParam });
      //   this.displayAlert('info', 'Sector Clinico actualizado com sucesso');
      // } else {
      doctorService
        .patch(doctorParam.id, doctorParam)
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
