<template>
  <div class="box-border">
    <div class="q-ma-md">
      <div class="row">
        <q-input
          dense
          outlined
          :disable="showServiceDrugsManagement || !isNewPrescription"
          class="col q-mb-md"
          v-model="prescriptionDate"
          ref="prescriptionDateRef"
          label="Data da Prescrição"
          @update:model-value="validateDate(props.identifier)"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="prescriptionDate"
                  :disable="showServiceDrugsManagement || !isNewPrescription"
                  :options="optionsNonFutureDate"
                  @update:model-value="validateDate(props.identifier)"
                  mask="DD-MM-YYYY"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup label="Close" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <div class="col">
          <div class="row">
            <q-checkbox
              v-model="curPrescriptionDetail.spetialPrescription"
              :disable="showServiceDrugsManagement || !isNewPrescription"
              label="Prescrição especial"
              class="col-4 q-mb-sm"
            />
            <q-select
              class="col"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              dense
              outlined
              :disable="showServiceDrugsManagement || !isNewPrescription"
              v-if="curPrescriptionDetail.spetialPrescription"
              v-model="curPrescriptionDetail.spetialPrescriptionMotive"
              :options="optionsspetialPrescriptionMotives"
              ref="spetialMotiveRef"
              :rules="[
                (val) =>
                  !!val || 'Por favor indicar o motivo da prescrição especial',
              ]"
              option-value="id"
              option-label="description"
              @filter="filterFnspetialPrescriptionMotives"
              label="Motivo da prescrição especial"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <q-select
          v-if="hasTherapeuticalRegimen"
          class="col q-mr-sm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          :disable="showServiceDrugsManagement || !isNewPrescription"
          ref="therapeuticRegimenRef"
          :rules="[(val) => !!val || 'Por favor indicar o regime terapêutico']"
          v-model="curPrescriptionDetail.therapeuticRegimen"
          :options="optionstherapeuticRegimens"
          option-value="id"
          option-label="description"
          @filter="filterFntherapeuticRegimens"
          label="Regime Terapêutico"
        />
        <q-select
          v-if="hasTherapeuticalLine"
          class="col q-mr-sm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          :disable="showServiceDrugsManagement || !isNewPrescription"
          ref="therapeuticLineRef"
          :rules="[(val) => !!val || 'Por favor indicar a linha terapêutica']"
          v-model="curPrescriptionDetail.therapeuticLine"
          :options="optionstherapeuticLines"
          option-value="id"
          option-label="description"
          @filter="filterFntherapeuticLines"
          label="Linha Terapêutica"
        />
        <q-select
          class="col q-mr-sm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          :disable="showServiceDrugsManagement || !isNewPrescription"
          v-model="curPrescription.duration"
          :options="optionsdurations"
          ref="durationRef"
          :rules="[(val) => !!val || 'Por favor indicar a duração']"
          option-value="id"
          option-label="description"
          @filter="filterFndurations"
          label="Duração"
          @update:model-value="curPrescriptionDetail.dispenseType = ''"
        />
        <q-select
          class="col"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          :disable="showServiceDrugsManagement || !isNewPrescription"
          ref="doctorRef"
          :rules="[(val) => !!val || 'Por favor indicar o clínico']"
          v-model="curPrescription.doctor"
          :options="optionsdoctors"
          option-value="id"
          option-label="fullName"
          @filter="filterFndoctors"
          label="Clínico"
        />
      </div>
      <div>
        <div class="row items-center q-mb-xs">
          <span class="text-subtitle2">Adição de Medicamento à Prescrição</span>
        </div>
        <q-separator color="grey-13" size="1px" class="q-mb-sm" />
      </div>
      <div>
        <q-banner dense inline-actions class="bg-grey-6 text-white q-pa-none">
          <span class="text-bold text-subtitle1 vertical-middle q-pl-md"
            >Medicamentos Prescritos</span
          >
          <template v-slot:action>
            <q-btn
              v-if="!showServiceDrugsManagement"
              round
              icon="add"
              @click="showAddEditDrug = true"
              flat
            />
          </template>
        </q-banner>
        <q-table
          flat
          bordered
          dense
          hide-bottom
          :rows="curPrescription.prescribedDrugs"
          :columns="columns"
          row-key="id"
        >
          <template #body="props">
            <q-tr no-hover :props="props">
              <q-td key="drug" :props="props">
                {{ props.row.drug.name }}
              </q-td>
              <q-td key="dosage" :props="props">
                {{
                  'Tomar ' +
                  props.row.amtPerTime +
                  ' ' +
                  props.row.drug.form.description +
                  ' ' +
                  props.row.timesPerDay +
                  ' vez(es)' +
                  ' por ' +
                  props.row.form
                }}
              </q-td>
              <q-td auto-width key="packs" :props="props">
                {{
                  getQtyPrescribed(props.row, curPrescription.duration.weeks) >
                  0
                    ? getQtyPrescribed(
                        props.row,
                        curPrescription.duration.weeks
                      )
                    : 1
                }}
              </q-td>
              <q-td key="options" :props="props">
                <q-btn
                  flat
                  round
                  color="red"
                  icon="delete"
                  :disable="showServiceDrugsManagement || !isNewPrescription"
                  @click="deleteRow(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-separator color="grey-13" size="1px" class="q-mb-sm" />
      </div>
      <div>
        <div class="row items-center q-mb-xs">
          <span class="text-subtitle2">Informação Adicional</span>
        </div>
        <q-separator color="grey-13" size="1px" class="q-mb-sm" />
      </div>
      <div class="row">
        <div class="col">
          <div class="row items-center">
            <q-item-label dense caption>Altera Linha Terapêutica?</q-item-label>
            <q-radio
              v-model="curPrescription.patientType"
              :disable="showServiceDrugsManagement || !isNewPrescription"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="N/A"
              label="Não"
            />
            <q-radio
              v-model="curPrescription.patientType"
              :disable="showServiceDrugsManagement || !isNewPrescription"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              val="Alterar"
              label="Sim"
            />
          </div>
        </div>
        <q-select
          v-if="
            hasPrescriptionChangeMotive &&
            String(curPrescription.patientType).includes('Alterar')
          "
          class="col q-mr-sm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          ref="reasonForUpdateRef"
          dense
          outlined
          option-value="code"
          :disable="showServiceDrugsManagement || !isNewPrescription"
          :options="reasonsForUpdate"
          v-model="curPrescriptionDetail.reasonForUpdate"
          option-label="description"
          @filter="filterFnreasonsForUpdate"
          label="Motivo Alteração"
        />
        <q-select
          class="col q-mr-sm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          :disable="showServiceDrugsManagement || !isNewPrescription"
          ref="dispenseTypeRef"
          :rules="[(val) => !!val || 'Por favor indicar o tipo de dispensa']"
          v-model="curPrescriptionDetail.dispenseType"
          :options="optionsdispenseTypes"
          option-value="id"
          option-label="description"
          @filter="filterFndispenseTypes"
          label="Paciente em "
        />
        <q-select
          class="col"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          ref="patientStatusRef"
          :rules="[
            (val) =>
              !!val ||
              'Por favor indicar a situação do paciente (em relação aos modelos)',
          ]"
          :disable="showServiceDrugsManagement || !isNewPrescription"
          v-model="curPrescription.patientStatus"
          :options="optionspatientStatus"
          @filter="filterFnpatientStatus"
          dense
          outlined
          label="Situacao do paciente (em relação aos modelos)"
        />
      </div>

      <div class="row reverse q-mb-sm q-mt-sm q-gutter-sm">
        <q-btn
          v-if="!showServiceDrugsManagement"
          unelevated
          color="primary"
          :disable="showServiceDrugsManagement || !isNewPrescription"
          label="Validar Prescricão"
          class="all-pointer-events"
          @click="validateForm()"
        />
        <q-btn
          v-if="showServiceDrugsManagement"
          unelevated
          color="red"
          :disable="
            !showServiceDrugsManagement ||
            validateDispense ||
            !isNewPrescription
          "
          label="Invalidar Prescricão"
          class="all-pointer-events"
          @click="showServiceDrugsManagement = false"
        />
      </div>
    </div>
  </div>
  <div class="" v-if="showServiceDrugsManagement">
    <div>
      <ServiceDrugsManagement />
    </div>
  </div>
  <q-dialog persistent v-model="showAddEditDrug">
    <AddEditPrescribedDrug />
  </q-dialog>
