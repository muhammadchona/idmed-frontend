<template>
  <q-card style="width: 900px; max-width: 90vw">
    <form @submit.prevent="submitForm">
      <q-card-section class="q-pa-none bg-green-2">
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
          <div class="text-grey-10 q-ml-sm" v-if="age(patient) <= 14">
            <span class="text-bold text-h6">
              | <q-icon name="child_care" />
            </span>
            {{ age(patient) }} Ano(s) de Idade
          </div>
          <div class="text-grey-10 q-ml-sm" v-else>
            <span class="text-bold text-h6">|</span> {{ age(patient) }} Anos de
            Idade
          </div>
        </div>
        <q-separator />
      </q-card-section>
      <div class="text-center text-h6 q-mt-sm">
        <span v-if="!isNewEpisode && !isClosingEpisode">Actualizar</span>
        <span v-else-if="!isNewEpisode && isClosingEpisode">Fechar</span>
        <span v-else>Adicionar</span>
        Histórico Clínico
      </div>
      <div class="q-mx-lg">
        <div class="q-mt-lg">
          <div class="row items-center q-mb-sm">
            <span class="text-subtitle2"
              >Dados de início do Histórico Clínico</span
            >
          </div>
          <q-separator color="grey-13" size="1px" class="q-mb-sm" />
        </div>
        <div class="row q-mt-md">
          <q-select
            class="col"
            disable
            dense
            outlined
            v-model="curIdentifier.service"
            ref="serviceRef"
            option-value="id"
            option-label="description"
            label="Serviço de Saúde"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Por favor indicar a data de admissão',
            ]"
          />

          <q-input
            dense
            outlined
            disable
            class="col q-ml-md"
            v-model="identifierstartDate"
            ref="identifierstartDateRef"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Por favor indicar a data de admissão',
            ]"
            label="Data de Admissão"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date v-model="curIdentifier.startDate" mask="DD-MM-YYYY">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-select
            class="col q-ml-md"
            dense
            outlined
            v-model="episode.startStopReason"
            :disable="!canEditEpisode || isClosingEpisode"
            :options="startReasons"
            ref="startReasonRef"
            :rules="[(val) => !!val || 'Por favor indicar a nota de início']"
            option-value="id"
            option-label="reason"
            @update:model-value="
              selectedDistrict = null;
              selectedClinicSector = null;
            "
            label="Notas de início *"
          />
        </div>
        <div class="row q-mt-md">
          <q-select
            v-if="isOnline"
            class="col"
            dense
            outlined
            :disable="!canEditEpisode || isClosingEpisode"
            ref="clinicSerctorRef"
            :rules="[
              (val) =>
                !!val ||
                'Por favor indicar o sector onde vai ocorrer o atendimento',
            ]"
            v-model="episode.clinicSector"
            :options="clinicSerctors"
            option-value="id"
            option-label="clinicName"
            label="Sector Clinico *"
          />
          <q-select
            v-if="!isOnline"
            class="col"
            dense
            outlined
            disable
            ref="clinicSerctorRef"
            :rules="[
              (val) =>
                !!val ||
                'Por favor indicar o sector onde vai ocorrer o atendimento',
            ]"
            v-model="episode.clinicSector"
            :options="mobileClinicSector"
            option-value="id"
            option-label="clinicName"
            label="Sector Clinico *"
          />
          <q-input
            dense
            outlined
            :disable="!canEditEpisode || isClosingEpisode"
            class="col q-ml-md"
            v-model="startDate"
            ref="startDateRef"
            :rules="[
              (val) =>
                (val && val.length > 0) || 'Por favor indicar a data de início',
            ]"
            label="Data de Início *"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="startDate"
                    :options="optionsNonFutureDate"
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
          <div
            class="col q-ml-md"
            v-if="String(episode?.startStopReason?.code) === 'TRANSITO'"
          >
            <q-radio
              v-model="episode.residentInCountry"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              :val="true"
              :disable="!canEditEpisode || isClosingEpisode"
              label="Nacional"
            />
            <q-radio
              v-model="episode.residentInCountry"
              checked-icon="task_alt"
              unchecked-icon="panorama_fish_eye"
              :val="false"
              :disable="!canEditEpisode || isClosingEpisode"
              label="Estrangeiro"
              @update:model-value="
                selectedDistrict = null;
                selectedClinicSector = null;
              "
            />
          </div>
          <div class="col q-ml-md" v-else></div>
        </div>
        <span
          v-if="(isClosingEpisode && hasVisits(episode)) || isNationalTransit"
        >
          <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
              <span
                class="text-subtitle2"
                v-if="isNationalTransit && !hasVisits(episode)"
                >Selecione a Unidade Sanitaria de origem</span
              >
              <span class="text-subtitle2" v-else
                >Dados de Fim do Histórico Clínico</span
              >
            </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm" />
          </div>
          <div class="row" v-if="hasVisits(episode)">
            <q-input
              dense
              outlined
              class="col"
              v-model="stopDate"
              ref="stopDateRef"
              label="Data de Fim*"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="stopDate"
                      :options="optionsNonFutureDate"
                      mask="DD-MM-YYYY"
                    >
                      <div class="row items-center justify-end">
                        <q-btn
                          v-close-popup
                          label="Close"
                          color="primary"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-select
              class="col q-ml-md"
              dense
              outlined
              ref="stopReasonRef"
              :rules="[
                (val) => !!val || 'Por favor indicar do histórico clínico',
              ]"
              v-model="closureEpisode.startStopReason"
              :options="stopReasons"
              option-value="id"
              option-label="reason"
              label="Notas de Fim do Histórico Clínico *"
            />
          </div>

          <div
            class="row"
            v-if="
              isReferenceEpisode ||
              isTransferenceEpisode ||
              (isNationalTransit && !hasVisits(episode))
            "
          >
            <q-select
              class="col"
              dense
              outlined
              v-model="selectedProvince"
              use-input
              ref="provinceRef"
              input-debounce="0"
              :options="provinces"
              option-value="id"
              option-label="description"
              @update:model-value="
                selectedDistrict = null;
                selectedClinicSector = null;
              "
              label="Província"
            />
            <q-select
              class="col q-ml-md"
              dense
              outlined
              v-model="selectedDistrict"
              use-input
              ref="districtRef"
              input-debounce="0"
              :options="districts"
              option-value="id"
              option-label="description"
              @update:model-value="selectedClinicSector = null"
              label="Distrito"
            />
            <q-select
              class="col q-ml-md"
              dense
              outlined
              ref="referralClinicRef"
              :rules="[
                (val) =>
                  !!val ||
                  (isNationalTransit
                    ? 'Por favor indicar a origem do paciente.'
                    : 'Por favor indicar o destino do paciente.'),
              ]"
              v-model="selectedClinicSector"
              :options="referralClinics"
              option-value="id"
              option-label="clinicName"
              :label="patientDestinationfieldLabel"
            />
          </div>
          <div class="row" v-if="isDCReferenceEpisode">
            <q-select
              class="col"
              dense
              outlined
              v-model="selectedClinicSectorType"
              use-input
              ref="clinicSectorTypeRef"
              input-debounce="0"
              :options="facilityTypesSectors"
              option-value="id"
              option-label="description"
              label="Tipo de Sector de Dispensa"
              @update:model-value="selectedClinicSector = null"
            />
            <q-select
              class="col q-ml-md"
              dense
              outlined
              :disable="episode.id !== null && isEditStep"
              ref="referealClinicSectorRef"
              :rules="[
                (val) => !!val || 'Por favor indicar o sector de dispensa.',
              ]"
              v-model="selectedClinicSector"
              :options="referealClinicSectors"
              option-value="id"
              option-label="clinicName"
              label="Sector de Dispensa"
            />
          </div>
          <div class="row" v-if="isSectorReferenceEpisode">
            <q-select
              class="col"
              dense
              outlined
              :disable="episode.id !== null && isEditStep"
              ref="referealClinicSectorRef"
              :rules="[
                (val) => !!val || 'Por favor indicar o sector de dispensa.',
              ]"
              v-model="selectedClinicSector"
              :options="referealClinicSectorsRSC"
              option-value="id"
              option-label="clinicName"
              label="Sector de Dispensa"
            />
          </div>
          <div class="row">
            <q-input
              v-model="closureEpisode.notes"
              label="Outras notas do Histórico Clínico"
              :disable="episode.id !== null && isEditStep"
              ref="endNotesRef"
              :rules="[
                (val) => !!val || 'Por favor indicar do histórico clínico',
              ]"
              dense
              class="col"
            />
          </div>
        </span>
      </div>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="closeEpisodeCreation" />
        <q-btn
          type="submit"
          :loading="submitting"
          label="Submeter"
          color="primary"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
