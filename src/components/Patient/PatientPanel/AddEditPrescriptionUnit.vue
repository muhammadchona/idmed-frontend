<template>
  <div
    v-if="isMobile && showServiceDrugsManagement"
    class="tablet-validated-prescription-summary"
  >
    <div class="tablet-summary-fields">
      <div><small>Data</small><strong>{{ prescriptionDate }}</strong></div>
      <div v-if="hasTherapeuticalRegimen">
        <small>Regime</small>
        <strong>{{ curPrescriptionDetail.therapeuticRegimen?.description }}</strong>
      </div>
      <div v-if="hasTherapeuticalLine">
        <small>Linha</small>
        <strong>{{ curPrescriptionDetail.therapeuticLine?.description }}</strong>
      </div>
      <div>
        <small>Duração</small>
        <strong>{{ curPrescription.duration?.description }}</strong>
      </div>
      <div>
        <small>Clínico</small>
        <strong>{{ curPrescription.doctor?.fullName }}</strong>
      </div>
    </div>
    <q-btn
      unelevated
      dense
      color="red"
      :disable="validateDispense || !isNewPrescription"
      label="Invalidar Prescrição"
      @click="restorePrescriptionForm"
    />
  </div>
  <div
    v-show="!isMobile || !showServiceDrugsManagement"
    class="box-border"
    :class="{ 'tablet-prescription-unit': isMobile }"
  >
    <div
      v-memo="[getPrescriptionFormMemoToken()]"
      class="q-ma-md prescription-unit-body"
    >
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
          @update:model-value="curPrescription.prescribedDrugs = []"
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
          class="prescribed-drugs-table"
          flat
          bordered
          dense
          hide-bottom
          :rows="prescribedDrugRows"
          :columns="columns"
          row-key="id"
        >
          <template #body="props">
            <q-tr no-hover :props="props">
              <q-td key="drug" :props="props">
                {{ props.row.displayName }}
              </q-td>
              <q-td key="dosage" :props="props">
                {{ props.row.displayDosage }}
              </q-td>
              <q-td auto-width key="packs" :props="props">
                {{ props.row.displayQuantity }}
                <em>{{ props.row.displayQuantityUnit }}</em>
              </q-td>
              <q-td auto-width key="packs" :props="props">
                <em>{{ props.row.displayRemaining }}</em>
              </q-td>
              <q-td key="options" :props="props">
                <q-btn
                  flat
                  round
                  color="red"
                  icon="delete"
                  :disable="showServiceDrugsManagement || !isNewPrescription"
                  @click="deleteRow(props.row.source)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-separator color="grey-13" size="1px" class="q-mb-sm" />
      </div>
      <template v-if="secondaryControlsReady">
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
        <div>
          <q-select
            v-if="
              hasPrescriptionChangeMotive &&
              String(curPrescription.patientType).includes('Alterar')
            "
            :hint="reasonOutroSelected ? reasonPlaceholder : ''"
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
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-if="scope.opt === 'Outro'">
                <q-item-section>
                  <q-item-label>{{ scope.opt }} </q-item-label>
                </q-item-section>

                <q-item-section avatar>
                  <q-icon name="edit"> </q-icon>
                </q-item-section>
              </q-item>

              <q-item v-bind="scope.itemProps" v-else>
                <q-item-section>
                  <q-item-label>{{ scope.opt }} </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <div
            class="cursor-pointer"
            v-if="
              reasonOutroSelected &&
              String(curPrescription.patientType).includes('Alterar')
            "
          >
            <q-btn
              class="glossy"
              size="sm"
              color="primary"
              label="Indicar Motivo"
            >
              <q-popup-edit
                transition-show="flip-up"
                transition-hide="flip-down"
                class="shadow-up-21 shadow-24"
                v-model="curPrescriptionDetail.reasonForUpdateDesc"
                :cover="false"
                fit
                buttons
                label-set="OK"
                label-cancel="Cancelar"
                :offset="[0, -130]"
                v-slot="scope"
              >
                <q-input
                  color="primary"
                  v-model="scope.value"
                  label="Descricão Outro Motivo"
                  dense
                  autofocus
                  @keyup.enter="scope.set"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit" color="primary"></q-icon>
                  </template>
                </q-input>
              </q-popup-edit>
            </q-btn>
          </div>
        </div>
        <q-select
          class="col q-mr-sm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          dense
          outlined
          :disable="
            showServiceDrugsManagement ||
            !isNewPrescription ||
            selectedMember != null
          "
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

      <div class="row">
        <div class="col-4"></div>
        <div class="col-4">
          <q-file
            v-model="attachedPrescription"
            name="poster_file"
            ref="fileInput"
            label=""
            square
            flat
            outlined
            use-chips
            accept=".jpg,.png,.gif,.pdf"
            max-file-size="5120000"
          >
            <template v-slot:append>
              <q-btn
                color="primary"
                @click="triggerFileInput"
                icon="attach_file"
              />
              <camera-dialog
                v-model="showCamera"
                @image-captured="handleImageCaptured"
              ></camera-dialog>
            </template>
          </q-file>
        </div>

        <!-- Display captured image if available -->
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
          @click="restorePrescriptionForm"
        />
      </div>
      </template>
      <div
        v-else
        class="row items-center justify-center q-pa-md text-grey-7"
      >
        <q-spinner color="primary" size="2em" />
      </div>
    </div>
  </div>
  <div
    class=""
    v-if="
      secondaryControlsReady &&
      ((showServiceDrugsManagement && selectedMember == null) ||
        (!isNewPrescription && selectedMember == null))
    "
  >
    <div>
      <ServiceDrugsManagement />
    </div>
  </div>
  <q-dialog v-if="showAddEditDrug" persistent v-model="showAddEditDrug">
    <AddEditPrescribedDrug />
  </q-dialog>
