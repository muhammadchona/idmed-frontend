<template>
  <div class="q-mt-lg">
    <TitleBar>Procurar ou adicionar Utentes/Pacientes</TitleBar>
    <div class="q-mx-xl">
      <div class="row">
        <q-space />
        <q-select
          class="col-2 q-mt-md"
          dense
          outlined
          option-label="abbreviation"
          v-model="selectedDataSources"
          :options="dataSources"
          @update:model-value="loadHISDataSource()"
          label="Fonte de dados"
        />
      </div>
      <div class="row items-center q-my-md">
        <q-icon name="person_outline" size="sm" />
        <span class="q-pl-sm text-subtitle2">Informação inicial</span>
      </div>
      <div class="row">
        <!-- <identifierInput v-model="patientId" :rules="[]" /> -->
        <!-- <nameInput
          class="q-ml-md"
          label="Nome"
          :rules="[]"
          :readonly="this.selectedDataSources.id.length > 4"
          v-model="currPatient.firstNames"
        >
          <template v-slot:append>
            <q-icon name="close" @click="text = ''" class="cursor-pointer" />
          </template>
        </nameInput> -->
        <!-- <TextField
          label="Outros Nomes"
          v-model="currPatient.middleNames"
          dense
          :rules="[]"
          :readonly="this.selectedDataSources.id.length > 4"
          class="col q-ml-md"
        /> -->
        <!-- <lastNameInput
          label="Apelido"
          :rules="[]"
          :readonly="this.selectedDataSources.id.length > 4"
          v-model="currPatient.lastNames"
          class="q-ml-md"
        /> -->
        <q-btn
          v-if="canClear"
          @click="search()"
          class="q-ml-md q-mb-xs"
          square
          color="primary"
          icon="search"
        >
          <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
        </q-btn>
        <q-btn
          v-if="canClear"
          @click="clearSearchParams"
          class="q-ml-md q-mb-xs"
          square
          color="amber"
          icon="clear"
        >
          <q-tooltip class="bg-amber-5">Limpar</q-tooltip>
        </q-btn>
      </div>
      <div class="q-mt-lg q-mb-md">
        <div class="row items-center q-mb-md">
          <q-icon name="search" size="sm" />
          <span class="q-pl-sm text-subtitle2">Resultado da Pesquisa</span>
        </div>
        <q-separator color="grey-13" size="1px" />
      </div>
      <div>
        <q-table
          class="col"
          dense
          :rows="patients"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div
              class="full-width row flex-center text-primary q-gutter-sm text-body2"
            >
              <span> Sem resultados para visualizar </span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template #body="props">
            <q-tr :props="props">
              <!--q-td key="order" :props="props">
                </q-td-->
              <q-td key="identifier" :props="props">
                {{ props.row.preferedIdentifierValue() }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.fullName }}
              </q-td>
              <q-td key="age" :props="props">
                {{
                  this.idadeCalculator(
                    this.getDDMMYYYFromJSDate(props.row.dateOfBirth)
                  )
                }}
              </q-td>
              <q-td key="gender" :props="props">
                {{ props.row.gender }}
              </q-td>
              <q-td key="options" :props="props">
                <div class="col">
                  <q-btn
                    flat
                    round
                    v-if="!(this.selectedDataSources.id.length > 4)"
                    color="amber-8"
                    icon="edit"
                    @click="editPatient(props.row)"
                  >
                    <q-tooltip class="bg-amber-5">Editar</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    v-if="!(this.selectedDataSources.id.length > 4)"
                    class="q-ml-md"
                    color="green-8"
                    icon="person_search"
                    @click="goToPatientPanel(props.row)"
                  >
                    <q-tooltip class="bg-green-5">Visualizar</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    v-if="this.selectedDataSources.id.length > 4"
                    class="q-ml-md"
                    color="green-8"
                    icon="file_download"
                    @click="saveOpenMRSPatient(props.row)"
                  >
                    <q-tooltip class="bg-green-5">Carregar</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <div class="q-mt-md"></div>
      </div>
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-btn
          class="q-mb-xl q-mr-xl"
          fab
          color="primary"
          icon="add"
          @click="createPatient()"
        />
      </q-page-sticky>
      <q-dialog persistent v-model="showPatientRegister">
        <!-- <patientRegister
          :newPatient="newPatient"
          :selectedPatient="currPatient"
          :clinic="currClinic"
          :stepp="step"
          :transferencePatientData="transferencePatientData"
          :openMrsPatient="openMrsPatient"
          @close="showPatientRegister = false" -->
        />
      </q-dialog>
      <!-- <q-dialog v-model="alert.visible">
        <Dialog :type="alert.type" @closeDialog="closeDialog">
          <template v-slot:title> Informação</template>
          <template v-slot:msg> {{ alert.msg }} </template>
        </Dialog>
      </q-dialog> -->
    </div>
  </div>
