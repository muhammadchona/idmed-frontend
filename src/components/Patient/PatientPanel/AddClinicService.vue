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
        <span v-if="isEditStep">Actualizar</span>
        <span v-if="isCreateStep">Adicionar</span>
        <span v-if="isCloseStep">Fechar</span>
        <span v-if="isReOpenStep">Reabrir</span>
        Serviço de Saúde
      </div>
      <div class="q-mx-lg">
        <div class="q-mt-lg">
          <div class="row items-center q-mb-sm">
            <span class="text-subtitle2">Dados do serviço de Saúde</span>
          </div>
          <q-separator color="grey-13" size="1px" class="q-mb-sm" />
        </div>
        <div class="row q-mt-md">
          <q-select
            class="col"
            dense
            outlined
            ref="clinicalServiceRef"
            :rules="[(val) => !!val || 'Por favor indicar o serviço de saúde']"
            :disable="isCloseStep || isReOpenStep"
            v-model="identifier.service"
            :options="notAssociatedServices"
            @update:model-value="reloadIdentifierTypeMask"
            option-value="id"
            option-label="code"
            label="Serviço de Saúde *"
          />

          <q-input
            dense
            outlined
            class="col q-ml-md"
            v-model="identifierstartDate"
            :disable="isCloseStep || isReOpenStep"
            ref="startDateRef"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Por favor indicar a data de admissão',
            ]"
            label="Data de Admissão *"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="identifierstartDate"
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
          <q-select
            class="col q-ml-md"
            dense
            outlined
            ref="stateRef"
            :rules="[(val) => !!val || 'Por favor indicar o estado']"
            :disable="isCloseStep || isReOpenStep"
            v-model="identifier.state"
            :options="isCreateStep ? estado : estados"
            label="Estado *"
          />
        </div>

        <span v-if="!isCloseStep && !isReOpenStep">
          <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
              <span class="text-subtitle2">Dados do Identificador</span>
            </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm" />
          </div>

          <div class="row q-mb-md">
            <div
              v-if="
                isCreateStep &&
                patient.identifiers.length > 0 &&
                identifier.service !== null &&
                identifier.service.code !== 'TARV'
              "
              class="col"
              tabindex="0"
            >
              Assumir Identificador Anterior?
              <q-radio
                keep-color
                color="primary"
                v-model="usePreferedId"
                v-bind:val="true"
                label="Sim"
              />
              <q-radio
                keep-color
                color="primary"
                v-model="usePreferedId"
                v-bind:val="false"
                label="Nao"
              />
            </div>
          </div>
          <div class="row" v-if="!usePreferedId">
            <q-input
              outlined
              dense
              ref="identifierRef"
              class="col"
              lazy-rules
              label="Nr. do Identificador *"
              :disable="identifier.service === null"
              :mask="identifierTypeMask"
              fill-mask="#"
              :rules="[(val) => !!val || 'Por favor indicar o identificador']"
              v-model="identifier.value"
            />
            <div v-if="identifier" class="col q-ml-md" tabindex="0">
              Preferido?
              <q-radio
                keep-color
                color="primary"
                v-model="identifier.prefered"
                v-bind:val="true"
                label="Sim"
              />
              <q-radio
                keep-color
                color="primary"
                v-model="identifier.prefered"
                v-bind:val="false"
                label="Nao"
              />
            </div>
          </div>
        </span>
        <span v-if="isCloseStep">
          <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
              <span class="text-subtitle2"
                >Dados de Fim do serviço de Saúde</span
              >
            </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm" />
          </div>
          <div class="row">
            <q-input
              dense
              outlined
              class="col"
              v-model="endDate"
              ref="endDateRef"
              label="Data de Fim *"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="endDate"
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
              label="Notas de Fim [Referência, Transferido para, ...] *"
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
            />
            <q-select
              class="col q-ml-md"
              dense
              outlined
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
              label="Outras notas de fim *"
              ref="closingNotesRef"
              :rules="[
                (val) => !!val || 'Por favor indicar outras notas do fim',
              ]"
              dense
              class="col"
            />
          </div>
        </span>

        <span v-if="isReOpenStep">
          <div class="q-mt-md">
            <div class="row items-center q-mb-sm">
              <span class="text-subtitle2"
                >Dados de Reabertura do serviço de Saúde</span
              >
            </div>
            <q-separator color="grey-13" size="1px" class="q-mb-sm" />
          </div>
          <div class="row">
            <q-input
              dense
              outlined
              class="col"
              v-model="reOpenDate"
              ref="reOpenDateRef"
              label="Data de Reabertura *"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="reOpenDate"
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
              ref="reOpenReasonRef"
              :rules="[
                (val) => !!val || 'Por favor indicar a nota de reabertura',
              ]"
              v-model="closureEpisode.startStopReason"
              :options="startReasons"
              option-value="id"
              option-label="reason"
              label="Notas de Reabertura *"
            />
            <q-input
              v-model="closureEpisode.notes"
              label="Outras notas *"
              ref="reOpenNotesRef"
              :rules="[
                (val) => !!val || 'Por favor indicar outras notas do fim',
              ]"
              dense
              class="col q-ml-md"
            />
          </div>
        </span>
      </div>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="close" />
        <q-btn
          type="submit"
          :loading="submitting"
          @click="submitting = true"
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
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import districtService from 'src/services/api/districtService/districtService';
import provinceService from 'src/services/api/provinceService/provinceService';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService';
import { usePatient } from 'src/composables/patient/patientMethods';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import Episode from 'src/stores/models/episode/Episode';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import startStopReasonService from 'src/services/api/startStopReasonService/startStopReasonService';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import episodeService from 'src/services/api/episode/episodeService';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import PatientTransReference from 'src/stores/models/transreference/PatientTransReference';
import PatientTransReferenceTypeService from 'src/services/api/patientTransReferenceServiceType/PatientTransReferenceTypeService';
import patientTransReferenceService from 'src/services/api/patientTransReferenceService/patientTransReferenceService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import { usePatientServiceIdentifier } from 'src/composables/patient/patientServiceIdentifierMethods';
import { useStringUtils } from 'src/composables/shared/stringUtils/stringUtils';
import episodeTypeService from 'src/services/api/episodeType/episodeTypeService';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService';
import { usePatientVisitDetail } from 'src/composables/patient/patientVisitDetailsMethods';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import { v4 as uuidv4 } from 'uuid';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
// Declaration
const { hasPreferedId } = usePatient();
const { hasVisits } = useEpisode();
const {
  isValidDate,
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getDateFromHyphenYYYYMMDD,
  getYYYYMMDDFromJSDate,
} = useDateUtils();
const { stringContains } = useStringUtils();
const { isReferenceOrTransferenceEpisode, lastVisit } = useEpisode();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { fullName, age } = usePatient();
const { lastPack } = usePatientVisitDetail();
const { lastVisitPrescription } = usePatientServiceIdentifier();
const { isMobile, isOnline } = useSystemUtils();
const submitting = ref(false);
const identifierstartDate = ref('');
const identifier = ref(new PatientServiceIdentifier({ id: uuidv4() }));
const closureEpisode = ref(new Episode({ id: uuidv4() }));
const estados = ref(['Activo', 'Inactivo']);
const estado = ref(['Activo']);
const endDate = ref('');
const reOpenDate = ref('');
const usePreferedId = ref(false);
const identifierTypeMask = ref('');
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedClinicSectorType = ref(null);
const selectedClinicSector = ref(null);