</template>

<script setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue';
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
//import { usePackagedDrugs } from 'src/composables/packaging/packagedDrugMethods';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';
import drugService from 'src/services/api/drugService/drugService';
import { useDrug } from 'src/composables/drug/drugMethods';
import clinicService from 'src/services/api/clinicService/clinicService';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import pocPrescriptionLogService from 'src/services/api/pocPrescriptionLog/pocPrescriptionLogService';
import CameraDialog from '../PatientPanel/UploadPicture.vue';

const { isMobile, isOnline } = useSystemUtils();
//props
const props = defineProps(['identifier']);
const showCamera = ref(false);
// Declaration
const {
  extractHyphenDateFromDMYConvertYMD,
  isValidDate,
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
} = useDateUtils();
const { preferedIdentifierValue, fullName } = usePatient();
const { lastVisitPrescription } = usePatientServiceIdentifier();
const { alertSucess, alertError, alertInfo, alertWarningAction, alertWarning } =
  useSwal();
const { getQtyPrescribed } = usePrescribedDrug();
const { remainigDuration } = usePrescription();
const { getQtyRemain } = usePrescribedDrug();
const { getDrugFirstLevelById } = useDrug();

const expanded = ref(false);
const submittingPrescribedDrug = reactive(ref(false));
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
const label = ref('Click me');
// New Values
const curPrescription = ref(new Prescription({ id: uuidv4() }));
const curPrescriptionDetail = ref(new PrescriptionDetail({ id: uuidv4() }));
const curPatientVisitDetail = ref(new PatientVisitDetails({ id: uuidv4() }));
const curPack = ref(new Pack({ id: uuidv4() }));
const validateDispense = ref(false);
const submittingValidateDispense = ref(false);
const reasonsForUpdate = ref(['Falência Terapeutica', 'Alergia', 'Outro']);
const patientStatusOption = ref(['Inicio', 'Manutenção']);
const showServiceDrugsManagement = ref(false);
const showAddEditDrug = ref(false);
const secondaryControlsReady = ref(!isMobile.value);
const mobileFormRenderFrozen = ref(false);
const frozenPrescriptionFormMemoToken = {};
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
const msgObject = ref({});
const other = ref(false);
const fileInput = ref(null);
const defaultDate = ref('1900-01-01');
const attachedPrescription = ref(null);
const columns = [
  {
    name: 'drug',
    align: 'left',
    field: (row) => row.displayName,
    label: 'Medicamento',
    sortable: true,
  },
  {
    name: 'dosage',
    align: 'left',
    field: (row) => row.displayDosage,
    label: 'Toma',
    sortable: false,
  },
  {
    name: 'packs',
    align: 'center',
    style: 'width: 20px',
    field: (row) => row.displayQuantity,
    label: 'Quantidade',
    sortable: false,
  },
  {
    name: 'packs',
    align: 'center',
    style: 'width: 20px',
    field: (row) => row.displayRemaining,
    label: 'Sobra',
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
const selectedMember = inject('selectedMember');
let quantityRemainAux = 0;

const showEdit = () => {
  reasonOutroSelected.value = true;
};

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

const reasonOutroSelected = computed(() => {
  return curPrescriptionDetail.value.reasonForUpdate === 'Outro';
});

const reasonPlaceholder = computed(() => {
  return curPrescriptionDetail.value.reasonForUpdateDesc;
});

const hasPrescriptionChangeMotive = computed(() => {
  const result = clinicalServiceAttributeService.checkWeatherAttExist(
    props.identifier.service.id,
    'PRESCRIPTION_CHANGE_MOTIVE'
  );
  return result;
});
const therapeuticRegimens = computed(() => {
  const clinicalServiceData =
    clinicalServiceService.getClinicalServicePersonalizedById(
      props.identifier.service.id
    );
  if (!clinicalServiceData || !clinicalServiceData.therapeuticRegimens) {
    return therapeuticalRegimenService.getAllTherapeuticalByclinicalService(
      props.identifier.service.id
    );
  }
  return clinicalServiceData.therapeuticRegimens;
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
const prescribedDrugRows = computed(() => {
  const weeks = curPrescription.value.duration?.weeks;
  return (curPrescription.value.prescribedDrugs ?? []).map((source) => {
    const drugId = source.drug.id;
    const drug = getDrugById(drugId);
    const firstLevelDrug = getDrugFirstLevelById(drugId);
    const form = firstLevelDrug.form;
    const formPrefix = String(form.description).substring(0, 4);
    const quantity = getQtyPrescribed(source, weeks);
    const remaining = getQtyRemain(source, weeks);
    const isTarv = firstLevelDrug.clinicalService.code === 'TARV';

    return {
      id: source.id,
      source,
      displayName: drug
        ? drug.name.includes(formPrefix)
          ? drug.name
          : `${drug.name} - (${drug.packSize} ${formPrefix})`
        : '',
      displayDosage: drug
        ? `${form.howToUse} ${source.amtPerTime}   ${form.unit} - ${source.timesPerDay} vez(es) por ${source.form}`
        : '',
      displayQuantity: quantity > 0 ? quantity : 1,
      displayQuantityUnit: isTarv ? 'Frasco(s)' : `${form.description}(s)`,
      displayRemaining: isTarv
        ? `${Math.floor(remaining / source.drug.packSize)} Frasco(s) e ${remaining} ${form.unit}`
        : `${Math.floor(remaining / source.drug.packSize)} ${form.description}(s)`,
    };
  });
});
const mobilePrescriptionContext = shallowRef(null);
const lastStartEpisode = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastStartEpisode ?? null;
  }
  return episodeService.getLastStartEpisodeForPrescription(props.identifier.id);
});
const lastRefferalEpisode = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastRefferalEpisode ?? null;
  }
  return episodeService.getLastRefferalEpisodeForPrescription(
    props.identifier.id
  );
});
const lastPatientVisit = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastPatientVisit ?? null;
  }
  const listPatietVisitIds = [];
  if (lastStartEpisode.value !== null && lastStartEpisode.value !== undefined) {
    const listPatietVisitDetails =
      patientVisitDetailsService.getAllPatientVisitDetailsFromEpisode(
        lastStartEpisode.value.id
      );

    if (
      listPatietVisitDetails !== null &&
      listPatietVisitDetails !== undefined &&
      listPatietVisitDetails.length !== 0
    ) {
      listPatietVisitDetails.forEach((patientvisitdetails) => {
        listPatietVisitIds.push(patientvisitdetails.patient_visit_id);
      });
    } else {
      const listPatientVisits = patientVisitService.getAllFromPatient(
        patient.value.id
      );
      listPatientVisits.forEach((patientvisit) => {
        listPatietVisitIds.push(patientvisit.id);
      });
    }
    return patientVisitService.getLastFromPatientVisitListWithoutRelations(
      listPatietVisitIds
    );
  } else {
    return null;
  }
});