</template>

<script>
import {
  computed,
  inject,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';
// import { QSpinnerBall } from 'quasar';
// import District from 'src/store/models/district/District';
// import ClinicalService from 'src/store/models/ClinicalService/ClinicalService';
// import HealthInformationSystem from 'src/store/models/healthInformationSystem/HealthInformationSystem';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
// import Clinic from 'src/store/models/clinic/Clinic';
import Patient from 'src/stores/models/patient/Patient';
// import TransferenceService from 'src/services/Transferences/TransferenceService';
import { useLoading } from 'src/composables/shared/loading/loading';
import patientService from 'src/services/api/patientService/patientService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import districtService from 'src/services/api/districtService/districtService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import healthInformationSystemService from 'src/services/api/HealthInformationSystem/healthInformationSystemService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
// import TitleBar from 'components/Shared/TitleBar.vue';
// import patientRegister from 'components/Patient/Register/PatientRegister.vue';
// import nameInput from 'components/Patient/Inputs/PatientNameInput.vue';
// import identifierInput from 'components/Patient/Inputs/PatientIdentifierInput.vue';
// import TextField from 'components/Shared/Input/TextField.vue';
// import lastNameInput from 'components/Patient/Inputs/PatientLastNameInput.vue';
// import Dialog from 'components/Shared/Dialog/Dialog.vue';

const { alertSucess, alertError, alertWarning, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();

const searchField = ref('');
const selected = ref([]);
const showPatientRegister = ref(false);
const currPatient = inject('currPatient');
const selectedDataSources = ref({
  id: 0,
  abbreviation: 'iDMED',
});
const patients = ref([]);
const patientId = ref('');
const newPatient = ref(false);
const username = localStorage.getItem('user');
const transferencePatientData = ref([]);
const patientList = ref([]);
const openMrsPatient = ref(false);
const clinic = inject('clinic');

const columns = [
  // { name: 'order', required: true, label: 'Ordem', align: 'left', sortable: true },
  {
    name: 'identifier',
    align: 'left',
    label: 'Identificador',
    sortable: false,
  },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'age', align: 'center', label: 'Idade', sortable: false },
  { name: 'gender', align: 'left', label: 'Género', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

// Hooks
onMounted(() => {
  console.log('Paciente corrente ', currPatient);
  // init();
  saveDefaultHIS();
  healthInformationSystemService.get(0);
});

//Computed
const canClear = computed(() => {
  return (
    (currPatient.value.identifiers[0] &&
      currPatient.value.identifiers[0].value !== '') ||
    currPatient.value.firstNames !== '' ||
    currPatient.value.middleNames !== '' ||
    currPatient.value.lastNames !== ''
  );
});

// patientId: {
//       get() {
//         if (
//           this.currPatient.identifiers[0] === null ||
//           this.currPatient.identifiers[0] === undefined
//         )
//           return null;
//         return this.currPatient.identifiers[0].value;
//       },
//       set(value) {
//         this.currPatient.identifiers[0].value = value;
//       },
//     }
// clinic() {
//   if (
//     SessionStorage.getItem('currClinic') === null ||
//     SessionStorage.getItem('currClinic').id === null
//   ) {
//     const clinic = Clinic.query()
//       .with('province.*')
//       .with('facilityType.*')
//       .with('district.*')
//       .with('sectors.*')
//       .where('mainClinic', true)
//       .first();
//     SessionStorage.set('currClinic', clinic);
//     return clinic;
//   } else {
//     return new Clinic(SessionStorage.getItem('currClinic'));
//   }
// },
const dataSources = computed(() => {
  return healthInformationSystemService.getAllWithActiveAtributtes();
});

// Methods

const clearSearchParams = () => {
  currPatient.value = new patientService.newInstanceEntity();
  patients.value = [];
};

const search = () => {
  if (selectedDataSources.value.id.length > 4) {
    if (selectedDataSources.value.abbreviation.length <= 2) {
      // TransferenceService.provincialServiceSearch(
      //   this.$q,
      //   this.currPatient,
      //   this.patients,
      //   this.transferencePatientData
      // );
      console.log(transferencePatientData);
    } else {
      openMRSSerach(selectedDataSources);
    }
  } else {
    localSearch();
  }
};

const openMRSSerach = (his) => {
  showloading();
  const nid = currPatient.value.identifiers[0].value.replaceAll('/', '-');

  if (nid.length <= 0) {
    alertError(
      'Parâmetro de pesquisa',
      'Não contém nenhum parâmetro de pesquisa. Por favor, introduza um Nº de Identificador'
    );
    closeLoading();
  } else {
    currPatient.value.clinic = clinic;
    patientService.apiSearch(currPatient.value).then((resp) => {
      if (resp.response.data.length >= 1) {
        alertInfo(
          'Paciente existente',
          'Ja Existe um Paciente com o NID:[ ' +
            nid +
            ' ] no IDMED. Use A pesquisa do Idmed'
        );
        closeLoading();
      } else {
        patientService.apiSearchPatientOnOpenMRS().then((response) => {
          patients.value = [];
          closeLoading();
          if (response.response.data.results.length > 0) {
            response.response.data.results.forEach((pacienteOpenMRS) => {
              const localpatient = ref(new patientService.newInstanceEntity());
              patients.value.push(
                buildLocalPatientFromOpenMRS(localpatient, pacienteOpenMRS)
              );
            });
          } else {
            closeLoading();
            alertInfo(
              'Resultado da Pesquisa',
              'Nenhum resultado encontrado para o identificador ' + nid + ''
            );
          }
        });
      }
    });
  }
};

const buildLocalPatientFromOpenMRS = (localpatient, pacienteOpenMRS) => {
  const cellphoneObject = pacienteOpenMRS.person.attributes.find(
    (attribute) =>
      attribute.attributeType.uuid === 'e2e3fd64-1d5f-11e0-b929-000c29ad1d07'
  );
  localpatient.value.hisUuid = pacienteOpenMRS.uuid;
  localpatient.value.his =
    selectedDataSources.value.id.length > 4 ? selectedDataSources.value : null;
  localpatient.value.hisLocation = pacienteOpenMRS.identifiers[0].location.uuid;
  localpatient.value.hisLocationName =
    pacienteOpenMRS.identifiers[0].location.display;
  localpatient.value.firstNames = pacienteOpenMRS.person.names[0].givenName;
  localpatient.value.middleNames = pacienteOpenMRS.person.names[0].middleName;
  localpatient.value.lastNames = pacienteOpenMRS.person.names[0].familyName;
  localpatient.value.gender =
    pacienteOpenMRS.person.gender === 'M' ? 'Masculino' : 'Feminino';
  localpatient.value.dateOfBirth = pacienteOpenMRS.person.birthdate;
  localpatient.value.identifiers.push(
    buildPatientIdentifierFromOpenMRS(pacienteOpenMRS.identifiers[0].identifier)
  );
  localpatient.value.cellphone =
    cellphoneObject !== null && cellphoneObject !== undefined
      ? cellphoneObject.value
      : '';
  localpatient.value.address = pacienteOpenMRS.person.addresses[0].address3;
  localpatient.value.addressReference =
    pacienteOpenMRS.person.addresses[0].address1;
  localpatient.value.district = districtService.getAllDistrictByDescription(
    pacienteOpenMRS.person.addresses[0].countyDistrict
  );
  localpatient.value.province =
    localpatient.value.district !== null &&
    localpatient.value.district !== undefined
      ? localpatient.value.district.province
      : null;
  // localpatient.postoAdministrativo_id = pacienteOpenMRS.person.names[0]
  // localpatient.bairro_id = pacienteOpenMRS.person.names[0]
  // localpatient.clinic_id = pacienteOpenMRS.person.names[0]
  return localpatient;
};
const buildPatientIdentifierFromOpenMRS = (identifier) => {
  const psi = ref(new PatientServiceIdentifier());
  psi.value.startDate = new Date();
  psi.value.value = identifier;
  psi.value.state = 'Activo';
  psi.value.prefered = true;
  psi.value.service = clinicalServiceService.getByIdentifierTypeCode('TARV');
  psi.value.identifierType =
    clinicalServiceService.getByIdentifierTypeCode('TARV').identifierType;
  psi.value.clinic = clinic.value;
  return psi.value;
};

const saveDefaultHIS = () => {
  const defaultHIS = {
    id: -1,
    abbreviation: 'iDMED',
    description: 'iDMED',
    active: true,
  };
  healthInformationSystemService.localSave(defaultHIS);
};

const createPatient = (patient) => {
  currPatient.value = patient;
  this.showPatientRegister = true;
  this.newPatient = true;
};

const editPatient = (patient) => {
  currPatient.value = patient;
  this.showPatientRegister = true;
  this.newPatient = false;
};
const saveOpenMRSPatient = (patient) => {
  currPatient.value = patient;
  this.showPatientRegister = true;
  this.newPatient = true;
  this.openMrsPatient = true;
};

const goToPatientPanel = (selectedPatient) => {
  setTimeout(proccedToPatientPanel(selectedPatient), 5000);
};
const proccedToPatientPanel = () => {
  this.$router.push('/patientpanel');
};
const filterPatient = (patient) => {
  console.log(patient.firstNames);
  return (
    hasIdentifierLike(patient, this.currPatient) ||
    stringContains(patient.firstNames, this.currPatient.firstNames) ||
    stringContains(patient.middleNames, this.currPatient.middleNames) ||
    stringContains(patient.lastNames, this.currPatient.lastNames)
  );
};
const hasIdentifierLike = (patientToCheck, inputPatient) => {
  if (patientToCheck.identifiers.length <= 0) return false;

  const match = patientToCheck.identifiers.some((identifier) => {
    return stringContains(
      identifier.value,
      currPatient.value.identifiers[0].value
    );
  });
  return match;
};
const stringContains = (stringToCheck, stringText) => {
  if (
    stringToCheck === '' ||
    stringToCheck === null ||
    stringToCheck === undefined
  )
    return false;
  if (stringText === '' || stringText === null || stringText === undefined)
    return false;
  return stringToCheck.toLowerCase().includes(stringText.toLowerCase());
};

const loadHISDataSource = () => {
  this.patients = [];
  showloading();
  // this.$q.loading.show({
  //   message: 'Carregando ...',
  //   spinnerColor: 'grey-4',
  //   spinner: QSpinnerBall,
  // });
  if (selectedDataSources.value.id.length > 4) {
    if (selectedDataSources.value.abbreviation.length <= 2) {
      // TransferenceService.checkProvincialServer(this.$q);
    } else {
      checkOpenMRS(selectedDataSources.value);
    }
  } else {
    alertSucess(
      'Pesquisa iDMED',
      'Pesquisa de Pacientes no iDMED em funcionamento'
    );
    // this.$q.notify({
    //   color: 'positive',
    //   position: 'center',
    //   message: 'Pesquisa de Pacientes no iDMED em funcionamento!!',
    //   icon: 'verified_user',
    // });
    setTimeout(() => {
      closeLoading();
    }, 400);
  }
};

const localSearch = () => {
  showloading();
  if (website) {
    console.log('Performing website search');
    // Patient.apiSearch(this.currPatient).then((resp) => {
    //   // this.patientList = resp.response.data

    //   if (resp.response.data.length >= 0) {
    //     this.patients = Patient.query()
    //       .with([
    //         'identifiers.identifierType',
    //         'identifiers.service.identifierType',
    //         'identifiers.clinic.province',
    //       ])
    //       .with('province')
    //       .with('attributes')
    //       .with('appointments')
    //       .with('district.*')
    //       .with('postoAdministrativo')
    //       .with('bairro')
    //       .with(['clinic.province', 'clinic.district.province'])
    //       .where('clinic_id', this.clinic.id)
    //       .orderBy('firstNames')
    //       .orderBy('identifiers.value', 'asc')
    //       .get();
    //   }
    // });
  } else {
    console.log('Performing local search');
    // const patients = Patient.query()
    //   .with([
    //     'identifiers.identifierType',
    //     'identifiers.service.identifierType',
    //     'identifiers.clinic.province',
    //   ])
    //   .with('province')
    //   .with('attributes')
    //   .with('appointments')
    //   .with('district.*')
    //   .with('postoAdministrativo')
    //   .with('bairro')
    //   .with(['clinic.province', 'clinic.district.province'])
    //   .where('clinic_id', this.clinic.id)
    //   .orderBy('firstNames')
    //   .orderBy('identifiers.value', 'asc')
    //   .get();
    // this.patients = patients.filter((patient) => {
    //   return this.filterPatient(patient);
    // });
  }
};

const checkOpenMRS = (his) => {
  Patient.api()
    .get(
      '/patient/openmrsSession/' +
        his.id +
        '/' +
        localStorage.getItem('encodeBase64')
    )
    .then((response) => {
      if (
        response.response.data.authenticated === false ||
        response.response.data.authenticated === undefined ||
        response.response.data.authenticated === null
      ) {
        alertError(
          'Serviço rest no OpenMRS',
          'O Utilizador ' +
            this.username +
            ' não se encontra no OpenMRS ou serviço rest no OpenMRS não se encontra em funcionamento.'
        );
      } else {
        alertSucess(
          'Pesquisa OpenMRS',
          'Pesquisa de Pacientes no OpenMRS em funcionamento'
        );
      }
    })
    .catch((error) => {
      if (String(error).includes('Network Error')) {
        alertError(
          'Conexão ao OpenMRS',
          'O Servidor OpenMRS encontra-se desligado ou existe um problema de conexão'
        );
      } else {
        alertError(
          'Conexão ao OpenMRS',
          'Falha inexperada, por favor contacte o adminitrador.'
        );
        // this.$q.notify({
        //   color: 'negative',
        //   position: 'center',
        //   message: 'Falha inexperada, por favor contacte o adminitrador.',
        //   icon: 'report_problem',
        // });
      }
    });
  setTimeout(() => {
    closeLoading();
  }, 400);
};

watch(
  () => patients,
  (oldp, newp) => {
    if (oldp !== newp) {
      closeLoading();
    }
  }
);

//provide('firstNames', currPatient.value.firstNames);
</script>

<style></style>