</template>

<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { date } from 'quasar';
import moment from 'moment';
import ServiceDrugsManagement from 'components/Patient/PatientPanel/ServiceDrugsManagement.vue';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { usePatient } from 'src/composables/patient/patientMethods';
import { usePatientServiceIdentifier } from 'src/composables/patient/patientServiceIdentifierMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import Prescription from 'src/stores/models/prescription/Prescription';
import PatientVisitDetails from 'src/stores/models/patientVisitDetails/PatientVisitDetails';
import PrescriptionDetail from 'src/stores/models/prescriptionDetails/PrescriptionDetail';
import spetialPrescriptionMotiveService from 'src/services/api/spetialPrescriptionMotive/spetialPrescriptionMotiveService';
import clinicalServiceAttributeService from 'src/services/api/clinicalServiceAttributeService/clinicalServiceAttributeService';
import therapeuticalRegimenService from 'src/services/api/therapeuticalRegimenService/therapeuticalRegimenService';
import therapeuticLineService from 'src/services/api/therapeuticLineService/therapeuticLineService';
import durationService from 'src/services/api/duration/durationService';
import dispenseTypeService from 'src/services/api/dispenseType/dispenseTypeService';
import doctorService from 'src/services/api/doctorService/doctorService';
import episodeService from 'src/services/api/episode/episodeService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import Pack from 'src/stores/models/packaging/Pack';
import AddEditPrescribedDrug from 'components/Patient/PatientPanel/AddEditPrescribedDrug.vue';
import { usePrescribedDrug } from 'src/composables/prescription/prescribedDrugMethods';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import StockService from 'src/services/api/stockService/StockService';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import PackagedDrugStock from 'src/stores/models/packagedDrug/PackagedDrugStock';
import packService from 'src/services/api/pack/packService';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';

import { v4 as uuidv4 } from 'uuid';

//props
const props = defineProps(['identifier']);

// Declaration
const {
  isValidDate,
  idadeCalculator,
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
} = useDateUtils();
const { preferedIdentifierValue, fullName } = usePatient();
const { lastVisitPrescription } = usePatientServiceIdentifier();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { getQtyPrescribed } = usePrescribedDrug();
const { remainigDuration } = usePrescription();
const expanded = ref(false);
const submitting = ref(false);
const prescriptionDate = ref();
//Ref's
const therapeuticRegimenRef = ref(null);
const therapeuticLineRef = ref(null);
const spetialMotiveRef = ref(null);
const durationRef = ref(null);
const doctorRef = ref(null);
const reasonForUpdateRef = ref(null);
const dispenseTypeRef = ref(null);
const patientStatusRef = ref(null);
const prescriptionDateRef = ref(null);

// New Values
const curPrescription = ref(new Prescription({ id: uuidv4() }));
const curPrescriptionDetail = ref(new PrescriptionDetail({ id: uuidv4() }));
const curPatientVisitDetail = ref(new PatientVisitDetails());
const curPack = ref(new Pack());
const validateDispense = ref(false);