import moment from 'moment';
import { computed, inject, onMounted, ref } from 'vue';
import Episode from 'src/stores/models/episode/Episode';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { usePatient } from 'src/composables/patient/patientMethods';
import startStopReasonService from 'src/services/api/startStopReasonService/startStopReasonService';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import episodeService from 'src/services/api/episode/episodeService';
import clinicService from 'src/services/api/clinicService/clinicService';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService';
import provinceService from 'src/services/api/provinceService/provinceService';
import districtService from 'src/services/api/districtService/districtService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import episodeTypeService from 'src/services/api/episodeType/episodeTypeService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { v4 as uuidv4 } from 'uuid';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import facilityTypeService from 'src/services/api/facilityTypeService/facilityTypeService';
import { useLoading } from 'src/composables/shared/loading/loading';

//Declaration
const {
  getDDMMYYYFromJSDate,
  isValidDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
  extractHyphenDateFromDMYConvertYMD,
  getDateFromHyphenDDMMYYYYWithTime,
} = useDateUtils();
const { alertSucess, alertError } = useSwal();
const { fullName, age } = usePatient();
const { isReferenceOrTransferenceEpisode, hasVisits } = useEpisode();
const { remainigDurationInWeeks } = usePrescription();
const { closeLoading, showloading } = useLoading();
const { isOnline } = useSystemUtils();

