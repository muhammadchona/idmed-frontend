<template>
  <q-card
    style="width: 1350px; max-width: 110vw"
    :class="{ 'tablet-prescription-card': !website }"
  >
    <q-card-section style="max-height: 50vh" class="q-pa-none bg-green-2">
      <div
        class="row items-center text-subtitle1 q-pa-md"
        :class="{ 'tablet-prescription-patient-header': !website }"
      >
        <q-icon :name="patient.gender == 'Feminino' ? 'female' : 'male'" size="md" color="primary" />
        <div class="text-bold text-grey-10 q-ml-sm">
          {{ fullName(patient) }}
        </div>
        <div class="text-grey-10 q-ml-sm">
          <span class="text-bold text-h6">|</span> {{ patient.gender }}
        </div>
        <div class="text-grey-10 q-ml-sm" v-if="
          idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) <= 14
        ">
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
        <div
          class="absolute-top-right q-pa-md"
          :class="{ 'tablet-prescription-close': !website }"
        >
          <q-btn flat v-close-popup round dense icon="close" @click="closePrescriptionOption" />
        </div>
      </div>
      <q-separator />
    </q-card-section>
    <q-scroll-area
      style="height: 800px"
      class="q-pr-md"
      :class="{ 'tablet-prescription-scroll': !website }"
    >
      <q-card-section
        :class="{ 'tablet-prescription-content': !website }"
      >
        <div
          v-if="!prescriptionIdentifiersReady"
          class="column items-center justify-center q-pa-xl text-grey-7"
        >
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md">A preparar a prescrição...</div>
        </div>
        <q-list v-else bordered>
          <q-expansion-item v-for="identifier in getIdentifierWithInicialEpisode.length > 0
            ? getIdentifierWithInicialEpisode
            : getIdentifierWithRefferalEpisode" :key="identifier.id" group="somegroup" dense :label="'Prescrição ' +
                identifier.service.code +
                ' - ' +
                identifier.identifierType.code +
                ': ' +
                identifier.value
                " :default-opened="identifier.service.code === 'TARV'" :header-class="selected_model[identifier.service.code]
                ? 'bg-amber-9 text-white text-bold text-subtitle1 vertical-middle q-pl-md'
                : 'bg-primary text-white text-bold text-subtitle1 vertical-middle q-pl-md'
              " expand-icon-class="text-white" v-model="selected_model[identifier.service.code]">
            <q-card>
              <q-card-section>
                <ListHeader bgColor="bg-grey-6">Informação da Prescrição
                </ListHeader>
                <KeepAlive>
                  <add-edit-prescription-unit
                    v-if="
                      website ||
                      (prescriptionUnitsReady &&
                        (selected_model[identifier.service.code] ||
                          (selected_model[identifier.service.code] ===
                            undefined &&
                            identifier.service.code === 'TARV')))
                    "
                    :key="identifier.id"
                    :identifier="identifier"
                  />
                </KeepAlive>
              </q-card-section>
            </q-card>
            <q-separator />
          </q-expansion-item>
        </q-list>
        <div class="row q-mt-xs tablet-dispense-mode-row">
          <q-banner dense inline-actions class="col text-white q-pa-none bg-orange-4 tablet-dispense-mode">
            <div class="q-pa-md">
              <div class="q-gutter-sm">
                <q-radio v-model="mds" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="US_"
                  label="Farmácia Pública" @update:model-value="dispenseMode = []" />
                <q-radio v-model="mds" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="DD_"
                  label="Dipensa Descentralizada" @update:model-value="dispenseMode = []" />
                <q-radio v-model="mds" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" val="DC_"
                  label="Dispensa Comunitária" @update:model-value="dispenseMode = []" />
              </div>
            </div>
            <template v-slot:action>
              <q-select style="width: 320px" class="col q-ma-sm" bg-color="white" dense outlined ref="dispenseModeRef"
                v-model="dispenseMode" :options="dispenseModes" option-value="id" option-label="description"
                label="Modo de dispensa" />
            </template>
          </q-banner>
        </div>
      </q-card-section>
    </q-scroll-area>
    <q-card-actions
      align="right"
      :class="{ 'tablet-prescription-actions': !website }"
    >
      <q-btn
        label="Cancelar"
        color="red"
        @click="closePrescriptionOption"
      />
      <q-btn
        :label="dispenseLabel"
        loader
        :disable="curPatientVisit.patientVisitDetails.length === 0"
        :loading="submitting"
        @click="doValidationToDispense()"
        color="primary"
        class="q-ml-md"
      />
    </q-card-actions>
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
import { useEpisode } from 'src/composables/episode/episodeMethods';
import episodeService from 'src/services/api/episode/episodeService';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
// Declaration
const { idadeCalculator, getDDMMYYYFromJSDate, getYYYYMMDDFromJSDate } =
  useDateUtils();