// Ref's
const clinicalServiceRef = ref(null);
const startDateRef = ref(null);
const stateRef = ref(null);
const identifierRef = ref(null);
const endDateRef = ref(null);
const stopReasonRef = ref(null);
const provinceRef = ref(null);
const districtRef = ref(null);
const referralClinicRef = ref(null);
const clinicSectorTypeRef = ref(null);
const referealClinicSectorRef = ref(null);
const closingNotesRef = ref(null);
const reOpenDateRef = ref(null);
const reOpenReasonRef = ref(null);
const reOpenNotesRef = ref(null);

// Injection
const patient = inject('patient');
const identifierToEdit = inject('curIdentifier');
const curIdentifier = inject('curIdentifier');
const isCreateStep = inject('isCreateStep');
const isEditStep = inject('isEditStep');
const isCloseStep = inject('isCloseStep');
const isReOpenStep = inject('isReOpenStep');
const close = inject('close');

//Hook
onMounted(() => {
  init();
  reloadIdentifierTypeMask();
});

// Method
const optionsNonFutureDate = (date) => {
  return date <= moment().format('YYYY/MM/DD');
};

const init = () => {
  if (isCreateStep.value) {
    curIdentifier.value = identifier.value;
  } else if (curIdentifier.value !== null) {
    identifier.value = curIdentifier.value;
    identifierstartDate.value = getDDMMYYYFromJSDate(
      curIdentifier.value.startDate
    );
  }
};