const reasonsForUpdate = ref(['Falência Terapeutica', 'Alergia']);
const patientStatusOption = ref(['Inicio', 'Manutenção']);
const patientTypes = ref(['Sim', 'Não']);
const showServiceDrugsManagement = ref(false);
const showDispenseMode = ref(false);
const showAddEditDrug = ref(false);
const prescribedDrugs = ref([]);
const optionsspetialPrescriptionMotives = ref([]);
const optionstherapeuticRegimens = ref([]);
const optionstherapeuticLines = ref([]);
const optionsdurations = ref([]);
const optionsdoctors = ref([]);
const optionsreasonsForUpdate = ref([]);
const optionsdispenseTypes = ref([]);
const optionspatientStatus = ref([]);
const spetialPrescription = ref(false);
const lastValidPrescription = ref(null);
const originalPickUpDate = ref(null);
const mustBeSpetial = ref(false);
const msgObject = ref({});
const visitClone = ref({});
const isAlreadyEdited = ref(false);
const prescriptionWithDuration = ref(false);
const contentStyle = ref({
  backgroundColor: '#ffffff',
  color: '#555',
});
const contentActiveStyle = ref({
  backgroundColor: '#eee',
  color: 'black',
});
const thumbStyle = ref({
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
});

const columns = [
  {
    name: 'drug',
    align: 'left',
    field: (row) => row.drug.name,
    label: 'Medicamento',
    sortable: true,
  },
  {
    name: 'dosage',
    align: 'left',
    field: (row) =>
      'Tomar ' +
      row.amtPerTime +
      ' ' +
      row.drug.form.description +
      ' ' +
      row.timesPerDay +
      ' vez(es)' +
      ' por ' +
      row.form,
    label: 'Toma',
    sortable: false,
  },
  {
    name: 'packs',
    align: 'center',
    style: 'width: 20px',
    field: (row) =>
      getQtyPrescribed(row, curPrescription.value.duration.weeks) > 0
        ? getQtyPrescribed(row, curPrescription.value.duration.weeks)
        : 1,
    label: 'Quantidade em (Frascos)',
    sortable: false,
  },
  {
    name: 'options',
    align: 'left',
    label: 'Opções',
    sortable: false,
    field: '<q-btn/>',
  },
];

// // Injection
const isNewPrescription = inject('isNewPrescription');
const patient = inject('patient');
const curPatientVisit = inject('curPatientVisit');

// Computed
const spetialPrescriptionMotives = computed(() => {
  return spetialPrescriptionMotiveService.getAllFromStorage();
});

const hasTherapeuticalRegimen = computed(() => {
  const result = clinicalServiceAttributeService.checkWeatherAttExist(
    props.identifier.service.id,
    'THERAPEUTICAL_REGIMEN'
  );
  return result;
});
const hasTherapeuticalLine = computed(() => {
  const result = clinicalServiceAttributeService.checkWeatherAttExist(
    props.identifier.service.id,
    'THERAPEUTICAL_LINE'
  );
  return result;
});
const hasPatientType = computed(() => {
  const result = clinicalServiceAttributeService.checkWeatherAttExist(
    props.identifier.service.id,
    'PATIENT_TYPE'
  );
  return result;
});
const hasPrescriptionChangeMotive = computed(() => {
  const result = clinicalServiceAttributeService.checkWeatherAttExist(
    props.identifier.service.id,
    'PRESCRIPTION_CHANGE_MOTIVE'
  );
  return result;
});
const therapeuticRegimens = computed(() => {
  return therapeuticalRegimenService.getAllTherapeuticalByclinicalService(
    props.identifier.service.id
  );
});
const therapeuticLines = computed(() => {
  return therapeuticLineService.getAllFromStorage();
});
const doctors = computed(() => {
  return doctorService.getAlldoctors();
});
const dispenseTypes = computed(() => {
  return dispenseTypeService.getAllFromDuration(
    curPrescription.value.duration.weeks
  );
});
const durations = computed(() => {
  return durationService.getAllFromStorage();
});
const lastStartEpisode = computed(() => {
  return episodeService.getLastStartEpisodeByIdentifier(props.identifier.id);
});
const lastPatientVisit = computed(() => {
  if (lastStartEpisode.value !== null && lastStartEpisode.value !== undefined) {
    return patientVisitService.getLastFromEpisode(lastStartEpisode.value.id);
  } else {
    return null;
  }
});

const lastPatientVisitDetails = computed(() => {
  if (lastPatientVisit.value !== null && lastPatientVisit.value !== undefined) {
    return patientVisitDetailsService.getLastPatientVisitDetailFromPatientVisit(
      lastPatientVisit.value.id
    );
  } else {
    return null;
  }
});

const lastPrescription = computed(() => {
  if (
    lastPatientVisitDetails.value !== null &&
    lastPatientVisitDetails.value !== undefined
  ) {
    return prescriptionService.getLastPrescriptionFromPatientVisitDetails(
      lastPatientVisitDetails.value.prescription.id
    );
  } else {
    return null;
  }
});
const lastPack = computed(() => {
  if (lastPrescription.value !== null && lastPrescription.value !== undefined) {
    return packService.getLastPackFromPatientVisitAndPrescription(
      lastPrescription.value.id
    );
  } else {
    return null;
  }
});