const { fullName } = usePatient();
const { alertSucess, alertError } = useSwal();
const mds = ref('US_');
const dispenseMode = ref();
const selected_model = ref([]);
const selectedMember = ref(null);
const submitting = ref(false);
const mobileInitialEpisodeIdentifiers = ref([]);
const mobileReferralEpisodeIdentifiers = ref([]);
const curPatientVisit = ref(new PatientVisit({ id: uuidv4() }));
const { isReferenceOrTransferenceEpisode } = useEpisode();
const { isOnlyPharmacyDDDO, isOnlyComunitaryDispense } = useSystemConfig();
const { isOnline } = useSystemUtils();
//Inject
const patient = inject('patient');
const website = inject('website');
const closePrescriptionOption = inject('closePrescriptionOption');
const prescriptionIdentifiersReady = ref(website.value);
const prescriptionUnitsReady = ref(website.value);

//Hook
onMounted(() => {
  init();
  if (!website.value) {
    requestAnimationFrame(() => {
      mobileInitialEpisodeIdentifiers.value =
        patientServiceIdentifierService.getAllIdentifierWithInicialEpisodeByPatient(
          patient.value.id
        );
      mobileReferralEpisodeIdentifiers.value =
        patientServiceIdentifierService.getAllIdentifierWithREferralEpisodeByPatient(
          patient.value.id
        );
      prescriptionIdentifiersReady.value = true;

      requestAnimationFrame(() => {
        prescriptionUnitsReady.value = true;
      });
    });
  }
});

// Computed
const dispenseModes = computed(() => {
  return mds.value !== null
    ? dispenseModeService.getAllFromDispenseModeType(mds.value)
    : [];
});

const getIdentifierWithInicialEpisode = computed(() => {
  if (!website.value) return mobileInitialEpisodeIdentifiers.value;
  return patientServiceIdentifierService.getAllIdentifierWithInicialEpisodeByPatient(
    patient.value.id
  );
});

const getIdentifierWithRefferalEpisode = computed(() => {
  if (!website.value) return mobileReferralEpisodeIdentifiers.value;
  return patientServiceIdentifierService.getAllIdentifierWithREferralEpisodeByPatient(
    patient.value.id
  );
});

