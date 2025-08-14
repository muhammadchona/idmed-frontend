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
        <span>Actualizar</span>
        Histórico Clínico
      </div>
      <div class="q-mx-lg">
        <span>
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
              :rules="[
                (val) => !!val || 'Por favor indicar do histórico clínico',
              ]"
              v-model="curEpisode.startStopReason"
              :options="stopReasons"
              option-value="id"
              option-label="reason"
              label="Notas de Fim do Histórico Clínico *"
            />
          </div>

          <div class="row">
            <q-input
              v-model="curEpisode.notes"
              label="Outras notas do Histórico Clínico"
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
        <q-btn
          label="Cancelar"
          color="red"
          @click="showEditClosedEpisode = false"
        />
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
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
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
const { closeLoading, showloading } = useLoading();
const { isOnline } = useSystemUtils();

const submitting = ref(false);
const startDate = ref('');
const stopDate = ref('');
//Ref's

const stopDateRef = ref(null);
const stopReasonRef = ref(null);
const endNotesRef = ref(null);

// Injection
const curIdentifier = inject('curIdentifier');
const curEpisode = inject('curEpisode');
const lastPack = inject('lastPack');
const patient = inject('patient');
const showEditClosedEpisode = inject('showEditClosedEpisode');

const currClinic = computed(() => {
  return clinicService.currClinic();
});

const lastEpisode = computed(() => {
  return episodeService.lastEpisodeByIdentifier(curIdentifier.value.id);
});

const identifierstartDate = computed(() => {
  return getDDMMYYYFromJSDate(curIdentifier.value.startDate);
});

const stopReasons = computed(() => {
  let allReasons = startStopReasonService.getAllStopReasons();
  const resonList = allReasons.filter((reason) => {
    return (
      reason.code !== 'TRANSFERIDO_PARA' &&
      reason.code !== 'FIM_PPE' &&
      reason.code !== 'TERMINO_DO_TRATAMENTO' &&
      reason.code !== 'OBITO' &&
      reason.code !== 'TSPC' &&
      reason.code !== 'REFERIDO_PARA' &&
      reason.code !== 'REFERIDO_SECTOR_CLINICO' &&
      reason.code !== 'REFERIDO_DC' &&
      reason.code !== 'VOLTOU_FARMACIA_US' &&
      reason.code !== 'VOLTOU_A_SER_REFERIDO_PARA'
    );
  });
  return resonList;
});

const optionsNonFutureDate = (dateOfBirth) => {
  return dateOfBirth <= moment().format('YYYY/MM/DD');
};

onMounted(() => {
  init();
});

const init = async () => {
  if (curEpisode !== null && curEpisode !== undefined) {
    const startEpisode = episodeService.getLastStartEpisodeByIdentifier(
      curIdentifier.value.id
    );
    startDate.value = getDDMMYYYFromJSDate(startEpisode.episodeDate);
    stopDate.value = getDDMMYYYFromJSDate(curEpisode.value.episodeDate);
  }
};

const submitForm = () => {
  submitting.value = true;
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
      return;
    } else if (
      getYYYYMMDDFromJSDate(
        extractHyphenDateFromDMYConvertYMD(startDate.value)
      ) >
      getYYYYMMDDFromJSDate(extractHyphenDateFromDMYConvertYMD(stopDate.value))
    ) {
      alertError('A data de Fim indicada é menor que a data de início.');
      submitting.value = false;
      return;
    } else if (
      getYYYYMMDDFromJSDate(
        extractHyphenDateFromDMYConvertYMD(stopDate.value)
      ) < getYYYYMMDDFromJSDate(new Date(lastPack.value.pickupDate))
    ) {
      alertError(
        'A data de Fim indicada é menor que a data da ultima visita efectuada pelo paciente.'
      );
      submitting.value = false;
      return;
    }
    endNotesRef.value.validate();
    if (endNotesRef.value.hasError) {
      alertError('Por favor indicar notas do histórico clínico.');
      submitting.value = false;
      return;
    } else {
      doSave();
    }
  } else {
    submitting.value = false;
  }
};

const doSave = async () => {
  showloading();
  const clinicSectorId = curEpisode.value.clinicSector.id;
  curEpisode.value.clinicSector = {};
  curEpisode.value.clinicSector.id = clinicSectorId;
  curEpisode.value.clinicSector_id = clinicSectorId;
  curEpisode.value.clinic = {};
  curEpisode.value.clinic.id = currClinic.value.id;
  curEpisode.value.patientServiceIdentifier = {};
  curEpisode.value.patientServiceIdentifier.id = curIdentifier.value.id;
  curEpisode.value.patientServiceIdentifier_id = curIdentifier.value.id;
  curEpisode.value.isLast = true;

  curEpisode.value.episodeDate = getDateFromHyphenDDMMYYYYWithTime(
    stopDate.value
  );

  curEpisode.value.patientVisitDetails = [];
  episodeService
    .apiSave(curEpisode.value, false)
    .then(() => {
      closeLoading();
      alertSucess('Histórico Clínico actualizado com sucesso.');
      showEditClosedEpisode.value = false;
    })
    .catch((error) => {
      console.log(error);
      alertError('Aconteceu um erro ao gravar o episódio');
      submitting.value = false;
    });
};
</script>