// Methods
const optionsNonFutureDate = (date) => {
  return date <= moment().format('YYYY/MM/DD');
};
const getLastPrescriptionData = () => {
  if (lastPrescription.value !== null && lastPrescription.value !== undefined) {
    curPrescriptionDetail.value.therapeuticRegimen =
      lastPrescription.value.prescriptionDetails[0].therapeuticRegimen;
    curPrescriptionDetail.value.therapeutic_regimen_id =
      lastPrescription.value.prescriptionDetails[0].therapeuticRegimen.id;

    curPrescriptionDetail.value.therapeuticLine =
      lastPrescription.value.prescriptionDetails[0].therapeuticLine;
    curPrescriptionDetail.value.therapeutic_line_id =
      lastPrescription.value.prescriptionDetails[0].therapeuticLine.id;

    curPrescriptionDetail.value.dispense_type_id =
      lastPrescription.value.prescriptionDetails[0].dispenseType.id;
    curPrescriptionDetail.value.dispenseType =
      lastPrescription.value.prescriptionDetails[0].dispenseType;

    curPrescription.value.duration = lastPrescription.value.duration;
    curPrescription.value.duration_id = lastPrescription.value.duration.id;
    delete curPrescription.value.duration['prescriptions'];
    curPrescription.value.doctor = lastPrescription.value.doctor;
    curPrescription.value.doctor_id = lastPrescription.value.doctor.id;
    curPrescription.value.patientStatus = 'Manutenção';

    curPrescription.value.patientType = lastPrescription.value.patientType;
    curPrescription.value.prescribedDrugs =
      lastPrescription.value.prescribedDrugs;

    curPrescription.value.prescribedDrugs.forEach((prescribedDrug) => {
      prescribedDrug.prescription = null;
      prescribedDrug.prescription_id = null;
    });
  }
};
const validateDate = (identifier) => {
  if (
    lastVisitPrescription(identifier) !== null &&
    lastVisitPrescription(identifier) !== undefined
  ) {
    const lastPack = lastVisitPrescription(identifier).pack;
    if (lastPack !== null && lastPack !== undefined) {
      const nextPickUpDate = moment
        .utc(lastPack.nextPickUpDate)
        .local()
        .format('DD-MM-YYYY');
      const validatePrescriptionDate = moment
        .utc(
          date.addToDate(
            getDateFromHyphenDDMMYYYY(prescriptionDate.value, 'YYYY-MM-DD'),
            {
              days: 4,
            }
          )
        )
        .local()
        .format('DD-MM-YYYY');
      var momentNextPickUpDate = moment(nextPickUpDate, 'DD-MM-YYYY');
      var momentPrescriptionDate = moment(
        validatePrescriptionDate,
        'DD-MM-YYYY'
      );

      if (momentNextPickUpDate.isAfter(momentPrescriptionDate)) {
        alertWarningAction(
          'O paciente ainda possui medicamentos ' +
            identifier.service.code +
            ' em casa  deseja  continuar com a criação da nova prescrição?'
        ).then((result) => {
          if (!result) {
            prescriptionDate.value = '';
          }
        });
      }
    }
  }
};

const init = () => {
  if (isNewPrescription.value) {
    prescriptionDate.value = moment().format('DD-MM-YYYY');
    curPrescriptionDetail.value.prescription = curPrescription.value;
    curPrescriptionDetail.value.prescription_id = curPrescription.value.id;
    curPrescription.value.leftDuration = remainigDuration(
      curPrescription.value
    );
    getLastPrescriptionData();
  } else {
    prescriptionDate.value = getDDMMYYYFromJSDate(
      lastPrescription.value.prescriptionDate
    );
    curPrescription.value = lastPrescription.value;
    // curPrescription.value.patientVisitDetails = [];
    curPrescription.value.syncStatus = 'N';
    curPrescription.value.prescriptionDetails.forEach((prescriptionDetail) => {
      prescriptionDetail.prescription = null;
      prescriptionDetail.prescription_id = curPrescription.value.id;
      delete prescriptionDetail.therapeuticRegimen['prescriptionDetails'];
      delete prescriptionDetail.therapeuticRegimen['drugs'];
      delete prescriptionDetail.therapeuticLine['prescriptionDetails'];
    });
    curPrescriptionDetail.value = curPrescription.value.prescriptionDetails[0];
    curPack.value.packDate = lastPack.value.nextPickUpDate;
    curPack.value.pickupDate = lastPack.value.nextPickUpDate;
    curPack.value.packagedDrugs = lastPack.value.packagedDrugs;
    curPack.value.weeksSupply = lastPack.value.weeksSupply;
    curPack.value.syncStatus = 'N';
    curPack.value.clinic = patient.value.clinic;
    curPack.value.clinic_id = patient.value.clinic_id;
    curPatientVisitDetail.value.patient_visit_id = curPatientVisit.value.id;
    curPatientVisitDetail.value.clinic_id = patient.value.clinic_id;
    curPatientVisitDetail.value.clinic = patient.value.clinic;
    curPatientVisitDetail.value.pack_id = curPack.value.id;
    curPatientVisitDetail.value.pack = curPack.value;
    curPatientVisitDetail.value.prescription = curPrescription.value;
    curPatientVisitDetail.value.prescription_id = curPrescription.value.id;
    curPatientVisitDetail.value.episode = lastStartEpisode.value;
    curPatientVisitDetail.value.episode_id = lastStartEpisode.value.id;

    showServiceDrugsManagement.value = true;
  }
};

