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
        <span v-if="!isNewEpisode && !isCloseEpisode">Actualizar</span>
        <span v-else-if="!isNewEpisode && isCloseEpisode">Fechar</span>
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
            :disable="!canEditEpisode || isCloseEpisode"
            :options="startReasons"
            ref="startReasonRef"
            :rules="[(val) => !!val || 'Por favor indicar a nota de início']"
            option-value="id"
            option-label="reason"
            label="Notas de início *"
          />
        </div>
        <div class="row q-mt-md">
          <q-select
            class="col"
            dense
            outlined
            :disable="!canEditEpisode || isCloseEpisode"
            ref="clinicSerctorRef"
            :rules="[
              (val) =>
                !!val ||
                'Por favor indicar o sector onde vai ocorrer o atendimento',
            ]"
            v-model="episode.clinicSector"
            :options="clinicSerctors"
            option-value="id"
            option-label="description"
            label="Sector Clinico *"
          />
          <q-input
            dense
            outlined
            :disable="!canEditEpisode || isCloseEpisode"
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
          <div class="col q-ml-md" />
        </div>
        <span v-if="isCloseEpisode && hasVisits(episode)">
          <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
              <span class="text-subtitle2"
                >Dados de Fim do Histórico Clínico</span
              >
            </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm" />
          </div>
          <div class="row">
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
              :rules="[(val) => !!val || 'Por favor indicar a nota de fim']"
              v-model="closureEpisode.startStopReason"
              :options="stopReasons"
              option-value="id"
              option-label="reason"
              label="Notas de Fim do Histórico Clínico *"
            />
          </div>

          <div class="row" v-if="isReferenceEpisode || isTransferenceEpisode">
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
              label="Distrito"
            />
            <q-select
              class="col q-ml-md"
              dense
              outlined
              ref="referralClinicRef"
              :rules="[
                (val) => !!val || 'Por favor indicar o destino do paciente.',
              ]"
              v-model="closureEpisode.referralClinic"
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
              :options="clinicSectorTypes"
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
              option-label="description"
              label="Sector de Dispensa"
            />
          </div>
          <div class="row">
            <q-input
              v-model="closureEpisode.notes"
              label="Outras notas do episódio"
              :disable="episode.id !== null && isEditStep"
              ref="endNotesRef"
              :rules="[(val) => !!val || 'Por favor indicar a nota de fim']"
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
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService';
import districtService from 'src/services/api/districtService/districtService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import episodeTypeService from 'src/services/api/episodeType/episodeTypeService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';

//Declaration
const {
  getDDMMYYYFromJSDate,
  isValidDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
  extractHyphenDateFromDMYConvertYMD,
} = useDateUtils();
const { alertSucess, alertError } = useSwal();
const { fullName, age } = usePatient();
const { isReferenceOrTransferenceEpisode, hasVisits } = useEpisode();
const { remainigDurationInWeeks } = usePrescription();

const submitting = ref(false);
const closureEpisode = ref(new Episode());
const episode = ref(new Episode());
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
const episodeToEdit = inject('episodeToEdit');
const curIdentifier = inject('curIdentifier');
const curEpisode = inject('curEpisode');
const lastPack = inject('lastPack');
const patient = inject('patient');
const isEditStep = inject('isEditStep');
const isNewEpisode = inject('isNewEpisode');
const isCloseEpisode = inject('isCloseEpisode');
const closeEpisodeCreation = inject('closeEpisodeCreation');
const editEpisodeCreation = inject('editEpisodeCreation');

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
    return 'Sem Titulo';
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

const clinicSectorTypes = computed(() => {
  return clinicSectorTypeService.getAllClinicSectorTypes();
});

const referealClinicSectors = computed(() => {
  if (selectedClinicSectorType.value === null) return [];
  return clinicSectorService.getClinicSectorsByClinicIdSectorTypeId(
    currClinic.value.id,
    selectedClinicSectorType.value.id
  );
});

const districts = computed(() => {
  if (selectedProvince.value !== null && selectedProvince.value !== undefined) {
    if (isReferenceEpisode.value) {
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

const identifierstartDate = computed(() => {
  return getDDMMYYYFromJSDate(curIdentifier.value.startDate);
});

const clinicSerctors = computed(() => {
  return clinicSectorService.getActiveUSClinicSectorByClinic(
    curIdentifier.value.clinic_id
  );
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
  if (
    lastEpisode.value !== null &&
    isReferenceOrTransferenceEpisode(lastEpisode.value)
  ) {
    resonList = allReasons.filter((reason) => {
      return (
        reason.code !== 'REFERIDO_DC' &&
        reason.code !== 'TRANSFERIDO_PARA' &&
        reason.code !== 'REFERIDO_PARA'
      );
    });
    return resonList;
  } else {
    return allReasons;
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
    startDate.value = getDDMMYYYFromJSDate(moment());
  } else {
    if (curEpisode !== null && curEpisode !== undefined) {
      episode.value = curEpisode.value;
      startDate.value = getDDMMYYYFromJSDate(episode.value.episodeDate);
      // episode.value.patientServiceIdentifier.episodes = [];
      // if (
      //   lastEpisodeIdentifier(curIdentifier.value) !== null &&
      //   isStartEpisode(lastEpisodeIdentifier(curIdentifier.value)) &&
      //   (episode.value !== null || episode.value !== undefined)
      // ) {
      //   episode.value = new Episode(lastEpisodeIdentifier(curIdentifier.value));
      //   changeToCloseStep();
      // }
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
          ) <= getYYYYMMDDFromJSDate(lastEpisode.value.episodeDate)
        ) {
          alertError(
            'A data indicada não pode ser menor ou igual que a data do último histórico clínico.'
          );
          submitting.value = false;
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
    } else if (!isNewEpisode.value && !isCloseEpisode.value) {
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
    } else if (!isNewEpisode.value && isCloseEpisode.value) {
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
        } else if (isReferenceEpisode.value || isTransferenceEpisode.value) {
          referralClinicRef.value.validate();
          if (referralClinicRef.value.hasError) {
            alertError('Por favor indicar o destino do paciente.');
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
    episode.value.episodeDate = extractHyphenDateFromDMYConvertYMD(
      startDate.value
    );
    episode.value.creationDate = moment().format('YYYY-MM-DD');
  } else {
    episode.value.clinicSector_id = episode.value.clinicSector.id;
    episode.value.clinic = {};
    episode.value.clinic.id = currClinic.value.id;
    episode.value.episodeDate = extractHyphenDateFromDMYConvertYMD(
      startDate.value
    );

    if (isCloseEpisode.value) {
      episode.value.isLast = false;
      closureEpisode.value.clinicSector = episode.value.clinicSector;
      closureEpisode.value.isLast = true;
      closureEpisode.value.episodeType =
        episodeTypeService.getEpisodeTypeByCode('FIM');
      closureEpisode.value.clinic = {};
      closureEpisode.value.clinic.id = currClinic.value.id;
      closureEpisode.value.episodeDate = extractHyphenDateFromDMYConvertYMD(
        stopDate.value
      );
      closureEpisode.value.creationDate = moment();
      closureEpisode.value.patientServiceIdentifier = {}
      closureEpisode.value.patientServiceIdentifier.id = curIdentifier.value.id;
    }
  }
  episodeService
    .apiSave(episode.value, isNewEpisode.value)
    .then(() => {
      if (isCloseEpisode.value) {
        episodeService
          .apiSave(closureEpisode.value, true)
          .then(() => {
            console.log('Histórico Clínico de fecho criado com sucesso');
          })
          .catch((error) => {
            console.log(error);
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
