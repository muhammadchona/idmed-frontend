<template>
  <div style="width: 1200px; max-width: 140vw">
    <q-card>
      <form @submit.prevent="submitForm">
        <q-card-section class="bg-green-2">
          <div class="col text-bold text-grey-10 q-ml-sm text-center">
            Unir Pacientes Duplicados
          </div>
        </q-card-section>
        <div class="row">
          <div class="col-6">
            <q-card-section>
              <div class="q-mt-lg">
                <div class="row items-center q-mb-md">
                  <q-icon name="person_outline" size="sm" />
                  <span class="q-pl-sm text-subtitle2"
                    >Dados Pessoais - Paciente Preferido</span
                  >
                </div>
                <q-separator color="grey-13" size="1px" />
              </div>
              <div class="q-mt-md">
                <div class="row">
                  <q-input
                    label="Nid *"
                    dense
                    outlined
                    disable
                    class="col"
                    ref="firstNamesRef"
                    v-model="curIdentifier.value"
                  />
                </div>
              </div>

              <div class="q-mt-md">
                <div class="row">
                  <q-input
                    label="Nome *"
                    dense
                    outlined
                    disable
                    class="col"
                    ref="firstNamesRef"
                    v-model="patient.firstNames"
                  />
                  <q-input
                    v-model="patient.middleNames"
                    ref="middleNamesRef"
                    dense
                    outlined
                    class="col q-ml-md"
                    label="Sobre Nome "
                    disable
                  />
                  <q-input
                    ref="lastNamesRef"
                    v-model="patient.lastNames"
                    class="col q-ml-md"
                    label="Apelido *"
                    dense
                    outlined
                    disable
                  />
                </div>
              </div>
              <div class="q-mt-md">
                <div class="row">
                  <q-input
                    v-model="patientBirhtDate"
                    class="col"
                    label="Data de Nascimento"
                    dense
                    outlined
                    disable
                  />
                  <q-input
                    label="Idade"
                    dense
                    outlined
                    disable
                    class="col q-ml-md"
                    v-model="ageCalculatedPatient"
                  />
                  <q-input
                    label="Genero"
                    dense
                    outlined
                    disable
                    class="col q-ml-md"
                    v-model="patient.gender"
                  />
                </div>
              </div>
              <div
                class="q-mt-md"
                v-if="patientVisits !== null && patientVisits.length > 0"
              >
                <q-table
                  title="Dispensas"
                  :rows="patientVisits"
                  :columns="columns"
                  row-key="name"
                  class="my-sticky-header-table"
                >
                  <template #body="props">
                    <q-tr no-hover :props="props">
                      <q-td key="pickUpDate" :props="props">
                        {{ formatDate(props.row.pack.pickupDate) }}
                      </q-td>
                      <q-td key="nextPickUpDate" :props="props">
                        {{ formatDate(props.row.pack.nextPickUpDate) }}
                      </q-td>
                      <q-td key="therapeuticRegimen" :props="props">
                        {{
                          therapeuticalRegimenService.getById(
                            props.row.prescription.prescriptionDetails[0]
                              .therapeutic_regimen_id
                          ).regimenScheme
                        }}
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </q-card-section>
          </div>
          <div class="col-6">
            <q-card-section>
              <div class="q-mt-lg">
                <div class="row items-center q-mb-md">
                  <q-icon name="person_outline" size="sm" />
                  <span class="q-pl-sm text-subtitle2"
                    >Dados Pessoais - Paciente Duplicado</span
                  >
                </div>
                <q-separator color="grey-13" size="1px" />
              </div>
              <div class="q-mt-md">
                <div class="row">
                  <q-input
                    label="Nid do paciente duplicado a pesquisar*"
                    dense
                    outlined
                    class="col"
                    v-model="identifierToSearch"
                  />
                  <q-btn
                    @click="search()"
                    class="q-ml-sm"
                    square
                    color="primary"
                    icon="search"
                  >
                    <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
                  </q-btn>
                </div>
              </div>

              <div class="q-mt-md">
                <div class="row">
                  <q-input
                    label="Nome *"
                    dense
                    outlined
                    disable
                    class="col"
                    ref="firstNamesRef"
                    v-model="patientToDelete.firstNames"
                  />
                  <q-input
                    v-model="patientToDelete.middleNames"
                    ref="middleNamesRef"
                    dense
                    outlined
                    class="col q-ml-md"
                    label="Sobre Nome "
                    disable
                  />
                  <q-input
                    ref="lastNamesRef"
                    v-model="patientToDelete.lastNames"
                    class="col q-ml-md"
                    label="Apelido *"
                    dense
                    outlined
                    disable
                  />
                </div>
              </div>
              <div class="q-mt-md">
                <div class="row">
                  <q-input
                    ref="lastNamesRef"
                    v-model="patientToDeleteBirhtDate"
                    class="col"
                    label="Data de Nascimento"
                    dense
                    outlined
                    disable
                  />
                  <q-input
                    label="Idade"
                    dense
                    outlined
                    disable
                    class="col q-ml-md"
                    v-model="ageCalculatedPatientToDelete"
                  />
                  <q-input
                    label="Genero"
                    dense
                    outlined
                    disable
                    class="col q-ml-md"
                    v-model="patient.gender"
                  />
                </div>
              </div>
              <div
                class="q-mt-md"
                v-if="
                  patientVisitsToDelete !== null &&
                  patientVisitsToDelete.length > 0
                "
              >
                <q-table
                  title="Dispensas"
                  :rows="patientVisitsToDelete"
                  :columns="columns"
                  row-key="name"
                  class="my-sticky-header-table"
                >
                  <template #body="props">
                    <q-tr no-hover :props="props">
                      <q-td key="pickUpDate" :props="props">
                        {{ formatDate(props.row.pack.pickupDate) }}
                      </q-td>
                      <q-td key="nextPickUpDate" :props="props">
                        {{ formatDate(props.row.pack.nextPickUpDate) }}
                      </q-td>
                      <q-td key="therapeuticRegimen" :props="props">
                        {{
                          props.row.prescription.prescriptionDetails[0]
                            .therapeutic_regimen_id !== null &&
                          props.row.prescription.prescriptionDetails[0]
                            .therapeutic_regimen_id !== undefined &&
                          props.row.prescription.prescriptionDetails[0]
                            .therapeutic_regimen_id !== ''
                            ? therapeuticalRegimenService.getById(
                                props.row.prescription.prescriptionDetails[0]
                                  .therapeutic_regimen_id
                              ).regimenScheme
                            : 'Sem Info.'
                        }}
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </div>
            </q-card-section>
          </div>
          <h5 style="margin-left: 20px">
            Após esta operação ser gravada ou executada com sussesso, o paciente
            preferido será o novo paciente a ser utilizado. Toda a informação
            dos dois pacentes em causa será alocada ao paciente preferido.
            <p>
              NOTA: O Paciente Duplicado será REMOVIDO e a sua informação jamais
              sera visualizada.
            </p>
            <p style="color: red">
              <strong>
                AVISO: NÃO PODERA VOLTAR A INFORMACÃO ANTERIOR DEPOIS DE UNIR OS
                PACIENTES.
              </strong>
            </p>
          </h5>
        </div>
        <q-card-actions align="right" class="q-mb-md q-mr-sm">
          <q-btn label="Cancelar" color="red" @click="closeDuplicates" />
          <q-btn
            type="submit"
            :loading="submitLoading"
            label="Submeter"
            color="primary"
            :desabled="enableSubmit"
          />
        </q-card-actions>
      </form>
    </q-card>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { computed, inject, onMounted, ref } from 'vue';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService';