const validateForm = () => {
  let lastPack4daysAdd = date.addToDate(
    getDateFromHyphenDDMMYYYY(prescriptionDate.value, 'YYYY-MM-DD'),
    {
      days: 4,
    }
  );
  if (hasTherapeuticalRegimen.value) {
    therapeuticRegimenRef.value.validate();
  }
  if (hasTherapeuticalLine.value) {
    therapeuticLineRef.value.validate();
  }
  if (curPrescriptionDetail.value.spetialPrescription) {
    spetialMotiveRef.value.validate();
  }
  durationRef.value.validate();
  doctorRef.value.validate();
  patientStatusRef.value.validate();
  dispenseTypeRef.value.validate();
  if (
    !patientStatusRef.value.hasError &&
    !durationRef.value.hasError &&
    !doctorRef.value.hasError &&
    !dispenseTypeRef.value.hasError
  ) {
    if (
      !isValidDate(String(getDateFromHyphenDDMMYYYY(prescriptionDate.value)))
    ) {
      alertError('A data da prescrição é inválida.');
    } else if (
      lastStartEpisode.value === null ||
      lastStartEpisode.value === undefined
    ) {
      alertError(
        'Nenhuma prescrição não deve ser criada sem um Histórico clínico.'
      );
    } else if (
      getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(prescriptionDate.value)) <
      getYYYYMMDDFromJSDate(lastStartEpisode.value.episodeDate)
    ) {
      alertError(
        'A data da prescrição não deve ser anterior a data de inicio do tratamento no sector corrente'
      );
    } else if (
      curPrescriptionDetail.value.spetialPrescription &&
      spetialMotiveRef.value.hasError
    ) {
      alertError(
        'Selecionou a Prescrição especial, neste caso deve indicar o motivo'
      );
    } else if (
      getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(prescriptionDate.value)) >
      getYYYYMMDDFromJSDate(moment())
    ) {
      alertError(
        'A data da prescrição indicada é maior que a data da corrente'
      );
    } else if (curPrescription.value.prescribedDrugs.length === 0) {
      alertError('A Prescrição deve ter pelo menos um medicamento prescrito');
    } else if (lastPack.value !== null && lastPack.value !== undefined) {
      if (
        lastPack.value.nextPickUpDate > lastPack4daysAdd &&
        !curPrescriptionDetail.value.spetialPrescription
      ) {
        alertError(
          'Paciente tem medicamento em casa, Caso queira dispensar seleccione a prescrição como especial'
        );
      } else {
        allGoodvalidatedForm();
      }
    } else {
      allGoodvalidatedForm();
    }
  }
};

const allGoodvalidatedForm = () => {
  curPrescription.value.leftDuration = remainigDuration(curPrescription.value);

  curPrescription.value.prescriptionDetails = [];
  curPrescription.value.prescriptionDate = getDateFromHyphenDDMMYYYY(
    prescriptionDate.value
  );
  curPrescription.value.prescribedDrugs.forEach((prescribedDrug) => {
    prescribedDrug.prescription = null;
    prescribedDrug.prescription_id = null;
  });
  curPrescription.value.prescriptionDetails.push(curPrescriptionDetail.value);

  curPrescription.value.prescriptionDetails.forEach((prescriptionDetail) => {
    prescriptionDetail.prescription = null;
    prescriptionDetail.prescription_id = null;
    delete prescriptionDetail.therapeuticRegimen['prescriptionDetails'];
    delete prescriptionDetail.therapeuticRegimen['drugs'];
    delete prescriptionDetail.therapeuticLine['prescriptionDetails'];
  });
  curPrescription.value.clinic = patient.value.clinic;
  curPrescription.value.clinic_id = patient.value.clinic_id;

  curPack.value.clinic = patient.value.clinic;
  curPack.value.clinic_id = patient.value.clinic_id;
  curPack.value.syncStatus = 'N';
  curPack.value.packagedDrugs = [];

  curPatientVisitDetail.value.patient_visit_id = curPatientVisit.value.id;
  // curPatientVisitDetail.value.patientVisit = curPatientVisit.value;
  curPatientVisitDetail.value.clinic_id = patient.value.clinic_id;
  curPatientVisitDetail.value.clinic = patient.value.clinic;
  curPatientVisitDetail.value.pack_id = curPack.value.id;
  curPatientVisitDetail.value.pack = curPack.value;
  curPatientVisitDetail.value.prescription = curPrescription.value;
  curPatientVisitDetail.value.prescription_id = curPrescription.value.id;
  curPatientVisitDetail.value.episode = lastStartEpisode.value;
  curPatientVisitDetail.value.episode_id = lastStartEpisode.value.id;

  addPackagedDrugs();
  showServiceDrugsManagement.value = true;
};

const addPackagedDrugs = () => {
  curPrescription.value.prescribedDrugs.forEach((prescribedDrug) => {
    let packagedDrug = new PackagedDrug();
    packagedDrug.drug = prescribedDrug.drug;
    packagedDrug.drug_id = prescribedDrug.drug.id;
    packagedDrug.amtPerTime = prescribedDrug.amtPerTime;
    packagedDrug.timesPerDay = prescribedDrug.timesPerDay;
    packagedDrug.form = prescribedDrug.form;

    curPack.value.packagedDrugs.push(packagedDrug);
  });
};
const generatePacks = (packagedDrug) => {
  const packagedDrugStocks = [];

  let quantitySupplied = packagedDrug.quantitySupplied;

  const stocks = StockService.getValidStockByDrugAndPickUpDate(
    packagedDrug.drug.id,
    getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(curPack.value.pickupDate))
  );

  let i = 0;
  while (quantitySupplied > 0) {
    const packagedDrugStock = new PackagedDrugStock();

    if (stocks[i].stockMoviment >= quantitySupplied) {
      quantitySupplied = 0;
      packagedDrugStock.quantitySupplied = packagedDrug.quantitySupplied;
    } else {
      quantitySupplied = Number(quantitySupplied - stocks[i].stockMoviment);
      packagedDrugStock.quantitySupplied = stocks[i].stockMoviment;

      i = i + 1;
    }
    packagedDrugStock.drug = packagedDrug.drug;
    packagedDrugStock.drug_id = packagedDrug.drug.id;
    packagedDrugStock.stock = stocks[i];
    packagedDrugStock.stock_id = stocks[i].id;
    packagedDrugStock.creationDate = moment().format('YYYY-MM-DD');
    packagedDrugStocks.push(packagedDrugStock);
  }
  packagedDrug.packagedDrugStocks = packagedDrugStocks;
};