const submitting = ref(false);
const closureEpisode = ref(new Episode({ id: uuidv4() }));
const episode = ref(new Episode({ id: uuidv4() }));
const startDate = ref('');
const stopDate = ref('');
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedClinicSectorType = ref(null);
const selectedClinicSector = ref(null);

//Ref's

const serviceRef = ref(null);
const identifierstartDateRef = ref(null);
const startReasonRef = ref(null);
const clinicSerctorRef = ref(null);
const startDateRef = ref(null);
const stopDateRef = ref(null);
const stopReasonRef = ref(null);
const provinceRef = ref(null);
const districtRef = ref(null);
const referralClinicRef = ref(null);
const clinicSectorTypeRef = ref(null);
const referealClinicSectorRef = ref(null);
const endNotesRef = ref(null);

// Injection
const curIdentifier = inject('curIdentifier');
const curEpisode = inject('curEpisode');
const lastPack = inject('lastPack');
const patient = inject('patient');
const isEditStep = inject('isEditStep');
const isNewEpisode = inject('isNewEpisode');
const isClosingEpisode = inject('isClosingEpisode');
const closeEpisodeCreation = inject('closeEpisodeCreation');

//Hooks
onMounted(() => {
  init();
});
// Computed
const patientDestinationfieldLabel = computed(() => {
  if (isTransferenceEpisode.value) {
    return 'US de Transferência';
  } else if (isReferenceEpisode.value) {
    return 'Farmácia de Referência';
  } else {
    return 'US de Origem';
  }
});

const currClinic = computed(() => {
  return clinicService.currClinic();
});

const canEditEpisode = computed(() => {
  return episode.value.patientVisitDetails.length <= 0;
});

const provinces = computed(() => {
  if (isReferenceEpisode.value) {
    return provinceService.getAllProvincesById(
      curIdentifier.value.clinic.province_id
    );
  } else {
    return provinceService.getAllProvinces();
  }
});

const facilityTypesSectors = computed(() => {
  return facilityTypeService.getFacilityTypeClinicSectorForDC();
});

const referealClinicSectors = computed(() => {
  if (selectedClinicSectorType.value === null) return [];
  return clinicSectorService.getClinicSectorsByFacilityTypeId(
    currClinic.value.id,
    selectedClinicSectorType.value.id
  );
});

const referealClinicSectorsRSC = computed(() => {
  const facilityType = facilityTypeService.getFacilityTypeParagemUnica();
  return clinicSectorService.getClinicSectorsByFacilityTypeId(
    currClinic.value.id,
    facilityType.id
  );
});

const districts = computed(() => {
  if (selectedProvince.value !== null && selectedProvince.value !== undefined) {
    if (
      isReferenceEpisode.value ||
      isTransferenceEpisode.value ||
      isNationalTransit
    ) {
      return districtService.getAllDistrictByProvinceId(
        selectedProvince.value.id
      );
    } else {
      return [];
    }
  } else {
    return [];
  }
});