const lastPatientVisitDetails = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastPatientVisitDetails ?? null;
  }
  if (lastPatientVisit.value !== null && lastPatientVisit.value !== undefined) {
    const lastPatientVisitDetailsFromEpisode =
      patientVisitDetailsService.getPrescriptionContextFromPatientVisitAndEpisode(
        lastPatientVisit.value.id,
        lastStartEpisode.value.id
      );
    if (
      lastPatientVisitDetailsFromEpisode === null ||
      lastPatientVisitDetailsFromEpisode === undefined
    ) {
      const patientVisitsDetailsByIdentifier =
        patientVisitDetailsService.hasFromPatientAndClinicService(
          patient.value.id,
          props.identifier.service.id
        );
      if (
        patientVisitsDetailsByIdentifier !== null &&
        patientVisitsDetailsByIdentifier !== undefined
      ) {
        return patientVisitDetailsService.getPrescriptionContextFromPatientVisit(
          lastPatientVisit.value.id
        );
      } else {
        return null;
      }
    } else {
      return lastPatientVisitDetailsFromEpisode;
    }
  } else {
    return null;
  }
});

const lastLog = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastLog ?? null;
  }
  return pocPrescriptionLogService.getLastPrescriptionLogByPatientIdAndClinicalServiceId(
    patient.value.id,
    props.identifier.service.id
  );
});

const lastPrescription = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastPrescription ?? null;
  }
  if (lastLog.value && lastLog.value.prescription) {
    return lastLog.value.prescription;
  }
  if (
    lastPatientVisitDetails.value !== null &&
    lastPatientVisitDetails.value !== undefined
  ) {
    return lastPatientVisitDetails.value.prescription;
  } else {
    return null;
  }
});

const patientServiceIdentifierFromEpisode = computed(() => {
  if (isMobile.value) {
    return (
      mobilePrescriptionContext.value?.patientServiceIdentifierFromEpisode ??
      null
    );
  }
  if (
    lastPatientVisitDetails.value !== null &&
    lastPatientVisitDetails.value !== undefined
  ) {
    return episodeService.getEpisodeById(
      lastPatientVisitDetails.value.episode.id
    );
  } else {
    return null;
  }
});

const lastPack = computed(() => {
  if (isMobile.value) {
    return mobilePrescriptionContext.value?.lastPack ?? null;
  }
  if (lastPrescription.value !== null && lastPrescription.value !== undefined) {
    if (
      lastPatientVisitDetails.value?.prescription?.id ===
        lastPrescription.value.id &&
      lastPatientVisitDetails.value?.pack
    ) {
      return lastPatientVisitDetails.value.pack;
    }
    return packService.getLastPackFromPatientVisitAndPrescription(
      lastPrescription.value.id
    );
  } else {
    return null;
  }
});