const reloadIdentifierTypeMask = () => {
  if (identifier.value.service !== null) {
    identifierTypeMask.value = identifier.value.service.identifierType.pattern;
  }
};

const isServiceAssociated = (service) => {
  const serviceIsAssociated = patient.value.identifiers.some(
    (serviceIdentifier) => {
      return serviceIdentifier.service.id === service.id;
    }
  );
  return serviceIsAssociated;
};

const filterNotAssociatedServices = () => {
  const filteredServices = clinicalServices.value.filter((serv) => {
    return !isServiceAssociated(serv);
  });
  return filteredServices;
};

const identifierHasValidPrescription = (episode) => {
  const lastVisitWithPrescription = lastVisitPrescription(identifier.value);
  if (lastVisitWithPrescription !== null) {
    const lastPrescription =
      prescriptionService.getLastPrescriptionFromPatientVisitDetails(
        lastVisitWithPrescription.prescription.id
      );
    if (lastPrescription.remainigDurationInWeeks() > 0) return true;
  }
  return false;
};

const submitForm = () => {
  submitting.value = true;
  identifier.value.patient = patient.value;
  if (isCloseStep.value) {
    stopReasonRef.value.validate();
    closingNotesRef.value.validate();
    if (!stopReasonRef.value.hasError && !closingNotesRef.value.hasError) {
      const localEpisode = episodeService.getLastStartEpisodeByIdentifier(
        identifier.value.id
      );
      if (!isValidDate(String(getDateFromHyphenDDMMYYYY(endDate.value)))) {
        alertError('A data de fim é inválida.');
        submitting.value = false;
      } else if (
        getDateFromHyphenDDMMYYYY(endDate.value) >
        getDateFromHyphenYYYYMMDD(moment().format('YYYY-MM-DD'))
      ) {
        alertError('A data de fim indicada é maior que a data da corrente.');
        submitting.value = false;
      } else if (
        localEpisode !== null &&
        getDateFromHyphenDDMMYYYY(endDate.value) <
          getDateFromHyphenYYYYMMDD(localEpisode.episodeDate)
      ) {
        alertError(
          'A data de fim indicada é menor que a data de inicio ao tratamento.'
        );
        submitting.value = false;
      } else if (
        getDateFromHyphenDDMMYYYY(endDate.value) <
        getDateFromHyphenDDMMYYYY(identifierstartDate.value)
      ) {
        alertError(
          'A data de fim indicada é menor que a data de inicio ao serviço.'
        );
        submitting.value = false;
      } else if (
        localEpisode !== null &&
        hasVisits(localEpisode) &&
        getDateFromHyphenDDMMYYYY(endDate.value) <
          getDateFromHyphenYYYYMMDD(lastVisit(localEpisode).pack.pickupDate)
      ) {
        alertError(
          'A data de fim indicada é menor que a data da ultima visita efectuada pelo paciente.'
        );
        submitting.value = false;
      } else if (
        isReferenceEpisode.value &&
        !identifierHasValidPrescription(localEpisode)
      ) {
        alertError(
          'O paciente deve ter registo de pelo menos uma prescrição e dispensa para poder ser referido.'
        );
        submitting.value = false;
      } else if (
        (isReferenceEpisode.value || isTransferenceEpisode.value) &&
        closureEpisode.value.referralClinic === null
      ) {
        alertError('Por favor indicar o destino do paciente.');
        submitting.value = false;
      } else {
        doSave();
      }
    } else {
      submitting.value = false;
    }
  } else if (isReOpenStep.value) {
    reOpenReasonRef.value.validate();
    reOpenNotesRef.value.validate();
    if (!reOpenReasonRef.value.hasError && !reOpenNotesRef.value.hasError) {
      const episode = episodeService.getLastStopEpisodeByIdentifier(
        identifier.value.id
      );
      if (!isValidDate(String(getDateFromHyphenDDMMYYYY(reOpenDate.value)))) {
        alertError('A data de abertura é inválida.');
        submitting.value = false;
      } else if (
        getDateFromHyphenDDMMYYYY(reOpenDate.value) >
        getDateFromHyphenYYYYMMDD(moment().format('YYYY-MM-DD'))
      ) {
        alertError(
          'A data de abertura indicada é maior que a data da corrente.'
        );
        submitting.value = false;
      } else if (
        getDateFromHyphenDDMMYYYY(reOpenDate.value) <
        getDateFromHyphenYYYYMMDD(episode.episodeDate)
      ) {
        alertError(
          'A data de abertura indicada é menor que a data do ultimo fecho efectuado.'
        );
        submitting.value = false;
      } else {
        doSave();
      }
    } else {
      submitting.value = false;
    }
  } else if (isCreateStep.value || isEditStep.value) {
    startDateRef.value.validate();
    clinicalServiceRef.value.validate();
    stateRef.value.validate();
    if (!usePreferedId.value) {
      identifierRef.value.validate();
    } else {
      identifier.value.prefered = false;
      identifier.value.value = '';
    }
    if (
      !clinicalServiceRef.value.hasError &&
      !startDateRef.value.hasError &&
      !stateRef.value.hasError
    ) {
      if (
        !isValidDate(
          String(getDateFromHyphenDDMMYYYY(identifierstartDate.value))
        )
      ) {
        alertError('A data de admissão é inválida.');
        submitting.value = false;
      } else if (
        (identifier.value === '' && !usePreferedId.value) ||
        stringContains(identifier.value.value, '#')
      ) {
        alertError('Por favor indicar um identificador dentro do padrão.');
        submitting.value = false;
      } else if (
        getDateFromHyphenDDMMYYYY(identifierstartDate.value) <
        getDateFromHyphenYYYYMMDD(patient.value.dateOfBirth)
      ) {
        alertError(
          'A data de admissão indicada é menor que a data de nascimento do paciente/utente.'
        );
        submitting.value = false;
      } else if (
        !usePreferedId.value &&
        (identifier.value === '' || stringContains(identifier.value, '#'))
      ) {
        alertError('Por favor indicar um identificador dentro do padrão.');
        submitting.value = false;
      } else {
        if (isEditStep.value) {
          const episode = episodeService.lastEpisodeByIdentifier(
            identifier.value.id
          );
          if (
            episode !== null &&
            getDateFromHyphenDDMMYYYY(identifierstartDate.value) >
              getDateFromHyphenYYYYMMDD(episode.episodeDate)
          ) {
            alertError(
              'A data de admissão indicada é maior que a data do primeiro episódio registado.'
            );
            submitting.value = false;
          } else if (
            hasVisitsMade.value &&
            identifier.value.service.id !== identifierToEdit.service.id
          ) {
            alertError(
              'Não pode alterar o serviço de saúde pois ja existem registos de visitas associados.'
            );
            submitting.value = false;
          } else if (
            patient.value.identifiers.length > 1 &&
            hasPreferedId(patient.value) &&
            identifier.value.prefered
          ) {
            alertWarningAction(
              'O identificador neste momento em associação passará a ser considerado como preferido, deseja continuar neste modo?'
            ).then((result) => {
              if (result) {
                doSave();
              } else {
                alertInfo('Operação cancelada');
              }
            });
            submitting.value = false;
          } else {
            doSave();
          }
        } else if (
          patient.value.identifiers.length > 1 &&
          hasPreferedId(patient.value) &&
          identifier.value.prefered
        ) {
          alertWarningAction(
            'O identificador neste momento em associação passará a ser considerado como preferido, deseja continuar neste modo?'
          ).then((result) => {
            if (result) {
              doSave();
            } else {
              alertInfo('Operação cancelada');
            }
          });
          submitting.value = false;
        } else {
          doSave();
        }
      }
    } else {
      submitting.value = false;
    }
  }
};