import patientService from 'src/services/api/patientService/patientService';
import Patient from 'src/stores/models/patient/Patient';
import moment from 'moment';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import packService from 'src/services/api/pack/packService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
const columns = [
  {
    name: 'pickUpDate',
    align: 'left',
    field: 'nextPickUpDate',
    label: 'Data do Levantamento',
    sortable: false,
  },
  {
    name: 'nextPickUpDate',
    align: 'left',
    field: 'nextPickUpDate',
    label: 'Data do Próximo Levantamento',
    sortable: false,
  },
  {
    name: 'therapeuticRegimen',
    align: 'left',
    field: 'therapeuticRegimen',
    label: 'Regime Terapeutico',
    sortable: false,
  },
];

const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const curIdentifier = ref({});
const identifierToSearch = ref(null);
const patientVisits = ref([]);
const closeDuplicates = inject('closeDuplicates');
const patient = inject('patient');
const patientToDelete = ref({});
const patientVisitsToDelete = ref([]);
const ageCalculatedPatient = ref('');
const ageCalculatedPatientToDelete = ref('');
const closeMergePatient = inject('closeMergePatient');
const { getYYYYMMDDFromJSDate, getDateFromHyphenDDMMYYYY } = useDateUtils();
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};
const submitLoading = ref(false);
const enableSubmit = ref(true)
onMounted(async () => {
  showloading();
  const tarvClinicalService =
    clinicalServiceService.getClinicalServiceByCode('TARV');
  console.log(patient.value.id);
  curIdentifier.value =
    patientServiceIdentifierService.getPreferredIdentifierByPatientId(
      patient.value.id
    );
  ageCalculatedPatient.value = moment().diff(
    moment(patient.value.dateOfBirth, 'YYYY-MM-DD'),
    'years'
  );
  /*
  await patientVisitDetailsService.apiGetAllPatientVisitDetailsByPatientId(
    patient.value.id
  );
  */
  patientVisits.value =
    patientVisitDetailsService.getAllWithAllRecursiveFromPatientAndClinicService(
      patient.value.id,
      tarvClinicalService.id
    );
  patientVisits.value = orderByDate(patientVisits.value, 'visitDate');
  closeLoading();
});

