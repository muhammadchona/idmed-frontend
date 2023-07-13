<template>
  <q-card style="width: 1350px; max-width: 110vw">
    <q-card-section style="max-height: 50vh" class="q-pa-none bg-green-2">
      <div class="row items-center text-subtitle1 q-pa-md">
        <q-icon
          :name="patient.gender == 'Feminino' ? 'female' : 'male'"
          size="md"
          color="primary"
        />
        <div class="text-bold text-grey-10 q-ml-sm">
          {{ fullName(patient) }}
        </div>
        <div class="text-grey-10 q-ml-sm">
          <span class="text-bold text-h6">|</span> {{ patient.gender }}
        </div>
        <div
          class="text-grey-10 q-ml-sm"
          v-if="
            idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) <= 14
          "
        >
          <span class="text-bold text-h6">
            | <q-icon name="child_care" />
          </span>
          {{ idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) }}
          Ano(s) de Idade
        </div>
        <div class="text-grey-10 q-ml-sm" v-else>
          <span class="text-bold text-h6">|</span>
          {{ idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) }}
          Anos de Idade
        </div>
      </div>
      <q-separator />
    </q-card-section>
    <q-scroll-area style="height: 800px" class="q-pr-md">
      <q-card-section>
        <q-list bordered>
          <q-expansion-item
            v-for="identifier in getIdentifierWithInicialEpisode"
            :key="identifier.id"
            group="somegroup"
            dense
            :label="
              'Prescrição ' +
              identifier.service.code +
              ' - ' +
              identifier.identifierType.code +
              ': ' +
              identifier.value
            "
            :default-opened="identifier.service.code === 'TARV'"
            :header-class="
              selected_model[identifier.service.code]
                ? 'bg-amber-9 text-white text-bold text-subtitle1 vertical-middle q-pl-md'
                : 'bg-primary text-white text-bold text-subtitle1 vertical-middle q-pl-md'
            "
            expand-icon-class="text-white"
            v-model="selected_model[identifier.service.code]"
          >
            <q-card>
              <q-card-section>
                <ListHeader bgColor="bg-grey-6"
                  >Informação da Prescrição
                </ListHeader>
                <add-edit-prescription-unit :identifier="identifier" />
              </q-card-section>
            </q-card>
            <q-separator />
          </q-expansion-item>
        </q-list>
        <div class="row q-mt-xs">
          <q-banner
            dense
            inline-actions
            class="col text-white q-pa-none bg-orange-4"
          >
            <div class="q-pa-md">
              <div class="q-gutter-sm">
                <q-radio
                  v-model="mds"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="US_"
                  label="Farmácia Pública"
                  @update:model-value="dispenseMode = []"
                />
                <q-radio
                  v-model="mds"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="DD_"
                  label="Dipensa Descentralizada"
                  @update:model-value="dispenseMode = []"
                />
                <q-radio
                  v-model="mds"
                  checked-icon="task_alt"
                  unchecked-icon="panorama_fish_eye"
                  val="DC_"
                  label="Dispensa Comunitária"
                  @update:model-value="dispenseMode = []"
                />
              </div>
            </div>
            <template v-slot:action>
              <q-select
                style="width: 320px"
                class="col q-ma-sm"
                bg-color="white"
                dense
                outlined
                ref="dispenseModeRef"
                v-model="dispenseMode"
                :options="dispenseModes"
                option-value="id"
                option-label="description"
                label="Modo de dispensa"
              />
            </template>
          </q-banner>
        </div>
      </q-card-section>
      <q-card-actions>
        <div class="row q-mt-xl q-pt-md">
          <span
            class="text-right absolute-bottom q-mb-lg q-mr-md q-mt-xl no-pointer-events"
          >
            <q-btn
              label="Cancelar"
              color="red"
              class="all-pointer-events"
              @click="closePrescriptionOption"
            />
            <q-btn
              :label="dispenseLabel"
              loader
              :disable="curPatientVisit.patientVisitDetails.length === 0"
              :loading="submitting"
              @click="doValidationToDispense()"
              color="primary"
              class="q-ml-md all-pointer-events"
            >
            </q-btn>
          </span>
        </div>
      </q-card-actions>
    </q-scroll-area>
  </q-card>
</template>

<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { usePatient } from 'src/composables/patient/patientMethods';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import addEditPrescriptionUnit from './AddEditPrescriptionUnit.vue';
import ListHeader from 'src/components/Shared/ListHeader.vue';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import moment from 'moment';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';