const prepareMobilePrescriptionContext = () => {
  const context = {
    lastStartEpisode:
      episodeService.getLastStartEpisodeForPrescription(props.identifier.id),
    lastRefferalEpisode:
      episodeService.getLastRefferalEpisodeForPrescription(props.identifier.id),
    lastPatientVisit: null,
    lastPatientVisitDetails: null,
    lastLog:
      pocPrescriptionLogService.getLastPrescriptionLogByPatientIdAndClinicalServiceId(
        patient.value.id,
        props.identifier.service.id
      ),
    lastPrescription: null,
    patientServiceIdentifierFromEpisode: null,
    lastPack: null,
  };

  if (context.lastStartEpisode) {
    const patientVisitIds = [];
    const visitDetails =
      patientVisitDetailsService.getAllPatientVisitDetailsFromEpisode(
        context.lastStartEpisode.id
      );

    if (visitDetails?.length) {
      visitDetails.forEach((detail) => {
        patientVisitIds.push(detail.patient_visit_id);
      });
    } else {
      patientVisitService.getAllFromPatient(patient.value.id).forEach((visit) => {
        patientVisitIds.push(visit.id);
      });
    }

    context.lastPatientVisit =
      patientVisitService.getLastFromPatientVisitListWithoutRelations(
        patientVisitIds
      );
  }

  if (context.lastPatientVisit && context.lastStartEpisode) {
    context.lastPatientVisitDetails =
      patientVisitDetailsService.getPrescriptionContextFromPatientVisitAndEpisode(
        context.lastPatientVisit.id,
        context.lastStartEpisode.id
      );

    if (!context.lastPatientVisitDetails) {
      const hasMatchingVisit =
        patientVisitDetailsService.hasFromPatientAndClinicService(
          patient.value.id,
          props.identifier.service.id
        );
      if (hasMatchingVisit) {
        context.lastPatientVisitDetails =
          patientVisitDetailsService.getPrescriptionContextFromPatientVisit(
            context.lastPatientVisit.id
          );
      }
    }
  }

  context.lastPrescription =
    context.lastLog?.prescription ??
    context.lastPatientVisitDetails?.prescription ??
    null;

  if (context.lastPrescription?.id) {
    // The log/visit lookup is intentionally lightweight. Rehydrate the one
    // selected prescription so remaining-duration validation can inspect all
    // previous visit details and their packs exactly as before the refactor.
    context.lastPrescription =
      prescriptionService.getForMobilePrescriptionDisplay(
        context.lastPrescription.id
      ) ?? context.lastPrescription;
  }

  if (context.lastPatientVisitDetails?.episode?.id) {
    context.patientServiceIdentifierFromEpisode = episodeService.getEpisodeById(
      context.lastPatientVisitDetails.episode.id
    );
  }

  if (context.lastPrescription) {
    const visitPack = context.lastPatientVisitDetails?.pack ?? null;
    const hydratedLastPack =
      packService.getLastPackForMobilePrescriptionDisplay(
        context.lastPrescription.id
      );

    // The lightweight visit context can contain only the pack reference. The
    // dispense-only flow needs packagedDrugs (and each drug) to build its rows.
    context.lastPack = hydratedLastPack ?? visitPack;
  }

  mobilePrescriptionContext.value = context;
};

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
      prescribedDrug.id = uuidv4();
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
      if (
        momentNextPickUpDate.isAfter(momentPrescriptionDate) &&
        patientServiceIdentifierFromEpisode.value.patientServiceIdentifier
          .service.code === props.identifier.service.code
      ) {
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
  //  curPrescription.value.patientVisitDetails = [];
    curPrescription.value.groupMemberPrescription = [];
    curPrescription.value.syncStatus = 'N';
    curPrescription.value.prescriptionDetails.forEach((prescriptionDetail) => {
      prescriptionDetail.prescription = null;
      prescriptionDetail.prescription_id = curPrescription.value.id;
      hasTherapeuticalRegimen.value
        ? delete prescriptionDetail.therapeuticRegimen['prescriptionDetails']
        : '';
      hasTherapeuticalRegimen.value
        ? delete prescriptionDetail.therapeuticRegimen['drugs']
        : '';
      if (prescriptionDetail.therapeuticLine !== null)
        hasTherapeuticalLine.value
          ? delete prescriptionDetail.therapeuticLine['prescriptionDetails']
          : '';
    });
    curPrescriptionDetail.value = curPrescription.value.prescriptionDetails[0];
    if (curPrescription.value.photo !== null) {
      handleImageCaptured(byteArrayToBase64(curPrescription.value.photo));
    }
    const lastPackagedDrugs = lastPack.value?.packagedDrugs ?? [];
    if (lastPackagedDrugs.length > 0) {
      lastPackagedDrugs.forEach((packagedDrug) => {
        let packagedDrugEdit = new PackagedDrug({ id: uuidv4() });
        packagedDrugEdit.drug = packagedDrug.drug;
        packagedDrugEdit.drug_id = packagedDrug.drug.id;
        packagedDrugEdit.amtPerTime =
          packagedDrug.amtPerTime !== 0
            ? packagedDrug.amtPerTime
            : packagedDrug.drug.defaultTreatment;
        packagedDrugEdit.timesPerDay =
          packagedDrug.timesPerDay !== 0
            ? packagedDrug.timesPerDay
            : packagedDrug.drug.defaultTimes;
        packagedDrugEdit.form =
          packagedDrug.form !== null
            ? packagedDrug.form
            : packagedDrug.drug.defaultPeriodTreatment;

        curPack.value.packagedDrugs.push(packagedDrugEdit);
      });

      curPack.value.weeksSupply = lastPack.value.weeksSupply;
    } else {
      addPackagedDrugs();
    }

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
  let error = 'Os Seguintes Medicamentos Prescritos estão inactivos: ';
  if (!reasonOutroSelected.value) {
    curPrescriptionDetail.value.reasonForUpdateDesc = '';
  }
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
  if (attachedPrescription.value) {
    // const imageBase64 = attachedPrescription.value.split(',')[1];
    // curPrescription.value.photo = attachedPrescription.value;
    // curPrescription.value.photoName = attachedPrescription.value.name;
    // curPrescription.value.photoContentType = imageBase64;
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
      (lastStartEpisode.value === null ||
        lastStartEpisode.value === undefined) &&
      (lastRefferalEpisode.value === null ||
        lastRefferalEpisode.value === undefined)
    ) {
      alertError(
        'Nenhuma prescrição não deve ser criada sem um Histórico clínico de Início ou Referência.'
      );
    } else if (
      getYYYYMMDDFromJSDate(getDateFromHyphenDDMMYYYY(prescriptionDate.value)) <
      getYYYYMMDDFromJSDate(
        lastStartEpisode.value !== null && lastStartEpisode.value !== undefined
          ? lastStartEpisode.value.episodeDate
          : lastRefferalEpisode.value.episodeDate
      )
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
    } else if (checkPrescribedDrugActive() !== '') {
      error += checkPrescribedDrugActive();
      alertError(error);
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
const checkIfExistsAnyQuanityRemainForDispense = () => {
  return packService.checkIfExistsAnyQuanityRemainForDispense(
    curPatientVisitDetail.value.pack.packagedDrugs
  );
};
const totalRemainAcumulado = (drug) => {
  let totalAcumulado = 0;
  const lastPackAux = isMobile.value
    ? packService.getLastPackagedDrugForMobile(drug)
    : packService.getLastPackFromPatientAndDrug(patient, drug);
  if (lastPackAux !== undefined && lastPackAux !== null) {
    totalAcumulado = Number(lastPackAux.quantityRemain);
  }
  return totalAcumulado;
};
const totalQuantityRemainFrascos = (packagedDrug) => {
  const total = packagedDrug.quantityRemain;
  return Math.floor(total / packagedDrug.drug.packSize);
};
//se forem 45 num packsize 30 o valor sera 15
const totalQuantityRemainUnidades = (packagedDrug) => {
  const valor = packagedDrug.quantityRemain % packagedDrug.drug.packSize;
  return valor;
};

const checkPrescribedDrugActive = () => {
  const prescribedDrugs = curPrescription.value.prescribedDrugs;

  let drugs = '';
  for (const prescribedDrug of prescribedDrugs) {
    if (prescribedDrug.drug.active === false) {
      drugs += prescribedDrug.drug.name;
    }
  }
  if (drugs !== '') {
    // error += drugs;
    //  alertError(error);
  }
  return drugs;
};

const getPrescriptionFormMemoToken = () => {
  if (isMobile.value && mobileFormRenderFrozen.value) {
    return frozenPrescriptionFormMemoToken;
  }
  // A new token keeps normal editing and all web rendering unchanged.
  return {};
};

const restorePrescriptionForm = () => {
  mobileFormRenderFrozen.value = false;
  showServiceDrugsManagement.value = false;
};

const allGoodvalidatedForm = async () => {
  if (isMobile.value) {
    mobileFormRenderFrozen.value = true;
    // Capture the current valid form DOM before changing the domain objects.
    await nextTick();
  }

  curPrescription.value.leftDuration = remainigDuration(curPrescription.value);

  curPrescription.value.prescriptionDetails = [];
  curPrescription.value.prescriptionDate = getDateFromHyphenDDMMYYYY(
    prescriptionDate.value
  );
  curPrescription.value.doctor.clinic = {};
  curPrescription.value.doctor.clinic.id =
    curPrescription.value.doctor.clinic_id;

  curPrescription.value.prescribedDrugs.forEach((prescribedDrug) => {
    prescribedDrug.prescription = null;
    prescribedDrug.prescription_id = null;
  });
  curPrescription.value.prescriptionDetails.push(curPrescriptionDetail.value);

  curPrescription.value.prescriptionDetails.forEach((prescriptionDetail) => {
    prescriptionDetail.prescription = null;
    prescriptionDetail.prescription_id = null;
    hasTherapeuticalRegimen.value
      ? delete prescriptionDetail.therapeuticRegimen['prescriptionDetails']
      : '';
    hasTherapeuticalRegimen.value
      ? delete prescriptionDetail.therapeuticRegimen['drugs']
      : '';
    hasTherapeuticalLine.value
      ? delete prescriptionDetail.therapeuticLine['prescriptionDetails']
      : '';
  });
  curPrescription.value.clinic = patient.value.clinic;
  curPrescription.value.clinic_id = patient.value.clinic_id;

  curPack.value.clinic = patient.value.clinic;
  curPack.value.clinic_id = patient.value.clinic_id;
  curPack.value.providerUuid = sessionStorage.getItem('Btoa');
  curPack.value.syncStatus = 'R';
  curPack.value.packagedDrugs = [];

  curPatientVisitDetail.value.patient_visit_id = curPatientVisit.value.id;
  curPatientVisitDetail.value.clinic = patient.value.clinic;
  curPatientVisitDetail.value.clinic_id = patient.value.clinic_id;
  curPatientVisitDetail.value.pack_id = curPack.value.id;
  curPatientVisitDetail.value.pack = curPack.value;
  curPatientVisitDetail.value.prescription = curPrescription.value;
  curPatientVisitDetail.value.prescription_id = curPrescription.value.id;
  curPatientVisitDetail.value.episode =
    lastStartEpisode.value !== null && lastStartEpisode.value !== undefined
      ? lastStartEpisode.value
      : lastRefferalEpisode.value;
  curPatientVisitDetail.value.episode_id =
    lastStartEpisode.value !== null && lastStartEpisode.value !== undefined
      ? lastStartEpisode.value.id
      : lastRefferalEpisode.value.id;

  addPackagedDrugs();
  showServiceDrugsManagement.value = true;
  if (selectedMember !== undefined && selectedMember.value !== null) {
    curPatientVisitDetail.value.prescription = curPrescription.value;
    curPatientVisit.value.patientVisitDetails.push(curPatientVisitDetail.value);
  }
};

const addPackagedDrugs = () => {
  curPrescription.value.prescribedDrugs.forEach((prescribedDrug) => {
    let packagedDrug = new PackagedDrug({ id: uuidv4() });
    packagedDrug.drug = prescribedDrug.drug;
    packagedDrug.drug_id = prescribedDrug.drug.id;
    packagedDrug.amtPerTime = prescribedDrug.amtPerTime;
    packagedDrug.timesPerDay = prescribedDrug.timesPerDay;
    packagedDrug.form = prescribedDrug.form;

    const lastPackagedDrugs = lastPack.value?.packagedDrugs ?? [];
    if (lastPackagedDrugs.length > 0) {
      lastPackagedDrugs.find((item) => {
        if (item.drug_id === packagedDrug.drug_id) {
          const qtyRemain = getQtyRemain(
            packagedDrug,
            lastPack.value.weeksSupply
            //          curPrescription.value.duration.weeks
          );
          quantityRemainAux = Number(qtyRemain) + Number(item.quantityRemain);
          packagedDrug.quantityRemain = quantityRemainAux;
        }
      });
    } else {
      const qtyRemain = getQtyRemain(
        packagedDrug,
        curPack.value.weeksSupply
        //     curPrescription.value.duration.weeks
      );
      packagedDrug.quantityRemain = qtyRemain;
    }
    prescribedDrug.quantityRemain = quantityRemainAux;
    packagedDrug.quantityRemain = quantityRemainAux;

    curPack.value.packagedDrugs.push(packagedDrug);
  });
};
const generatePacks = async (packagedDrug) => {
  const packagedDrugStocks = [];

  let remainingQuantity = Number(packagedDrug.quantitySupplied);
  const pickupDate = curPack.value.pickupDate;
  const stocks = await StockService.getValidStockByDrugAndPickUpDateOnline(
    packagedDrug.drug.id,
    pickupDate
  );

  for (const currentStock of stocks) {
    if (remainingQuantity <= 0) break;

    const availableQuantity = Number(currentStock.stockMoviment ?? 0);
    if (availableQuantity <= 0) continue;

    const suppliedFromStock = Math.min(
      remainingQuantity,
      availableQuantity
    );
    const packagedDrugStock = new PackagedDrugStock({ id: uuidv4() });
    packagedDrugStock.quantitySupplied = suppliedFromStock;
    packagedDrugStock.drug = {};
    packagedDrugStock.drug.id = packagedDrug.drug.id;
    packagedDrugStock.stock = {};
    packagedDrugStock.stock.id = currentStock.id;
    packagedDrugStock.creationDate = moment().format('YYYY-MM-DD');
    packagedDrugStocks.push(packagedDrugStock);
    remainingQuantity -= suppliedFromStock;
  }

  if (remainingQuantity > 0) {
    throw new Error(
      `Stock insuficiente para o medicamento ${packagedDrug.drug.id}.`
    );
  }

  packagedDrug.packagedDrugStocks = packagedDrugStocks;
};

const checkStockToPack = async () => {
  let indexToRemove = [];
  const packagedDrugs = curPatientVisitDetail.value.pack.packagedDrugs;

  for (const packageDrug of packagedDrugs) {
    const item = await checkStock(
      packageDrug,
      curPatientVisitDetail.value.pack.weeksSupply
    );
    if (!item) {
      const i = packagedDrugs.indexOf(packageDrug);
      indexToRemove.push(i);
    } else {
      if (isMobile.value && !isOnline.value) {
        await generatePacks(packageDrug);
      }
    }
  }

  return indexToRemove;
};

const checkPackageDrugQtySupplied = () => {
  let indexToRemove = [];
  const packagedDrugs = curPatientVisitDetail.value.pack.packagedDrugs;

  for (const packageDrug of packagedDrugs) {
    if (Number(packageDrug.quantitySupplied) <= 0) {
      const i = packagedDrugs.indexOf(packageDrug);
      indexToRemove.push(i);
    }
  }

  return indexToRemove;
};

const addPatientVisitDetail = async () => {
  submittingValidateDispense.value = true;
  let pickupDate4daysAdd = date.addToDate(
    curPatientVisitDetail.value.pack.pickupDate,
    {
      days: 4,
    }
  );

  let quantityRemainAux = 0;
  curPatientVisitDetail.value.pack.packagedDrugs.forEach((packagedDrug) => {
    const lastPackagedDrug = isMobile.value
      ? packService.getLastPackagedDrugForMobile(packagedDrug.drug)
      : packService.getLastPackFromPatientAndDrug(
          patient,
          packagedDrug.drug
        );

    if (lastPackagedDrug !== null && lastPackagedDrug !== undefined) {
      const qtyRemain = getQtyRemain(
        packagedDrug,
        curPatientVisitDetail.value.pack.weeksSupply
        //  curPrescription.value.duration.weeks
      );
      quantityRemainAux =
        Number(qtyRemain) + Number(lastPackagedDrug.quantityRemain);
      packagedDrug.quantityRemain = quantityRemainAux;
    } else {
      const qtyRemain = getQtyRemain(
        packagedDrug,
        curPatientVisitDetail.value.pack.weeksSupply
        // curPrescription.value.duration.weeks
      );
      packagedDrug.quantityRemain = qtyRemain;
    }
  });
  const itemsSuppliedToRemove = checkPackageDrugQtySupplied();
  const itemsToRemove = await checkStockToPack();

  if (itemsSuppliedToRemove.length > 0) {
    submittingValidateDispense.value = false;
    alertError(
      ' Existem medicamentos sem quantidade por dispensar na lista. Por favor, remova'
    );
  } else if (itemsToRemove.length > 0) {
    submittingValidateDispense.value = false;
    alertError(' Existem medicamentos sem stock na lista. Por favor, remova');
  } else if (
    Number(curPatientVisitDetail.value.pack.weeksSupply / 4) >
    remainigDuration(curPatientVisitDetail.value.prescription)
  ) {
    submittingValidateDispense.value = false;
    alertError(
      'O Período para o qual pretende efectuar a dispensa é maior que o período remanescente nesta prescrição [' +
        remainigDuration(curPatientVisitDetail.value.prescription) +
        ' mes(es)]'
    );
  } else if (curPatientVisitDetail.value.pack.packagedDrugs.length === 0) {
    submittingValidateDispense.value = false;
    alertError('Deve ter pelo menos um medicamento para efectuar a dispensa');
  } else if (Number(curPatientVisitDetail.value.pack.weeksSupply) < 0) {
    submittingValidateDispense.value = false;
    alertError(
      'Por favor indicar o período para o qual pretende efectuar a dispensa de medicamento ' +
        props.identifier.service.code
    );
  } else if (
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.pickupDate) >
    getYYYYMMDDFromJSDate(moment())
  ) {
    submittingValidateDispense.value = false;
    alertError('A data de levantamento indicada é maior que a data corrente');
  } else if (
    !date.isValid(
      getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.pickupDate)
    )
  ) {
    alertError('A data de levantamento é inválida');
    submittingValidateDispense.value = false;
  } else if (
    !date.isValid(
      getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.nextPickUpDate)
    )
  ) {
    alertError('A data do próximo levantamento é inválida');
    submittingValidateDispense.value = false;
  } else if (
    getYYYYMMDDFromJSDate(defaultDate.value) ===
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.pickupDate)
  ) {
    alertError('A data de levantamento é inválida');
    submittingValidateDispense.value = false;
  } else if (
    getYYYYMMDDFromJSDate(defaultDate.value) ===
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.nextPickUpDate)
  ) {
  } else if (
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.pickupDate) >
    moment().format('YYYY-MM-DD')
  ) {
    alertError(
      'A data de levantamento indicada é maior que a data da corrente'
    );
    submittingValidateDispense.value = false;
  } else if (
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.pickupDate) >
    getYYYYMMDDFromJSDate(curPatientVisitDetail.value.pack.nextPickUpDate)
  ) {
    alertError(
      'A data do levantamento é maior que a data do próximo levantamento'
    );
    submittingValidateDispense.value = false;
  } else if (lastPack.value !== null && lastPack.value !== undefined) {
    if (
      getYYYYMMDDFromJSDate(lastPack.value.nextPickUpDate) >
        getYYYYMMDDFromJSDate(pickupDate4daysAdd) &&
      patientServiceIdentifierFromEpisode.value.patientServiceIdentifier.service
        .code === props.identifier.service.code
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
          submittingValidateDispense.value = false;
        } else {
          allGoodValidatatedDispense();
          submittingValidateDispense.value = false;
        }
      });
    } else {
      allGoodValidatatedDispense();
      submittingValidateDispense.value = false;
    }
  } else {
    allGoodValidatatedDispense();
    submittingValidateDispense.value = false;
  }
};
const allGoodValidatatedDispense = () => {
  if (checkIfExistsAnyQuanityRemainForDispense()) {
    let hasToshowAlertRemain = false;
    let warningMessage =
      'O paciente passará a ter de Sobra os medicamentos: \n\n ';
    const currentPackagedDrugs = curPatientVisitDetail.value.pack.packagedDrugs;
    for (const packagedDrug of currentPackagedDrugs) {
      const acumulado = totalRemainAcumulado(packagedDrug.drug);
      if (acumulado > 0) {
        hasToshowAlertRemain = true;
        warningMessage +=
          '\0 ' +
          totalQuantityRemainFrascos(packagedDrug) +
          ' frasco(s) e ' +
          totalQuantityRemainUnidades(packagedDrug) +
          ' unidade(s) de ' +
          packagedDrug.drug.name +
          ';\n\n';
      }
    }
    if (hasToshowAlertRemain) {
      alertWarning(warningMessage);
    }
  }
  validateDispense.value = true;
  curPrescription.value.leftDuration = Number(
    (Number(curPrescription.value.duration.weeks) -
      Number(curPack.value.weeksSupply)) /
      4
  );
  curPatientVisit.value.visitDate = curPrescription.value.prescriptionDate;
  curPatientVisitDetail.value.prescription = curPrescription.value;
  curPatientVisitDetail.value.episode =
    lastStartEpisode.value !== null && lastStartEpisode.value !== undefined
      ? lastStartEpisode.value
      : lastRefferalEpisode.value;
  curPatientVisitDetail.value.episode_id =
    lastStartEpisode.value !== null && lastStartEpisode.value !== undefined
      ? lastStartEpisode.value.id
      : lastRefferalEpisode.value.id;
  curPatientVisit.value.patientVisitDetails.push(curPatientVisitDetail.value);
};

