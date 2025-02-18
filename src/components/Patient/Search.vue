<template>
  <q-responsive :ratio="16 / 9">
    <div class="q-mt-lg">
      <TitleBar />
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
          <q-input
            @keyup.enter="search"
            outlined
            label="Nr. Identificador"
            dense
            ref="identifierRef"
            class="col"
            v-model="patientId"
            @update:model-value="(value) => (filter = value)"
            :rules="[(val) => !!val || 'Por favor indicar o identificador']"
            lazy-rules
          >
            <template
              v-slot:append
              v-if="
                patientId !== null &&
                patientId !== undefined &&
                patientId !== ''
              "
            >
              <q-icon
                name="close"
                @click="patientId = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <q-input
            @keyup.enter="search"
            outlined
            ref="firstNamesRef"
            v-model="currPatient.firstNames"
            type="text"
            lazy-rules
            label="Nome *"
            dense
            class="col q-ml-md"
            @update:model-value="(value) => (filter = value)"
            :rules="[(val) => !!val || 'Por favor indicar o nome']"
            :readonly="selectedDataSources.id.length > 4"
          >
            <template
              v-slot:append
              v-if="
                currPatient.firstNames !== null &&
                currPatient.firstNames !== undefined &&
                currPatient.firstNames !== ''
              "
            >
              <q-icon
                name="close"
                @click="currPatient.firstNames = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <q-input
            @keyup.enter="search"
            outlined
            ref="lastNamesRef"
            v-model="currPatient.lastNames"
            type="text"
            lazy-rules
            label="Apelido"
            dense
            class="col q-ml-md"
            @update:model-value="(value) => (filter = value)"
            :rules="[(val) => !!val || 'Por favor indicar o nome']"
            :readonly="selectedDataSources.id.length > 4"
          >
            <template
              v-slot:append
              v-if="
                currPatient.lastNames !== null &&
                currPatient.lastNames !== undefined &&
                currPatient.lastNames !== ''
              "
            >
              <q-icon
                name="close"
                @click="currPatient.lastNames = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
          <q-btn
            v-if="canClear"
            @click="search"
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
            :rows="patientList"
            :columns="columns"
            row-key="id"
            :filter="filter"
            :loading="loading"
            ref="tableRef"
            v-model:pagination="pagination"
            binary-state-sort
            @request="onRequest"
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
                <q-td key="order" :props="props"> </q-td>
                <q-td key="identifier" :props="props">
                  {{ preferedIdentifierValue(props.row) }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ fullName(props.row) }}
                </q-td>
                <q-td key="age" :props="props">
                  {{
                    idadeCalculator(getDDMMYYYFromJSDate(props.row.dateOfBirth))
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
                      v-if="!(selectedDataSources.id.length > 4)"
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
                      v-if="selectedDataSources.id.length > 4"
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
          <q-page-sticky
            position="bottom-right"
            :offset="[18, 18]"
            v-if="
              !isProvincialInstalation() ||
              !isProvincialInstalationPharmacysMode() ||
              isProvincialInstalationMobileClinic()
            "
          >
            <q-btn
              class="q-mb-xl q-mr-xl"
              fab
              color="primary"
              icon="add"
              @click="createPatient(currPatient)"
            />
          </q-page-sticky>
        </div>
      </div>
      <q-dialog persistent v-model="showPatientRegister">
        <patientRegister />
      </q-dialog>
    </div>
  </q-responsive>
</template>
<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import TitleBar from 'src/components/Shared/TitleBar.vue';
import patientService from 'src/services/api/patientService/patientService';
import patientRegister from 'components/Patient/Register/PatientRegister.vue';
import Patient from 'src/stores/models/patient/Patient';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useRouter } from 'vue-router';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import districtService from 'src/services/api/districtService/districtService';
import { v4 as uuidv4 } from 'uuid';
import { useOnline } from 'src/composables/shared/loadParams/online';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';

const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { idadeCalculator, getDDMMYYYFromJSDate } = useDateUtils();
const { website, isOnline, isDeskTop, isMobile } = useSystemUtils();
const { preferedIdentifierValue, fullName } = usePatient();
const { deleteStorageWithoutPatientInfo, deleteDexieInfo } = useOnline();
const {
  isProvincialInstalation,
  isProvincialInstalationPharmacysMode,
  isProvincialInstalationMobileClinic,
} = useSystemConfig();

//Declaration

const router = useRouter();
const filter = ref('');
const showPatientRegister = ref(false);
const currPatient = ref(new Patient({ id: uuidv4() }));
const patientServiceIdentifier = ref(
  new PatientServiceIdentifier({ id: uuidv4() })
);
const selectedDataSources = ref({
  id: 0,
  abbreviation: 'iDMED',
});
const patients = ref([]);
const patientId = ref('');
const middleNamesRef = ref();
const newPatient = ref(false);
const username = sessionStorage.getItem('user');
const transferencePatientData = ref([]);
const openMrsPatient = ref(false);
const title = ref('Procurar ou adicionar Utentes/Pacientes');
const tableRef = ref();
const loading = ref(false);
const limit = ref(5);
const offset = ref(0);
const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 5,
});
const actualPage = ref(1);
const actualRowsPerPage = ref(5);
const columns = [
  {
    name: 'identifier',
    align: 'left',
    label: 'Identificador',
    field: (row) => preferedIdentifierValue(row),
    sortable: false,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Nome',
    field: (row) => fullName(row),
    sortable: false,
  },
  { name: 'age', align: 'center', label: 'Idade', sortable: false },
  { name: 'gender', align: 'left', label: 'Sexo', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

//Injection
const dataSources = inject('dataSources');
const clinic = inject('clinic');

// Hooks
onMounted(() => {
  showloading();
  currPatient.value = new Patient({ id: uuidv4() });
  patientService.deleteAllFromStorage();
  patientServiceIdentifier.value.value = patientId.value;
  currPatient.value.identifiers.push(patientServiceIdentifier.value);
  currPatient.value.clinic = clinic.value;
  // tableRef.value.requestServerInteraction();
});

//Computed
const canClear = computed(() => {
  return (
    patientId.value !== '' ||
    currPatient.value.firstNames !== '' ||
    currPatient.value.lastNames !== ''
  );
});

const onRequest = async (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;
  // const filter = props.filter;
  if (page !== actualPage.value || rowsPerPage !== actualRowsPerPage.value) {
    loading.value = true;
  }
  // emulate server
  setTimeout(() => {
    // update rowsCount with appropriate value
    // pagination.value.rowsNumber = getRowsNumberCount(filter);

    // get all rows if "All" (0) is selected
    const fetchCount =
      rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage;

    // calculate starting row of data
    const startRow = (page - 1) * rowsPerPage;
    currPatient.value.limit = rowsPerPage;

    currPatient.value.offset = startRow;
    offset.value = startRow;

    if (page !== actualPage.value || rowsPerPage !== actualRowsPerPage.value) {
      actualPage.value = page;
      actualRowsPerPage.value = rowsPerPage;
      currPatient.value.limit = limit.value;
      currPatient.value.offset = offset.value;
      patientService.apiSearch(currPatient.value);
    }

    // clear out existing data and add new
    // rows.value.splice(0, rows.value.length, ...returnedData);

    // don't forget to update local pagination object
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;
    //   pagination.value.rowsNumber = 5;
    // ...and turn of loading indicator
    loading.value = false;
  }, 1500);
};

// Methods
const clearSearchParams = () => {
  currPatient.value = new Patient({ id: uuidv4() });
  currPatient.value.clinic = clinic.value;
  patientService.deleteAllFromStorage();
  // patients.value = [];
};

const search = () => {
  if (selectedDataSources.value.id.length > 4) {
    if (selectedDataSources.value.abbreviation.length <= 2) {
      console.log(transferencePatientData.value);
    } else {
      openMRSSerach(selectedDataSources.value);
    }
  } else {
    localSearch();
  }
};

const openMRSSerach = (his) => {
  showloading();
  const nid = patientId.value.replaceAll('/', '-');

  if (nid.length <= 0) {
    alertError(
      'Não contém nenhum parâmetro de pesquisa. Por favor, introduza um Nº de Identificador'
    );
    closeLoading();
  } else {
    currPatient.value.clinic = clinic;
    patientServiceIdentifier.value.value = patientId.value;
    currPatient.value.identifiers.push(patientServiceIdentifier.value);

    patientService
      .apiSearchPatientOnOpenMRS(his.id, nid, sessionStorage.getItem('Btoa'))
      .then((response) => {
        patientService.deleteAllFromStorage();
        if (response.data.results.length > 0) {
          response.data.results.forEach((pacienteOpenMRS) => {
            const localpatient = ref(new Patient({ id: uuidv4() }));
            patientService.savePatientStorage(
              buildLocalPatientFromOpenMRS(localpatient, pacienteOpenMRS)
            );
          });
          closeLoading();
        } else {
          closeLoading();
          alertInfo(
            'Nenhum resultado encontrado para o identificador ' + nid + ''
          );
        }
      })
      .catch((error) => {
        console.log(error);
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
    buildPatientIdentifierFromOpenMRS(pacienteOpenMRS.identifiers[0])
  );
  localpatient.value.cellphone =
    cellphoneObject !== null && cellphoneObject !== undefined
      ? String(cellphoneObject.value)
      : '';
  localpatient.value.address =
    pacienteOpenMRS.person.addresses.length > 0
      ? pacienteOpenMRS.person.addresses[0].address3
      : '';
  localpatient.value.addressReference =
    pacienteOpenMRS.person.addresses.length > 0
      ? pacienteOpenMRS.person.addresses[0].address1
      : '';
  localpatient.value.district =
    pacienteOpenMRS.person.addresses.length > 0
      ? districtService.getAllDistrictByDescription(
          pacienteOpenMRS.person.addresses[0].countyDistrict
        )
      : '';
  localpatient.value.province =
    localpatient.value.district !== null &&
    localpatient.value.district !== undefined
      ? localpatient.value.district.province
      : null;
  return localpatient.value;
};
const buildPatientIdentifierFromOpenMRS = (identifierOpenMrs) => {
  let serviceCode = 'TARV';
  if (String(identifierOpenMrs.identifierType.display).includes('TARV')) {
    serviceCode = 'TARV';
  } else {
    if (String(identifierOpenMrs.identifierType.display).includes('PREP')) {
      serviceCode = 'PREP';
    } else {
      if (String(identifierOpenMrs.identifierType.display).includes('TB')) {
        serviceCode = 'TB';
      } else {
        if (String(identifierOpenMrs.identifierType.display).includes('CCR')) {
          serviceCode = 'CCR';
        }
      }
    }
  }
  const psi = ref(new PatientServiceIdentifier({ id: uuidv4() }));
  psi.value.startDate = new Date();
  psi.value.value = identifierOpenMrs.identifier;
  psi.value.state = 'Activo';
  psi.value.prefered = true;
  psi.value.service =
    clinicalServiceService.getByIdentifierTypeCode(serviceCode);
  psi.value.identifierType =
    clinicalServiceService.getByIdentifierTypeCode(serviceCode).identifierType;
  psi.value.clinic = clinic.value;
  return psi.value;
};

const createPatient = (patient) => {
  currPatient.value = patient;
  showPatientRegister.value = true;
  newPatient.value = true;
};

const editPatient = (patient) => {
  currPatient.value = patient;
  showPatientRegister.value = true;
  newPatient.value = false;
};
const saveOpenMRSPatient = (patient) => {
  showloading();
  patient.limit = limit.value;
  patient.offset = offset.value;
  patientService
    .apiSearch(patient)
    .then((resp) => {
      if (resp === undefined || resp === null || resp.length === 0) {
        resp.data = [];
      }
      if (resp.data.length >= 1) {
        alertInfo(
          'Já existe um Paciente com o NID:[ ' +
            patient.identifiers[0].value +
            ' ] no IDMED. Use A pesquisa do Idmed'
        );
        patientService.deleteAllFromStorage();
        closeLoading();
      } else {
        closeLoading();
        currPatient.value = patient;
        showPatientRegister.value = true;
        newPatient.value = true;
        openMrsPatient.value = true;
      }
    })
    .catch((error) => {
      closeLoading();
      console.log(error);
    });
};

const closePatient = () => {
  showPatientRegister.value = false;
  newPatient.value = false;
  openMrsPatient.value = false;
};

const goToPatientPanel = async (patient) => {
  showloading();
  deleteStorageWithoutPatientInfo();
  await patientService.deleteAllExceptIdFromStorage(patient.id);
  currPatient.value = patient;
  localStorage.setItem('patientuuid', currPatient.value.id);

  if (isMobile.value && !isOnline.value) {
    await patientService.getPatientMobileWithAllByPatientId(currPatient.value);
  } else {
    deleteDexieInfo();
    localStorage.setItem('patientuuid', currPatient.value.id);
    await patientService.getPatientByID(currPatient.value.id);
    // Rest Calls
    await patientServiceIdentifierService.apiGetAllByPatientId(
      currPatient.value.id
    );
    await patientVisitService.apiGetAllByPatientId(currPatient.value.id);
    await patientVisitDetailsService.apiGetPatientVisitDetailsByPatientId(
      currPatient.value.id
    );
  }

  localStorage.setItem('patientuuid', currPatient.value.id);

  router.push('/patientpanel/');
};

const filterPatient = (patient) => {
  return (
    hasIdentifierLike(patient, currPatient) ||
    stringContains(patient.firstNames, currPatient.value.firstNames) ||
    stringContains(patient.middleNames, currPatient.value.middleNames) ||
    stringContains(patient.lastNames, currPatient.value.lastNames)
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
  return String(stringToCheck)
    .toLowerCase()
    .includes(String(stringText).toLowerCase());
};

const loadHISDataSource = () => {
  patientService.deleteAllFromStorage();
  showloading();
  if (selectedDataSources.value.id.length > 4) {
    if (selectedDataSources.value.abbreviation.length <= 2) {
      closeLoading();
    } else {
      checkOpenMRS(selectedDataSources.value);
    }
  } else {
    alertSucess(
      'Pesquisa iDMED',
      'Pesquisa de Pacientes no iDMED em funcionamento'
    );
    setTimeout(() => {
      closeLoading();
    }, 400);
  }
};

const patientList = computed(() => {
  return patientService.getPatientSearchList();
});

const localSearch = async () => {
  currPatient.value.identifiers[0].value = patientId.value;
  if (website.value || (isMobile.value && isOnline.value)) {
    showloading();
    const count = await patientService.countPatientSearchResult(
      currPatient.value
    );
    pagination.value.rowsNumber = count.data;
    currPatient.value.limit = limit.value;
    currPatient.value.offset = offset.value;
    patientService.apiSearch(currPatient.value);
  } else {
    patientService.getMobile();
    patientServiceIdentifierService.getMobile();
  }
};

const checkOpenMRS = (his) => {
  patientService
    .apiCheckOpenmRSisOn(his.id, sessionStorage.getItem('Btoa'))
    .then((response) => {
      if (
        response.data.authenticated === false ||
        response.data.authenticated === undefined ||
        response.data.authenticated === null
      ) {
        alertError(
          'O Utilizador [' +
            username +
            '] não se encontra no OpenMRS ou serviço rest no OpenMRS não se encontra em funcionamento.'
        );
        closeLoading();
      } else {
        alertSucess('Pesquisa de Pacientes no OpenMRS em funcionamento');
        closeLoading();
      }
    })
    .catch((error) => {
      if (String(error).includes('Network Error')) {
        alertError(
          'O Servidor OpenMRS encontra-se desligado ou existe um problema de conexão'
        );
        closeLoading();
      } else {
        console.log(error);
        alertError('Falha inesperada, por favor contacte o administrador.');
        closeLoading();
      }
    });
};

provide('title', title);
provide('newPatient', newPatient);
provide('patient', currPatient);
provide('openMrsPatient', openMrsPatient);
provide('transferencePatientData', transferencePatientData);
provide('closePatient', closePatient);
provide('showPatientRegister', showPatientRegister);
</script>