const addPatientVisitDetail = () => {
  let indexToRemove = [];
  let pickupDate4daysAdd = date.addToDate(
    curPatientVisitDetail.value.pack.pickupDate,
    {
      days: 4,
    }
  );
  curPatientVisitDetail.value.pack.packagedDrugs.forEach((packageDrug) => {
    if (
      !checkStock(packageDrug, curPatientVisitDetail.value.pack.weeksSupply)
    ) {
      const i = curPatientVisitDetail.value.pack.packagedDrugs.indexOf(
        packageDrug.id
      );
      indexToRemove.push(i);
    } else {
      console.log(packageDrug.quantitySupplied);
      if (Number(packageDrug.quantitySupplied) <= 0) {
        indexToRemove.push(packageDrug);
      } else {
        generatePacks(packageDrug);
      }
    }
  });

  if (indexToRemove.length > 0) {
    alertError(
      ' Exitem medicamentos sem stock ou sem quantidade por dispensar na lista. Por favor, remova'
    );
  } else if (
    Number(curPatientVisitDetail.value.pack.weeksSupply / 4) >
    remainigDuration(curPatientVisitDetail.value.prescription)
  ) {
    alertError(
      'O Período para o qual pretende efectuar a dispensa é maior que o período remanescente nesta prescrição [' +
        remainigDuration(curPatientVisitDetail.value.prescription) +
        ' mes(es)]'
    );
  } else if (curPatientVisitDetail.value.pack.packagedDrugs.length === 0) {
    alertError('Deve ter pelo menos um medicamento para efectuar a dispensa');
  } else if (Number(curPatientVisitDetail.value.pack.weeksSupply) <= 0) {
    alertError(
      'Por favor indicar o período para o qual pretende efectuar a dispensa de medicamento' +
        props.identifier.service.code
    );
  } else if (
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.pickupDate) >
    getYYYYMMDDFromJSDate(moment())
  ) {
    alertError('A data de levantamento indicada é maior que a data corrente');
  } else if (lastPack.value !== null && lastPack.value !== undefined) {
    if (
      getYYYYMMDDFromJSDate(lastPack.value.nextPickUpDate) >
      getYYYYMMDDFromJSDate(pickupDate4daysAdd)
    ) {
      alertWarningAction(
        'O paciente ainda possui medicamentos em casa provenientes da ultima dispensa, ' +
          'O sistema pode ajustar a data do proximo levantamento desta dispensa tendo em conta os medicamentos citados?'
      ).then((result) => {
        if (result) {
          const pickUpDiferrence = moment(lastPack.value.nextPickUpDate).diff(
            moment(curPatientVisitDetail.value.pack.pickupDate),
            'days'
          );
          if (pickUpDiferrence > 0) {
            curPatientVisitDetail.value.pack.nextPickUpDate = moment(
              curPatientVisitDetail.value.pack.nextPickUpDate,
              'YYYY-MM-DD'
            )
              .add('d', pickUpDiferrence)
              .toDate();
          }
          allGoodValidatatedDispense();
        } else {
          allGoodValidatatedDispense();
        }
      });
    } else {
      allGoodValidatatedDispense();
    }
  } else {
    allGoodValidatatedDispense();
  }
};
const allGoodValidatatedDispense = () => {
  validateDispense.value = true;
  curPrescription.value.leftDuration = Number(
    (Number(curPrescription.value.duration.weeks) -
      Number(curPack.value.weeksSupply)) /
      4
  );
  curPatientVisit.value.visitDate = curPrescription.value.prescriptionDate;
  curPatientVisitDetail.value.prescription = curPrescription.value;
  curPatientVisit.value.patientVisitDetails.push(curPatientVisitDetail.value);
};

const removePatientVisitDetail = () => {
  validateDispense.value = false;
  const i = curPatientVisit.value.patientVisitDetails
    .map((toRemove) => toRemove.id)
    .indexOf(curPatientVisitDetail.value.id);
  curPatientVisit.value.patientVisitDetails.splice(i, 1);
};