const removePatientVisitDetail = () => {
  validateDispense.value = false;
  submittingValidateDispense.value = false;
  const i = curPatientVisit.value.patientVisitDetails
    .map((toRemove) => toRemove.id)
    .indexOf(curPatientVisitDetail.value.id);
  curPatientVisit.value.patientVisitDetails.splice(i, 1);
};

const addPrescribedDrug = async (prescribedDrug) => {
  const prescribedDrugExists = curPrescription.value.prescribedDrugs.some(
    (item) => {
      return item.drug.id === prescribedDrug.drug.id;
    }
  );

  if (!prescribedDrugExists) {
    const hasStock = await checkStock(prescribedDrug);
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
        submittingPrescribedDrug.value = false;
      } else {
        prescribedDrug.prescribedQty = getQtyPrescribed(
          prescribedDrug,
          curPrescription.value.duration.weeks
        );
        addMedication(prescribedDrug);
        submittingPrescribedDrug.value = false;
      }
    } else {
      alertInfo(
        'O medicamento seleccionado não possui stock suficiente para dispensar até a data da prescrição.'
      );
      prescribedDrug.prescribedQty = getQtyPrescribed(
        prescribedDrug,
        curPrescription.value.duration.weeks
      );
      addMedication(prescribedDrug);
      submittingPrescribedDrug.value = false;
    }
  } else {
    alertError(
      'O medicamento seleccionado ja existe na lista dos medicamentos prescritos.'
    );
    submittingPrescribedDrug.value = false;
  }
};