const isNationalTransit = computed(() => {
  return (
    String(episode?.value?.startStopReason?.code) === 'TRANSITO' &&
    episode.value.residentInCountry
  );
});

const isReferenceEpisode = computed(() => {
  if (closureEpisode.value === null || closureEpisode.value === undefined)
    return false;
  if (
    closureEpisode.value.startStopReason === null ||
    closureEpisode.value.startStopReason === undefined
  )
    return false;
  return closureEpisode.value.startStopReason.code === 'REFERIDO_PARA';
});

const isDCReferenceEpisode = computed(() => {
  if (closureEpisode.value === null || closureEpisode.value === undefined)
    return false;
  if (
    closureEpisode.value.startStopReason === null ||
    closureEpisode.value.startStopReason === undefined
  )
    return false;
  return closureEpisode.value.startStopReason.code === 'REFERIDO_DC';
});

const isTransferenceEpisode = computed(() => {
  if (closureEpisode.value === null || closureEpisode.value === undefined)
    return false;
  if (
    closureEpisode.value.startStopReason === null ||
    closureEpisode.value.startStopReason === undefined
  )
    return false;
  return closureEpisode.value.startStopReason.code === 'TRANSFERIDO_PARA';
});

const isSectorReferenceEpisode = computed(() => {
  if (closureEpisode.value === null || closureEpisode.value === undefined)
    return false;
  if (
    closureEpisode.value.startStopReason === null ||
    closureEpisode.value.startStopReason === undefined
  )
    return false;
  return (
    closureEpisode.value.startStopReason.code === 'REFERIDO_SECTOR_CLINICO'
  );
});
const identifierstartDate = computed(() => {
  return getDDMMYYYFromJSDate(curIdentifier.value.startDate);
});

const clinicSerctors = computed(() => {
  const allClinicSectors = clinicSectorService.getActiveUSClinicSectorByClinic(
    curIdentifier.value.clinic_id
  );
  if (patient.value.gender === 'Masculino') {
    let clinicSectorsMale = [];
    clinicSectorsMale = allClinicSectors.filter((sector) => {
      return sector.code !== 'CPN';
    });
    return clinicSectorsMale;
  }
  return allClinicSectors;
});

const mobileClinicSector = computed(() => {
  const clinicSectorCode = localStorage.getItem('clinicUsers');

  if (!clinicSectorService.getClinicSectorByCode(clinicSectorCode)) {
    return clinicService.getByCode(clinicSectorCode);
  } else {
    return clinicSectorService.getClinicSectorByCode(clinicSectorCode);
  }
});

const referralClinics = computed(() => {
  if (selectedDistrict.value !== null) {
    if (isReferenceEpisode.value) {
      return clinicService.getAllPrivateFromDistrict(selectedDistrict.value.id);
    } else {
      return clinicService.getAllUSFromDistrict(selectedDistrict.value.id);
    }
  }
  return [];
});

const lastEpisode = computed(() => {
  return episodeService.lastEpisodeByIdentifier(curIdentifier.value.id);
});

const startReasons = computed(() => {
  let allReasons = startStopReasonService.getAllStartReasons();
  let resonList = [];
  if (allReasons === undefined || allReasons === null) {
    allReasons = [];
  }
  if (
    lastEpisode.value !== null &&
    isReferenceOrTransferenceEpisode(lastEpisode.value)
  ) {
    resonList = allReasons.filter((reason) => {
      return reason.code === 'VOLTOU_REFERENCIA';
    });
    return resonList;
  } else {
    resonList = allReasons.filter((reason) => {
      return reason.code !== 'VOLTOU_REFERENCIA';
    });
    return resonList;
  }
});