import { v4 as uuidv4 } from 'uuid';

// Declaration
const { idadeCalculator, getDDMMYYYFromJSDate, getYYYYMMDDFromJSDate } =
  useDateUtils();
const { fullName } = usePatient();
const { alertSucess, alertError } = useSwal();
const mds = ref('US_');
const dispenseMode = ref();
const selected_model = ref([]);
const submitting = ref(false);
const curPatientVisit = ref(new PatientVisit({ id: uuidv4() }));

//Inject
const patient = inject('patient');
const closePrescriptionOption = inject('closePrescriptionOption');

//Hook
onMounted(() => {
  init();
});

// Computed
const dispenseModes = computed(() => {
  return mds.value !== null
    ? dispenseModeService.getAllFromDispenseModeType(mds.value)
    : [];
});

const getIdentifierWithInicialEpisode = computed(() => {
  return patientServiceIdentifierService.getAllIdentifierWithInicialEpisodeByPatient(
    patient.value.id
  );
});

const dispenseLabel = computed(() => {
  return curPatientVisit.value.patientVisitDetails.length === 0
    ? 'Dispensar'
    : 'Dispensar [' + curPatientVisit.value.patientVisitDetails.length + ']';
});
// Methods

const init = () => {
  //curPatientVisit.value = new PatientVisit();
  curPatientVisit.value.visitDate = getYYYYMMDDFromJSDate(moment());
  curPatientVisit.value.clinic = patient.value.clinic;
  curPatientVisit.value.clinic_id = patient.value.clinic_id;
  curPatientVisit.value.patient = patient.value;
  curPatientVisit.value.patient_id = patient.value.id;
  curPatientVisit.value.patientVisitDetails = [];
};

const doValidationToDispense = () => {
  curPatientVisit.value.clinic = {};
  curPatientVisit.value.clinic.id = patient.value.clinic_id;
  curPatientVisit.value.patient = {};
  curPatientVisit.value.patient.id = patient.value.id;
  submitting.value = true;
  if (
    dispenseMode.value === null ||
    dispenseMode.value === undefined ||
    dispenseMode.value === ''
  ) {
    alertError('Por favor indicar o modo da dispensa.');
    submitting.value = false;
  } else {
    curPatientVisit.value.patientVisitDetails.forEach((patientVisitDetail) => {
      curPatientVisit.value.visitDate = patientVisitDetail.pack.pickupDate;
      patientVisitDetail.clinic = {};
      patientVisitDetail.clinic.id = patient.value.clinic_id;
      patientVisitDetail.episode = {};
      patientVisitDetail.episode.id = patientVisitDetail.episode_id;
      patientVisitDetail.pack.clinic = {};
      patientVisitDetail.pack.clinic.id = patient.value.clinic_id;
      patientVisitDetail.pack.dispenseMode = {};
      patientVisitDetail.pack.dispenseMode.id = dispenseMode.value.id;
      patientVisitDetail.pack.syncStatus = 'R';
      patientVisitDetail.pack.providerUuid = localStorage.getItem('Btoa');
      patientVisitDetail.pack.packagedDrugs.forEach((packagedDrug) => {
        packagedDrug.drug = {};
        packagedDrug.drug.id = packagedDrug.drug_id;
      });
      patientVisitDetail.prescription.clinic = {};
      patientVisitDetail.prescription.clinic.id = patient.value.clinic_id;
      patientVisitDetail.prescription.prescribedDrugs.forEach(
        (prescribedDrug) => {
          let drugID = prescribedDrug.drug.id;
          prescribedDrug.drug = {};
          prescribedDrug.drug.id = drugID;
        }
      );
    });
    patientVisitService
      .post(curPatientVisit.value)
      .then((resp) => {
        submitting.value = false;
        alertSucess('Dispensa efectuada com sucesso');
        closePrescriptionOption();
      })
      .catch((error) => {
        submitting.value = false;
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  }
};

provide('curPatientVisit', curPatientVisit);
</script>

<style lang="scss">
.prescription-box {
  border: 1px solid $grey-4;
}
.box-border {
  border: 1px solid $grey-4;
}
// .q-expansion-item--expanded {
//   // border: 1px solid #000000;
//   // border-color: coral;
//   background-color: coral;
// }
</style>