const lastStartEpisodeWithPrescription = () => {
  return episodeService.getLastStartEpisodeWithPrescription(
    identifier.value.id
  );
};

const doSave = async () => {
  identifier.value.episodes = [];
  if (isCloseStep.value) {
    closureEpisode.value.episodeType =
      episodeTypeService.getEpisodeTypeByCode('FIM');
    closureEpisode.value.episodeType_id = closureEpisode.value.episodeType.id;
    closureEpisode.value.episodeDate = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(endDate.value)
    );
    identifier.value.state = 'Inactivo';
    identifier.value.endDate = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(endDate.value)
    );
    // if (!isReferenceEpisode.value || !isDCReferenceEpisode.value)
    //   identifier.value.endDate = getYYYYMMDDFromJSDate(
    //     getDateFromHyphenDDMMYYYY(endDate.value)
    //   );
  }
  if (isReOpenStep.value) {
    closureEpisode.value.episodeType =
      episodeTypeService.getEpisodeTypeByCode('INICIO');
    closureEpisode.value.episodeType_id = closureEpisode.value.episodeType.id;
    closureEpisode.value.episodeDate = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(reOpenDate)
    );
    identifier.value.reopenDate = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(reOpenDate)
    );
    identifier.value.endDate = '';
    identifier.value.state = 'Activo';
  }
  if (isCloseStep.value || isReOpenStep.value) {
    closureEpisode.value.id = uuidv4();
    closureEpisode.value.creationDate = moment();
    closureEpisode.value.clinic = currClinic.value;
    closureEpisode.value.clinic_id = currClinic.value.id;
    if (selectedClinicSector.value !== null) {
      closureEpisode.value.clinicSector =
        clinicSectorService.getClinicSectorsById(selectedClinicSector.value.id);
    } else {
      if (lastEpisode.value !== null) {
        closureEpisode.value.clinicSector = lastEpisode.value.clinicSector;
        closureEpisode.value.clinicSector_id =
          lastEpisode.value.clinicSector.id;
      }
    }
    closureEpisode.value.clinicSector.clinic = {};
    closureEpisode.value.clinicSector.clinic.id = currClinic.value.id;

    identifier.value.episodes.push(closureEpisode.value);
  }
  if (isCreateStep.value) {
    identifier.value.id = uuidv4();
    identifier.value.clinic = {};
    identifier.value.clinic.id = currClinic.value.id;
    identifier.value.startDate = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(identifierstartDate.value)
    );
    identifier.value.identifierType = identifier.value.service.identifierType;
  }
  if (isEditStep.value) {
    identifier.value.startDate = getYYYYMMDDFromJSDate(
      getDateFromHyphenDDMMYYYY(identifierstartDate.value)
    );
  }
  let clinical_service_id = identifier.value.service.id;
  identifier.value.patient = {};
  identifier.value.patient.id = patient.value.id;
  identifier.value.service = {};
  identifier.value.service.id = clinical_service_id;
  if (usePreferedId.value) {
    identifier.value.value =
      patientServiceIdentifierService.getLatestIdentifierSlimByPatientId(
        patient.value.id
      ).value;
  }

  if (isMobile.value && !isOnline.value) {
    if (
      identifier.value.syncStatus === '' ||
      identifier.value.syncStatus === 'R'
    ) {
      identifier.value.syncStatus = 'R';
    } else if (identifier.value.syncStatus === 'S') {
      identifier.value.syncStatus = 'U';
    }
    identifier.value.patient_id = patient.value.id;
    identifier.value.service_id = identifier.value.service.id;
    identifier.value.identifier_type_id = identifier.value.identifierType.id;
  }
  await patientServiceIdentifierService
    .apiSave(identifier.value, isCreateStep.value)
    .then((resp) => {
      submitting.value = false;
      if (isTransferenceEpisode.value) {
        initPatientTransReference();
      }
      let msg = '';
      if (isCloseStep.value) {
        msg = 'Serviço de saúde fechado com sucesso.';
      } else if (isCreateStep.value) {
        msg = 'Serviço de saúde adicionado com sucesso.';
      } else if (isEditStep.value) {
        msg = 'Serviço de saúde actualizado com sucesso.';
      } else if (isReOpenStep.value) {
        msg = 'Serviço de saúde reaberto com sucesso.';
      }
      alertSucess(msg);
      close();
    })
    .catch((error) => {
      submitting.value = false;
      const listErrors = [];
      console.error(error);
      if (error.request.response != null) {
        const arrayErrors = JSON.parse(error.request.response);
        if (arrayErrors.total == null) {
          listErrors.push(arrayErrors.message);
        } else {
          arrayErrors._embedded.errors.forEach((element) => {
            listErrors.push(element.message);
          });
        }
      }
      console.error(listErrors);
      alertError('Aconteceu um erro inesperado, por favor contacte o HIS');
    });
};