const stopReasons = computed(() => {
  let allReasons = startStopReasonService.getAllStopReasons();
  let resonList = [];
  if (allReasons === undefined || allReasons === null) {
    allReasons = [];
  }

  if (!isOnline.value) {
    resonList = allReasons.filter((reason) => {
      return (
        reason.code !== 'REFERIDO_DC' &&
        reason.code !== 'TRANSFERIDO_PARA' &&
        reason.code !== 'REFERIDO_PARA' &&
        reason.code !== 'FIM_PPE' &&
        reason.code !== 'TERMINO_DO_TRATAMENTO' &&
        reason.code !== 'OBITO' &&
        reason.code !== 'TSPC' &&
        reason.code !== 'REFERIDO_SECTOR_CLINICO' &&
        reason.code !== 'VOLTOU_A_SER_REFERIDO_PARA'
      );
    });
    return resonList;
  }
  if (
    lastEpisode.value !== null &&
    isReferenceOrTransferenceEpisode(lastEpisode.value)
  ) {
    resonList = allReasons.filter((reason) => {
      return (
        reason.code !== 'REFERIDO_DC' &&
        reason.code !== 'TRANSFERIDO_PARA' &&
        reason.code !== 'REFERIDO_PARA' &&
        reason.code !== 'FIM_PPE' &&
        reason.code !== 'TERMINO_DO_TRATAMENTO' &&
        reason.code !== 'OBITO' &&
        reason.code !== 'TSPC'
      );
    });
    return resonList;
  } else {
    resonList = allReasons.filter((reason) => {
      return (
        reason.code !== 'TRANSFERIDO_PARA' &&
        reason.code !== 'FIM_PPE' &&
        reason.code !== 'TERMINO_DO_TRATAMENTO' &&
        reason.code !== 'OBITO' &&
        reason.code !== 'TSPC'
      );
    });
    return resonList;
  }
});