const addMedication = (prescribedDrug) => {
  showAddEditDrug.value = false;
  curPrescription.value.prescribedDrugs.push(
    new PrescribedDrug(prescribedDrug)
  );
};
const getDrugById = (drugID) => {
  return drugService.getCleanDrugById(drugID);
};

const checkStock = async (prescribedDrug, weeksSupply) => {
  const qtyPrescribed = getQtyPrescribed(prescribedDrug, weeksSupply);

  const prescrDate = getYYYYMMDDFromJSDate(
    getDateFromHyphenDDMMYYYY(prescriptionDate.value)
  );
  const resp = await StockService.checkStockStatus(
    prescribedDrug.drug.id,
    prescrDate,
    qtyPrescribed,
    clinicService.currClinic().id,
    weeksSupply
  );
  return resp;
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

const triggerFileInput = () => {
  const nativeInput = fileInput.value.$el.querySelector('input[type="file"]');
  if (nativeInput) {
    nativeInput.click();
  }
};

const handleImageCaptured = (imageData) => {
  curPrescription.value.photoContentType = imageData;
  curPrescription.value.photoName = props.identifier.value + '-' + 'Foto.jpeg';
  //attachedPrescription.value = curPrescription.value.photoName;
  const byteString = atob(imageData);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // Create a blob and then a File object
  const blob = new Blob([ab], { type: 'image/jpeg' });
  const fileName = `captured_${new Date().getTime()}.jpg`;
  const file = new File([blob], fileName, { type: 'image/jpeg' });

  // Update the q-file model value
  attachedPrescription.value = file;
  if (file.name === undefined || file.name === null) file.name = fileName;
};

const byteArrayToBase64 = (byteArray) => {
  let binary = '';
  const len = byteArray.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(byteArray[i]);
  }
  return btoa(binary); // Base64 encode
};