const setRelationIdentifiers = () => {
  let packDateError = false;
  this.patientVisit.clinic_id = this.patientVisit.clinic.id;
  //  this.patientVisit.visitDate = this.patientVisit.patientVisitDetails[0].prescription.prescriptionDate
  this.patientVisit.patient_id = this.patientVisit.patient.id;
  if (this.mobile) {
    if (this.patientVisit.syncStatus === 'S' && this.isEditPackStep) {
      this.patientVisit.syncStatus = 'U';
    } else {
      this.patientVisit.syncStatus = 'R';
    }
  }
  this.patientVisit.patientVisitDetails.forEach((tempPvd) => {
    const pvd = new PatientVisitDetails(JSON.parse(JSON.stringify(tempPvd)));
    if (pvd.episode.startStopReason === null)
      pvd.episode.startStopReason = StartStopReason.find(
        pvd.episode.startStopReason_id
      );
    if (pvd.episode.episodeType === null)
      pvd.episode.episodeType = EpisodeType.find(pvd.episode.episodeType_id);
    if (pvd.episode.clinicSector === null)
      pvd.episode.clinicSector = ClinicSector.find(pvd.episode.clinicSector_id);
    pvd.episode_id = pvd.episode.id;
    pvd.clinic_id = pvd.clinic.id;
    pvd.patient_visit_id = this.patientVisit.id;
    pvd.prescription_id = pvd.prescription.id;
    pvd.pack_id = pvd.pack.id;
    //       pvd.pack.pickupDate = this.patientVisit.patientVisitDetails[0].prescription.prescriptionDate
    //      pvd.pack.nextPickUpDate = this.patientVisit.patientVisitDetails[0].prescription.prescriptionDate
    if (
      pvd.prescription.syncStatus === '' ||
      (pvd.prescription.syncStatus === 'R' && this.isEditPackStep)
    ) {
      pvd.prescription.syncStatus = 'R';
    } else if (pvd.prescription.syncStatus === 'S' && this.isEditPackStep) {
      pvd.prescription.syncStatus = 'U';
    }
    if (pvd.prescription.doctor.clinic === null) {
      pvd.prescription.doctor.clinic = pvd.clinic;
    }
    pvd.prescription.doctor_id = pvd.prescription.doctor.id;
    pvd.prescription.clinic_id = pvd.prescription.clinic.id;
    pvd.prescription.duration_id = pvd.prescription.duration.id;
    pvd.prescription.prescriptionDetails[0].prescription_id =
      pvd.prescription.id;
    pvd.prescription.prescriptionDetails[0].therapeutic_line_id =
      pvd.prescription.prescriptionDetails[0].therapeuticLine.id;
    if (pvd.prescription.prescriptionDetails[0].therapeuticRegimen !== null) {
      pvd.prescription.prescriptionDetails[0].therapeutic_regimen_id =
        pvd.prescription.prescriptionDetails[0].therapeuticRegimen.id;
    }
    pvd.prescription.prescriptionDetails[0].dispense_type_id =
      pvd.prescription.prescriptionDetails[0].dispenseType.id;
    if (
      pvd.prescription.prescriptionDetails[0].spetialPrescriptionMotive !== null
    ) {
      pvd.prescription.prescriptionDetails[0].spetialPrescriptionMotive_id =
        pvd.prescription.prescriptionDetails[0].spetialPrescriptionMotive.id;
    }
    pvd.prescription.prescribedDrugs.forEach((pDrug) => {
      pDrug.prescription_id = pvd.prescription.id;
      pDrug.drug_id = pDrug.drug.id;
    });
    pvd.pack.dispenseMode_id = pvd.pack.dispenseMode.id;
    pvd.pack.clinic_id = pvd.pack.clinic.id;
    pvd.pack.packagedDrugs.forEach((pDrug) => {
      pDrug.pack_id = pvd.pack.id;
      pDrug.drug_id = pDrug.drug.id;
      pDrug.packagedDrugStocks.forEach((pDrugStock) => {
        pDrugStock.pack_id = pvd.pack.id;
        pDrugStock.drug_id = pDrugStock.drug.id;
        pDrugStock.stock_id = pDrugStock.stock.id;
        pDrugStock.packagedDrug_id = pDrug.id;
      });
    });
    if (this.isNewPackStep) {
      pvd.prescription.leftDuration = Number(
        (Number(pvd.prescription.leftDuration * 4) -
          Number(tempPvd.pack.weeksSupply)) /
          4
      );
    } else {
      pvd.prescription.leftDuration = Number(
        (Number(pvd.prescription.duration.weeks) -
          Number(tempPvd.pack.weeksSupply)) /
          4
      );
    }
    if (this.lastPackFull !== null && !this.isEditPackStep) {
      const pickUpDiferrence = moment(this.lastPackFull.nextPickUpDate).diff(
        moment(pvd.pack.pickupDate),
        'days'
      );
      if (pickUpDiferrence > 0) {
        packDateError = true;
        this.msgObject.patientVDetails = pvd;
        this.msgObject.patientVisit = this.patientVisit;
        this.msgObject.nextPickUpDate = moment(
          pvd.pack.nextPickUpDate,
          'YYYY-MM-DD'
        )
          .add('d', pickUpDiferrence)
          .toDate();
        this.displayAlert(
          'YesNo',
          'O paciente ainda possui medicamentos em casa provenientes da ultima dispensa, O sistema pode ajustar a data do proximo levantamento desta dispensa tendo em conta os medicamentos citados?'
        );
      }
    }
    // tempPvd = pvd
    const index = this.patientVisit.patientVisitDetails.findIndex(
      (o) => o.pack.id === tempPvd.pack.id
    );
    this.patientVisit.patientVisitDetails.splice(index, 1, pvd);
  });
  return packDateError;
};

const addPrescribedDrug = (prescribedDrug) => {
  const prescribedDrugExists = curPrescription.value.prescribedDrugs.some(
    (item) => {
      return item.drug.id === prescribedDrug.drug.id;
    }
  );

  if (!prescribedDrugExists) {
    const hasStock = checkStock(prescribedDrug);

    if (hasStock) {
      if (
        getQtyPrescribed(
          prescribedDrug,
          curPrescription.value.duration.weeks
        ) <= 0
      ) {
        alertError(
          'Quantidade de Medicamento superior ao solicitado! \n O frasco seleccionado possui quantidade de medicamento superior ao necessário para cobrir o período de dispensa indicado.'
        );
      } else {
        addMedication(prescribedDrug);
      }
    } else {
      alertInfo(
        'O medicamento seleccionado não possui stock suficiente para dispensar até a data da prescrição.'
      );
      addMedication(prescribedDrug);
    }
  } else {
    alertError(
      'O medicamento seleccionado ja existe na lista dos medicamentos prescritos.'
    );
  }
};

const addMedication = (prescribedDrug) => {
  showAddEditDrug.value = false;
  // if (!this.visitDetails.createPackLater)
  //   prescribedDrug.nextPickUpDate = this.nextPUpDate;
  curPrescription.value.prescribedDrugs.push(
    new PrescribedDrug(prescribedDrug)
  );
};

const checkStock = (prescribedDrug) => {
  let qtyInStock = 0;
  const qtyPrescribed = getQtyPrescribed(
    prescribedDrug,
    curPack.value.weeksSupply
  );

  const validStock = StockService.getValidStockByDrugAndPickUpDate(
    prescribedDrug.drug.id,
    getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(prescriptionDate.value))
  );

  if (validStock.length <= 0) {
    return false;
  } else {
    validStock.forEach((item) => {
      qtyInStock = Number(qtyInStock + item.stockMoviment);
    });
    if (qtyInStock < qtyPrescribed) {
      return false;
    } else {
      return true;
    }
  }
};