// Methods
const optionsNonFutureDate = (dateOfBirth) => {
  return dateOfBirth <= moment().format('YYYY/MM/DD');
};
const init = async () => {
  selectedProvince.value = provinceService.getAllProvincesById(
    curIdentifier.value.clinic.province_id
  );
  if (isNewEpisode.value) {
    episode.value = new Episode();
    episode.value.id = uuidv4();
    episode.value.syncStatus = 'R';
    startDate.value = getDDMMYYYFromJSDate(moment());
    if (!isOnline.value) {
      episode.value.clinicSector = mobileClinicSector.value;
    }
  } else {
    closureEpisode.value = new Episode();
    closureEpisode.value.id = uuidv4();
    closureEpisode.value.syncStatus = 'R';
    episode.value.syncStatus = 'U';

    if (curEpisode !== null && curEpisode !== undefined) {
      episode.value = episodeService.lastEpisodeByIdentifier(
        curIdentifier.value.id
      );
      if (isNationalTransit.value) {
        selectedClinicSector.value = episode.value.referralClinic;
        selectedDistrict.value = episode.value.referralClinic.district;
      }
      startDate.value = getDDMMYYYFromJSDate(episode.value.episodeDate);
    }
  }
};
const submitForm = () => {
  submitting.value = true;
  startReasonRef.value.validate();
  clinicSerctorRef.value.validate();
  startDateRef.value.validate();

  if (
    !startReasonRef.value.hasError &&
    !startDateRef.value.hasError &&
    !clinicSerctorRef.value.hasError
  ) {
    if (isNewEpisode.value) {
      if (lastEpisode.value !== null) {
        if (
          getYYYYMMDDFromJSDate(
            extractHyphenDateFromDMYConvertYMD(startDate.value)
          ) < getYYYYMMDDFromJSDate(lastEpisode.value.episodeDate)
        ) {
          alertError(
            'A data indicada não pode ser menor que a data do último histórico clínico.'
          );
          submitting.value = false;
          return;
        }
      }
    }

    if (!isValidDate(String(getDateFromHyphenDDMMYYYY(startDate.value)))) {
      alertError('A data de inicio é inválida.');
      submitting.value = false;
    } else if (
      getYYYYMMDDFromJSDate(
        extractHyphenDateFromDMYConvertYMD(startDate.value)
      ) > moment().format('YYYY-MM-DD')
    ) {
      alertError('A data de inicio indicada é maior que a data da corrente.');
      submitting.value = false;
    } else if (
      getYYYYMMDDFromJSDate(
        extractHyphenDateFromDMYConvertYMD(startDate.value)
      ) < getYYYYMMDDFromJSDate(curIdentifier.value.startDate)
    ) {
      alertError(
        'A data de inicio indicada é menor que a data de admissão ao serviço clínico.'
      );
      submitting.value = false;
    } else if (!isNewEpisode.value && !isClosingEpisode.value) {
      if (
        hasVisits(episode.value) &&
        getYYYYMMDDFromJSDate(
          extractHyphenDateFromDMYConvertYMD(startDate.value)
        ) <
          getYYYYMMDDFromJSDate(
            extractHyphenDateFromDMYConvertYMD(lastPack.value.pickupDate)
          )
      ) {
        alertError(
          'A data de inicio indicada é menor que a data da ultima visita efectuada pelo paciente.'
        );
        submitting.value = false;
      } else {
        doSave();
      }
    } else if (!isNewEpisode.value && isClosingEpisode.value) {
      stopDateRef.value.validate();
      stopReasonRef.value.validate();
      endNotesRef.value.validate();

      if (
        !stopDateRef.value.hasError &&
        !stopReasonRef.value.hasError &&
        !endNotesRef.value.hasError
      ) {
        if (!isValidDate(String(getDateFromHyphenDDMMYYYY(stopDate.value)))) {
          alertError('A data de Fim é inválida.');
          submitting.value = false;
        } else if (
          getYYYYMMDDFromJSDate(
            extractHyphenDateFromDMYConvertYMD(startDate.value)
          ) >
          getYYYYMMDDFromJSDate(
            extractHyphenDateFromDMYConvertYMD(stopDate.value)
          )
        ) {
          alertError('A data de Fim indicada é menor que a data de início.');
          submitting.value = false;
        } else if (
          hasVisits(episode.value) &&
          getYYYYMMDDFromJSDate(
            extractHyphenDateFromDMYConvertYMD(stopDate.value)
          ) <
            getYYYYMMDDFromJSDate(
              extractHyphenDateFromDMYConvertYMD(lastPack.value.pickupDate)
            )
        ) {
          alertError(
            'A data de Fim indicada é menor que a data da ultima visita efectuada pelo paciente.'
          );
          submitting.value = false;
        } else if (
          (isReferenceEpisode.value || isDCReferenceEpisode.value) &&
          !identifierHasValidPrescription(episode.value)
        ) {
          alertError(
            'O paciente deve ter registo de uma prescrição válida e dispensa para poder ser referido.'
          );
          submitting.value = false;
        } else if (
          isReferenceEpisode.value ||
          isTransferenceEpisode.value ||
          isNationalTransit.value
        ) {
          endNotesRef.value.validate();
          if (endNotesRef.value.hasError) {
            alertError('Por favor indicar notas do histórico clínico.');
            submitting.value = false;
          } else {
            doSave();
          }
        } else {
          doSave();
        }
      } else {
        submitting.value = false;
      }
    } else if (isNationalTransit.value) {
      referralClinicRef.value.validate();
      endNotesRef.value.validate();
      if (referralClinicRef.value.hasError) {
        alertError('Por favor indicar a origem do paciente.');
        submitting.value = false;
      } else if (endNotesRef.value.hasError) {
        alertError('Por favor indicar notas do histórico clínico.');
        submitting.value = false;
      } else {
        doSave();
      }
    } else {
      doSave();
    }
  } else {
    submitting.value = false;
  }
};
const doSave = async () => {
  if (isNewEpisode.value) {
    episode.value.episodeType =
      episodeTypeService.getEpisodeTypeByCode('INICIO');
    episode.value.notes = 'Novo histórico clínico';
    episode.value.clinic = {};
    episode.value.clinic.id = currClinic.value.id;
    episode.value.patientServiceIdentifier = curIdentifier.value;
    episode.value.episodeDate = getDateFromHyphenDDMMYYYYWithTime(
      startDate.value
    );
    episode.value.creationDate = new Date();
    episode.value.patientVisitDetails = [];
    episode.value.patientServiceIdentifier = {};
    episode.value.patientServiceIdentifier.id = curIdentifier.value.id;
    episode.value.patientServiceIdentifier_id = curIdentifier.value.id;
    episode.value.origin = currClinic.value.id;
  } else {
    episode.value.creationDate = new Date();
    episode.value.clinicSector_id = episode.value.clinicSector.id;
    const clinicSectorId = episode.value.clinicSector.id;
    episode.value.clinicSector = {};
    episode.value.clinicSector.id = clinicSectorId;
    episode.value.clinicSector_id = clinicSectorId;
    episode.value.clinic = {};
    episode.value.clinic.id = currClinic.value.id;
    episode.value.episodeDate = isClosingEpisode.value
      ? episode.value.episodeDate
      : getDateFromHyphenDDMMYYYYWithTime(startDate.value);
    episode.value.patientVisitDetails = [];
    closureEpisode.value.patientServiceIdentifier = {};
    closureEpisode.value.patientServiceIdentifier.id = curIdentifier.value.id;
    closureEpisode.value.patientServiceIdentifier_id = curIdentifier.value.id;
    episode.value.patientVisitDetails = [];
    episode.value.patientServiceIdentifier = {};
    episode.value.patientServiceIdentifier.id = curIdentifier.value.id;
    episode.value.patientServiceIdentifier_id = curIdentifier.value.id;
    if (isClosingEpisode.value) {
      episode.value.isLast = false;
      closureEpisode.value.clinicSector =
        selectedClinicSector.value !== null
          ? selectedClinicSector.value
          : episode.value.clinicSector;
      closureEpisode.value.clinicSector_id =
        closureEpisode.value.clinicSector.id;
      closureEpisode.value.isLast = true;
      closureEpisode.value.episodeType =
        episodeTypeService.getEpisodeTypeByCode('FIM');
      closureEpisode.value.clinic = {};
      closureEpisode.value.clinic.id = currClinic.value.id;
      closureEpisode.value.episodeDate = getDateFromHyphenDDMMYYYYWithTime(
        stopDate.value
      );
      closureEpisode.value.creationDate = new Date();
      closureEpisode.value.patientServiceIdentifier = {};
      closureEpisode.value.patientServiceIdentifier.id = curIdentifier.value.id;
      closureEpisode.value.patientVisitDetails = [];
      episode.value.origin = currClinic.value.id;
      closureEpisode.value.origin = currClinic.value.id;
    }
  }
  if (isNationalTransit.value) {
    episode.value.notes = closureEpisode.value.notes;
    episode.value.referralClinic = selectedClinicSector.value;
  }

  episodeService
    .apiSave(episode.value, isNewEpisode.value)
    .then(() => {
      if (isClosingEpisode.value) {
        showloading();
        episodeService
          .apiSave(closureEpisode.value, true)
          .then(() => {
            if (
              closureEpisode.value.startStopReason.code ===
                'TRANSFERIDO_PARA' ||
              closureEpisode.value.startStopReason.code === 'OBITO' ||
              closureEpisode.value.startStopReason.code ===
                'REFERIDO_SECTOR_CLINICO' ||
              closureEpisode.value.startStopReason.code === 'REFERIDO_PARA' ||
              closureEpisode.value.startStopReason.code === 'REFERIDO_DC'
            ) {
              curIdentifier.value.patient.identifiers.forEach((identifiers) => {
                patientServiceIdentifierService.apiFetchById(identifiers.id);
                closeLoading();
              });
            } else {
              closeLoading();
            }
          })
          .catch((error) => {
            console.log(error);
            closeLoading();
            alertError(
              'Aconteceu um erro ao durante a operacao de registo do Histórico Clínico de Fecho'
            );
          });
      }
      alertSucess(
        isNewEpisode.value
          ? 'Histórico Clínico adicionado com sucesso.'
          : 'Histórico Clínico actualizado com sucesso.'
      );
      closeEpisodeCreation();
    })
    .catch((error) => {
      console.log(error);
      alertError('Aconteceu um erro ao gravar o episódio');
      submitting.value = false;
    });
};
const identifierHasValidPrescription = (episode) => {
  const lastPatientVisitDetail =
    patientVisitDetailsService.getLastPatientVisitDetailFromPatientVisitAndEpisode(
      lastPatientVisita(episode).id,
      episode.id
    );
  if (lastPatientVisitDetail !== null && lastPatientVisitDetail !== undefined) {
    return remainigDurationInWeeks(lastPatientVisitDetail.prescription) > 0;
  }
  return false;
};

const lastPatientVisita = (lastStartEpisode) => {
  const listPatietVisitIds = [];
  if (lastStartEpisode !== null && lastStartEpisode !== undefined) {
    const listPatietVisitDetails =
      patientVisitDetailsService.getAllPatientVisitDetailsFromEpisode(
        lastStartEpisode.id
      );
    if (
      listPatietVisitDetails !== null &&
      listPatietVisitDetails !== undefined
    ) {
      listPatietVisitDetails.forEach((patientvisitdetails) => {
        listPatietVisitIds.push(patientvisitdetails.patient_visit_id);
      });
    }
    return patientVisitService.getLastFromPatientVisitList(listPatietVisitIds);
  } else {
    return null;
  }
};
</script>

<style></style>