// Hook
onMounted(() => {
  if (isMobile.value) prepareMobilePrescriptionContext();
  init();
  if (isMobile.value) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        secondaryControlsReady.value = true;
      });
    });
  }
});

watch(attachedPrescription, (newFile) => {
  if (!newFile) return;
  if (curPrescription.value.photoName) return;
  curPrescription.value.photoName = newFile.name;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target.result.split(',')[1];
    curPrescription.value.photoContentType = base64String;
  };
  reader.readAsDataURL(newFile);
});

//Provide
provide('curPatientVisit', curPatientVisit);
provide('curPrescription', curPrescription);
provide('curPrescriptionDetail', curPrescriptionDetail);
provide('curPatientVisitDetail', curPatientVisitDetail);
provide('curPack', curPack);
provide('lastPack', lastPack);
provide('durations', durations);
provide('hasTherapeuticalRegimen', hasTherapeuticalRegimen);
provide('curIdentifier', props.identifier);
provide('showAddEditDrug', showAddEditDrug);
provide('addPrescribedDrug', addPrescribedDrug);
provide('validateDispense', validateDispense);
provide('addPatientVisitDetail', addPatientVisitDetail);
provide('removePatientVisitDetail', removePatientVisitDetail);
provide('submittingPrescribedDrug', submittingPrescribedDrug);
provide('submittingValidateDispense', submittingValidateDispense);
provide('lastPrescription', lastPrescription);
</script>