const currClinic = computed(() => {
  return clinicService.currClinic();
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

  if (isOnlyPharmacyDDDO()) {
    mds.value = 'DD_';
  }
  if (isOnlyComunitaryDispense()) {
    mds.value = 'DC_';
  }
};

const doValidationToDispense = () => {
  curPatientVisit.value.clinic = {};
  curPatientVisit.value.clinic.id = patient.value.clinic_id;
  curPatientVisit.value.patient = {};
  curPatientVisit.value.patient.id = patient.value.id;

  curPatientVisit.value.origin = currClinic.value.id;
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
      patientVisitDetail.origin = currClinic.value.id;
      patientVisitDetail.clinic = {};
      patientVisitDetail.clinic.id = patient.value.clinic_id;
      patientVisitDetail.episode = {};
      patientVisitDetail.episode.id = patientVisitDetail.episode_id;
      patientVisitDetail.pack.clinic = {};
      patientVisitDetail.pack.clinic.id = patient.value.clinic_id;
      patientVisitDetail.pack.dispenseMode = {};
      patientVisitDetail.pack.dispenseMode.id = dispenseMode.value.id;
      patientVisitDetail.pack.syncStatus = 'R';

      if (isOnlyPharmacyDDDO() || isOnlyComunitaryDispense()) {
        patientVisitDetail.pack.providerUuid = null;
      } else {
        patientVisitDetail.pack.providerUuid = sessionStorage.getItem('Btoa');
      }

      patientVisitDetail.pack.origin = currClinic.value.id;
      patientVisitDetail.pack.packagedDrugs.forEach((packagedDrug) => {
        packagedDrug.drug = {};
        packagedDrug.drug.id = packagedDrug.drug_id;

        packagedDrug.origin = currClinic.value.id;
      });
      patientVisitDetail.prescription.clinic = {};
      patientVisitDetail.prescription.clinic.id = patient.value.clinic_id;

      if (patientVisitDetail.prescription.origin !== patient.value.clinic_id) {
        patientVisitDetail.prescription.origin = currClinic.value.id;
      }

      patientVisitDetail.prescription.prescribedDrugs.forEach(
        (prescribedDrug) => {
          let drugID = prescribedDrug.drug.id;
          prescribedDrug.drug = {};
          prescribedDrug.drug.id = drugID;

          if (prescribedDrug.origin !== patient.value.clinic_id) {
            prescribedDrug.origin = currClinic.value.id;
          }
        }
      );
      const checkEpisode = episodeService.getEpisodeById(
        patientVisitDetail.episode_id
      );
      const lastEpisode = episodeService.lastEpisodeByIdentifier(
        checkEpisode.patientServiceIdentifier_id
      );

      if (isReferenceOrTransferenceEpisode(lastEpisode)) {
        patientVisitDetail.pack.isreferral = true;
      }
    });
    patientVisitService
      .post(curPatientVisit.value)
      .then((resp) => {
        submitting.value = false;
        alertSucess('Dispensa efectuada com sucesso');
        closePrescriptionOption();
        if (website.value || isOnline.value) {
          patient.value.identifiers.forEach((identifiers) => {
            patientServiceIdentifierService.apiFetchById(identifiers.id);
          });
        }
      })
      .catch((error) => {
        submitting.value = false;
        alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  }
};

provide('curPatientVisit', curPatientVisit);
provide('currClinic', currClinic);
provide('selectedMember', selectedMember);
</script>

<style lang="scss">
.prescription-box {
  border: 1px solid $grey-4;
}

.box-border {
  border: 1px solid $grey-4;
}

.tablet-prescription-card {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
}

.tablet-prescription-patient-header {
  min-height: 38px;
  padding: 4px 12px !important;
}

.tablet-prescription-close {
  padding: 2px 8px !important;
}

.tablet-prescription-scroll {
  height: auto !important;
  min-height: 0;
  flex: 1 1 auto;
  padding-right: 0 !important;
  overflow: hidden;
}

.tablet-prescription-scroll .q-scrollarea__content {
  width: 100% !important;
  min-width: 0 !important;
}

.tablet-prescription-scroll .q-scrollarea__container {
  overflow-x: hidden !important;
}

.tablet-prescription-content {
  padding: 5px 8px 0 !important;
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

.tablet-prescription-card .q-expansion-item__container > .q-item {
  min-height: 34px;
  padding-top: 2px;
  padding-bottom: 2px;
}

.tablet-prescription-card .q-expansion-item__content > .q-card > .q-card__section {
  padding: 5px 7px !important;
}

.tablet-prescription-card .tablet-dispense-mode .q-banner__content {
  min-height: 42px;
  padding: 2px 8px;
}

.tablet-prescription-card .tablet-dispense-mode .q-pa-md {
  padding: 2px 6px !important;
}

.tablet-prescription-card .tablet-dispense-mode .q-radio {
  min-height: 32px;
}

.tablet-prescription-card .tablet-dispense-mode .q-field {
  margin: 2px 6px !important;
}

.tablet-prescription-actions {
  min-height: 44px;
  flex: 0 0 44px;
  padding: 4px 10px !important;
  border-top: 1px solid $grey-4;
  background: white;
  z-index: 2;
}
</style>