const initPatientTransReference = () => {
  if (isTransferenceEpisode.value || isReferenceEpisode.value) {
    const transReference = new PatientTransReference({
      syncStatus: 'P',
      operationDate: closureEpisode.value.episodeDate,
      creationDate: moment(),
      operationType: PatientTransReferenceTypeService.getOperationType(
        isTransferenceEpisode.value ? 'TRANSFERENCIA' : 'REFERENCIA_FP'
      ),
      origin: currClinic.value,
      destination: closureEpisode.value.referralClinic.uuid,
      identifier: Object.assign({}, identifier.value),
      patient: Object.assign({}, patient.value),
    });
    transReference.identifier.episodes = [];
    transReference.patient.identifiers = [];
    setTimeout(doTransReference(transReference), 2);
  } else if (isDCReferenceEpisode.value) {
    const transReference = new PatientTransReference({
      syncStatus: 'P',
      operationDate: closureEpisode.value.episodeDate,
      creationDate: moment(),
      operationType:
        PatientTransReferenceTypeService.getOperationType('REFERENCIA_DC'),
      origin: currClinic.value,
      destination: selectedClinicSector.value.uuid,
      identifier: Object.assign({}, identifier.value),
      patient: Object.assign({}, patient.value),
    });
    transReference.identifier.episodes = [];
    transReference.patient.identifiers = [];
    setTimeout(doTransReference(transReference), 2);
  }
};