<style lang="scss">
.prescription-box {
  border: 1px solid $grey-4;
}
.box-border {
  border: 1px solid $grey-4;
}

.tablet-prescription-unit .prescription-unit-body {
  margin: 4px 7px !important;
}

.tablet-prescription-unit .q-field--dense .q-field__control,
.tablet-prescription-unit .q-field--dense .q-field__marginal {
  height: 36px;
  min-height: 36px;
}

.tablet-prescription-unit .q-field--with-bottom {
  padding-bottom: 10px;
}

.tablet-prescription-unit .q-mb-md {
  margin-bottom: 5px !important;
}

.tablet-prescription-unit .q-mb-sm {
  margin-bottom: 3px !important;
}

.tablet-prescription-unit .q-mt-sm {
  margin-top: 3px !important;
}

.tablet-prescription-unit .q-separator.q-mb-sm {
  margin-bottom: 3px !important;
}

.tablet-prescription-unit .q-banner {
  min-height: 30px;
}

.tablet-prescription-unit .q-banner__content {
  min-height: 30px;
  padding: 2px 8px;
}

.tablet-prescription-unit .q-banner__actions {
  padding: 0 4px;
}

.tablet-prescription-unit .prescribed-drugs-table .q-table__middle {
  max-height: 104px;
}

.tablet-prescription-unit .prescribed-drugs-table th,
.tablet-prescription-unit .prescribed-drugs-table td {
  height: 28px;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1.15;
}

.tablet-prescription-unit .prescribed-drugs-table .q-btn {
  min-width: 28px;
  min-height: 28px;
}

.tablet-prescription-unit .q-item__label--caption {
  padding-right: 4px;
}

.tablet-prescription-unit .q-radio,
.tablet-prescription-unit .q-checkbox {
  min-height: 34px;
}

.tablet-prescription-unit .q-file {
  margin-top: 2px;
}

.tablet-prescription-unit,
.tablet-prescription-unit > *,
.tablet-prescription-unit .q-table__container {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.tablet-prescription-unit .q-table {
  width: 100% !important;
  table-layout: fixed;
}

.tablet-prescription-unit .q-table th,
.tablet-prescription-unit .q-table td {
  white-space: normal;
  overflow-wrap: anywhere;
}

.tablet-validated-prescription-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 5px 7px;
  border: 1px solid $grey-4;
  background: $grey-2;
}

.tablet-summary-fields {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  flex: 1 1 auto;
  min-width: 0;
}

.tablet-summary-fields > div {
  min-width: 0;
}

.tablet-summary-fields small,
.tablet-summary-fields strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tablet-summary-fields small {
  color: $grey-7;
  font-size: 10px;
}

.tablet-summary-fields strong {
  font-size: 12px;
}
</style>