const deleteRow = (row) => {
  const i = curPrescription.value.prescribedDrugs
    .map((toRemove) => toRemove.id)
    .indexOf(row.id); // find index of your object
  curPrescription.value.prescribedDrugs.splice(i, 1);
};

const filterFnspetialPrescriptionMotives = (val, update, abort) => {
  const stringOptions = spetialPrescriptionMotives;
  if (val === '') {
    update(() => {
      optionsspetialPrescriptionMotives.value = stringOptions.value.map(
        (spetialPrescriptionMotive) => spetialPrescriptionMotive
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      optionsspetialPrescriptionMotives.value = [];
    });
  } else {
    update(() => {
      optionsspetialPrescriptionMotives.value = stringOptions.value
        .map((spetialPrescriptionMotive) => spetialPrescriptionMotive)
        .filter((spetialPrescriptionMotive) => {
          return (
            spetialPrescriptionMotive &&
            spetialPrescriptionMotive.description
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFntherapeuticRegimens = (val, update, abort) => {
  const stringOptions = therapeuticRegimens.value;
  if (val === '') {
    update(() => {
      optionstherapeuticRegimens.value = stringOptions.map(
        (therapeuticRegimen) => therapeuticRegimen
      );
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      optionstherapeuticRegimens.value = [];
    });
  } else {
    update(() => {
      optionstherapeuticRegimens.value = stringOptions
        .map((therapeuticRegimen) => therapeuticRegimen)
        .filter((therapeuticRegimen) => {
          return (
            therapeuticRegimen &&
            therapeuticRegimen.description
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFntherapeuticLines = (val, update, abort) => {
  const stringOptions = therapeuticLines;
  if (val === '') {
    update(() => {
      optionstherapeuticLines.value = stringOptions.value.map(
        (therapeuticLine) => therapeuticLine
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      optionstherapeuticLines.value = [];
    });
  } else {
    update(() => {
      optionstherapeuticLines.value = stringOptions.value
        .map((therapeuticLine) => therapeuticLine)
        .filter((therapeuticLine) => {
          return (
            therapeuticLine &&
            therapeuticLine.description
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFndurations = (val, update, abort) => {
  const stringOptions = durations;
  if (val === '') {
    update(() => {
      optionsdurations.value = stringOptions.value.map((duration) => duration);
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      optionsdurations.value = [];
    });
  } else {
    update(() => {
      optionsdurations.value = stringOptions.value
        .map((duration) => duration)
        .filter((duration) => {
          return (
            duration &&
            duration.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFndoctors = (val, update, abort) => {
  const stringOptions = doctors;
  if (val === '') {
    update(() => {
      optionsdoctors.value = stringOptions.value.map((doctor) => doctor);
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      optionsdoctors.value = [];
    });
  } else {
    update(() => {
      optionsdoctors.value = stringOptions.value
        .map((doctor) => doctor)
        .filter((doctor) => {
          return (
            doctor &&
            doctor.description.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFnreasonsForUpdate = (val, update, abort) => {
  const stringOptions = reasonsForUpdate.value;
  if (val === '') {
    update(() => {
      optionsreasonsForUpdate.value = stringOptions.map(
        (reasonForUpdate) => reasonForUpdate
      );
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      optionsreasonsForUpdate.value = [];
    });
  } else {
    update(() => {
      optionsreasonsForUpdate.value = stringOptions
        .map((reasonForUpdate) => reasonForUpdate)
        .filter((reasonForUpdate) => {
          return (
            reasonForUpdate &&
            reasonForUpdate.description
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFndispenseTypes = (val, update, abort) => {
  const stringOptions = dispenseTypes.value;
  if (val === '') {
    update(() => {
      optionsdispenseTypes.value = stringOptions.map(
        (dispenseType) => dispenseType
      );
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      optionsdispenseTypes.value = [];
    });
  } else {
    update(() => {
      optionsdispenseTypes.value = stringOptions
        .map((dispenseType) => dispenseType)
        .filter((dispenseType) => {
          return (
            dispenseType &&
            dispenseType.description
              .toLowerCase()
              .indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
const filterFnpatientStatus = (val, update, abort) => {
  const stringOptions = patientStatusOption.value;
  if (val === '') {
    update(() => {
      optionspatientStatus.value = stringOptions.map(
        (patientStat) => patientStat
      );
    });
  } else if (stringOptions.value.length === 0) {
    update(() => {
      optionspatientStatus.value = [];
    });
  } else {
    update(() => {
      optionspatientStatus.value = stringOptions.value
        .map((patientStat) => patientStat)
        .filter((patientStat) => {
          return (
            patientStat &&
            patientStat.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};

// Hook
onMounted(() => {
  init();
});

//Provide
provide('curPatientVisit', curPatientVisit);
provide('curPrescription', curPrescription);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('curPatientVisitDetail', curPatientVisitDetail);
provide('curPack', curPack);
provide('durations', durations);
provide('hasTherapeuticalRegimen', hasTherapeuticalRegimen);
provide('curIdentifier', props.identifier);
provide('showAddEditDrug', showAddEditDrug);
provide('addPrescribedDrug', addPrescribedDrug);
provide('validateDispense', validateDispense);
provide('addPatientVisitDetail', addPatientVisitDetail);
provide('removePatientVisitDetail', removePatientVisitDetail);
</script>

<style lang="scss">
.prescription-box {
  border: 1px solid $grey-4;
}
.box-border {
  border: 1px solid $grey-4;
}
</style>