const doTransReference = (transReference) => {
  patientTransReferenceService.post(transReference);
};

// Compputed
const clinicSectorTypes = computed(() => {
  return clinicSectorTypeService.getAllClinicSectorTypes(); //ClinicSectorType.query().with('clinicSectorList.*').get();
});

const referealClinicSectors = computed(() => {
  if (selectedClinicSectorType.value === null) return [];
  return selectedClinicSectorType.value.clinicSectorList;
});

const currClinic = computed(() => {
  return clinicService.currClinic();
});

const provinces = computed(() => {
  if (isReferenceEpisode.value) {
    selectedProvince.value = patient.value.clinic.province;
    return provinceService.getAllProvincesById(
      patient.value.clinic.province_id
    );
  } else {
    return provinceService.getAllProvinces();
  }
});

const districts = computed(() => {
  if (selectedProvince.value !== null && selectedProvince.value !== undefined) {
    return districtService.getAllDistrictByProvinceId(
      selectedProvince.value.id
    );
  } else {
    return null;
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

const hasVisitsMade = computed(() => {
  return lastStartEpisodeWithPrescription() !== null;
});

const clinicalServices = computed(() => {
  return clinicalServiceService.getAllClinicalServices();
});

const notAssociatedServices = computed(() => {
  return filterNotAssociatedServices();
});

const stopReasons = computed(() => {
  const allReasons = startStopReasonService.getAllStopReasons();
  let resonList = [];
  resonList = allReasons.filter((reason) => {
    return (
      reason.code !== 'REFERIDO_DC' &&
      reason.code !== 'REFERIDO_PARA' &&
      reason.code !== 'ABANDONO' &&
      reason.code !== 'VOLTOU_A_SER_REFERIDO_PARA' &&
      reason.code !== 'REFERIDO_SECTOR_CLINICO'
    );
  });
  return resonList;
});

const startReasons = computed(() => {
  const allReasons = startStopReasonService.getAllStartReasons();
  let resonList = [];
  if (
    lastEpisode.value !== null &&
    isReferenceOrTransferenceEpisode(lastEpisode.value)
  ) {
    resonList = allReasons.filter((reason) => {
      return (
        reason.code === 'VOLTOU_REFERENCIA' ||
        reason.code === 'REINICIO_TRATAMETO' ||
        reason.code === 'TRANSFERIDO_DE'
      );
    });
    return resonList;
  } else {
    resonList = allReasons.filter((reason) => {
      return reason.code !== 'VOLTOU_REFERENCIA';
    });
    return resonList;
  }
});

const lastEpisode = computed(() => {
  return curIdentifier.value !== null && curIdentifier.value !== undefined
    ? episodeService.lastEpisodeByIdentifier(curIdentifier.value.id)
    : null;
});

const patientDestinationfieldLabel = computed(() => {
  if (isTransferenceEpisode.value) {
    return 'US de Transferência';
  } else if (isReferenceEpisode.value) {
    return 'Farmácia de Referência';
  } else {
    return 'Sem Titulo';
  }
});
</script>

<style></style>