const search = async () => {
  showloading();
  enableSubmit.value = true
  if (identifierToSearch.value && identifierToSearch.value.length > 0) {
    const tarvClinicalService =
      clinicalServiceService.getClinicalServiceByCode('TARV');
    const patientServiceIdentifier =
      await patientServiceIdentifierService.apiFetchByNidValue(
        identifierToSearch.value
      );
    if (patientServiceIdentifier) {
      patientToDelete.value = patientServiceIdentifier.patient;
      await patientVisitDetailsService.apiGetAllPatientVisitDetailsByPatientId(
        patientToDelete.value.id
      );
      await prescriptionService.apiGetByPatientId(patientToDelete.value.id);
      await packService.apiGetByPatientId(patientToDelete.value.id);
      patientVisitsToDelete.value =
        patientVisitDetailsService.getAllWithAllRecursiveFromPatientAndClinicService(
          patientToDelete.value.id,
          tarvClinicalService.id
        );
      patientVisitsToDelete.value = orderByDate(
        patientVisitsToDelete.value,
        'visitDate'
      );
      console.log(patientVisitsToDelete.value);
      ageCalculatedPatientToDelete.value = moment().diff(
        moment(patient.value.dateOfBirth, 'YYYY-MM-DD'),
        'years'
      );
      enableSubmit.value = false
    } else {
      alertError('Não foi encontrado nenhum paciente com NID');
    }

    closeLoading();
  } else {
    alertError('Preencha o NID do paciente duplicado a Pesquisar');
    closeLoading();
    return;
  }
};

const patientBirhtDate = computed(() => {
  return patient.value ? formatDate(patient.value.dateOfBirth) : '';
});

const patientToDeleteBirhtDate = computed(() => {
  return patientToDelete.value
    ? formatDate(patientToDelete.value.dateOfBirth)
    : '';
});

const ageCalculator = () => {
  if (
    patient.value.dateOfBirth !== null &&
    patient.value.dateOfBirth !== undefined &&
    patient.value.dateOfBirth !== ''
  ) {
    ageCalculatedPatient.value = moment().diff(
      moment(getDateFromHyphenDDMMYYYY(dateOfBirth.value), 'YYYY-MM-DD'),
      'years'
    );
  } else {
    return '';
  }
};

const submitForm = () => {
  submitLoading.value = true;
  patientService
    .mergePatients(patient.value.id, patientToDelete.value.id)
    .then((resp) => {
      submitLoading.value = false;
      alertSucess('Operacao efectuada com sucesso');
      closeMergePatient();
    });
};

const orderByDate = (data, criterion) => {
  return data.slice().sort(function (a, b) {
    if (a.patientVisit[criterion] > b.patientVisit[criterion]) {
      return -1;
    }
    if (a.patientVisit[criterion] < b.patientVisit[criterion]) {
      return 1;
    }
    return 0;
  });
};
</script>
<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */


  .q-table__top,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #0ba58b

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>
