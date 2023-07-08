<template>
  <div>
    <q-expansion-item
      dense
      :header-class="
        clinicalServiceHeaderColor
          ? 'bg-grey-6 text-white text-bold vertical-middle q-pl-md'
          : 'bg-red-7 text-white text-bold vertical-middle q-pl-md'
      "
      expand-icon-class="text-white"
      :default-opened="curIdentifier.service.code === 'TARV' || !website"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="medical_information" />
        </q-item-section>
        <q-item-section>
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code
          }}
        </q-item-section>
      </template>
      <q-card v-show="serviceInfoVisible" class="noRadius q-mt-xs">
        <q-card-section class="row q-pa-none">
          <div class="col-5 bg-white q-pa-md">
            <div class="row">
              <div class="col-4 text-grey-9 text-weight-medium">
                Serviço de Saúde:
              </div>
              <div class="col text-grey-8">
                {{
                  curIdentifier.service === null ||
                  curIdentifier.service === undefined
                    ? 'Sem Info'
                    : curIdentifier.service.description
                }}
              </div>
            </div>
            <div class="row">
              <div class="col-4 text-grey-9 text-weight-medium">
                Data de Admissão:
              </div>
              <div class="col text-grey-8">
                {{ formatDate(curIdentifier.startDate) }}
              </div>
            </div>
            <div class="row" v-if="curIdentifier.value !== null">
              <div class="col-4 text-grey-9 text-weight-medium">
                Nr Identificador:
              </div>
              <div class="col text-grey-8">{{ curIdentifier.value }}</div>
            </div>
            <div v-show="showEndDetails" class="row">
              <div class="col-4 text-grey-9 text-weight-medium">Data Fim:</div>
              <div class="col text-grey-8">
                {{ formatDate(curIdentifier.endDate) }}
              </div>
            </div>
            <div v-show="showEndDetails" class="row">
              <div class="col-4 text-grey-9 text-weight-medium">
                Notas de Fim:
              </div>
              <div class="col text-grey-8">
                {{
                  lastEpisode !== null && isCloseEpisode(curIdentifier)
                    ? lastEpisode.startStopReason.reason
                    : ''
                }}
              </div>
            </div>
            <div class="row">
              <div class="col-4 text-grey-9 text-weight-medium">Estado:</div>
              <div class="col text-grey-8">
                {{ !isPatientActive ? 'Activo no Serviço' : 'Inactivo' }}
              </div>
            </div>
            <q-separator />
            <div class="row q-my-md">
              <q-space />
              <q-btn
                v-if="!showEndDetails"
                unelevated
                color="orange-5"
                label="Editar"
                @click="editClinicService"
                class="float-right"
              />
              <q-btn
                v-if="!showEndDetails"
                unelevated
                color="red"
                label="Fechar"
                @click="closeClinicService"
                class="float-right q-ml-sm"
              />
              <q-btn
                v-if="showEndDetails"
                unelevated
                color="blue"
                label="Reabrir"
                @click="reopenClinicService"
                class="float-right q-ml-sm"
              />
            </div>
          </div>
          <div class="col q-py-md">
            <ListHeader
              :addVisible="islastEpisodeClosed"
              bgColor="bg-primary"
              :addButtonActions="openEpisodeCreation"
              >Histórico Clínico</ListHeader
            >
            <EmptyList v-if="curIdentifier.episodes.length <= 0"
              >Nenhum Histórico Clínico Iniciado</EmptyList
            >
            <span>
              <EpisodeInfo
                v-for="episode in get3LastEpisodes"
                :key="episode.id"
                :episodeId="episode.id"
                :isLast="episode.isLast"
              />
            </span>
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>
    <q-separator />
    <q-dialog persistent v-model="showEditClinicalService">
      <AddClinicService />
    </q-dialog>
    <q-dialog persistent v-model="showAddEditEpisode">
      <AddEditEpisode />
    </q-dialog>
  </div>
</template>

<script setup>
// import AuditSyncronization from 'src/store/models/auditSyncronization/AuditSyncronization';
import AddEditEpisode from 'components/Patient/PatientPanel/AddEditEpisode.vue';
import AddClinicService from 'components/Patient/PatientPanel/AddClinicService.vue';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
import { computed, inject, provide, ref } from 'vue';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import episodeService from 'src/services/api/episode/episodeService';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePatientServiceIdentifier } from 'src/composables/patient/patientServiceIdentifierMethods';
import Episode from 'src/stores/models/episode/Episode';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import EpisodeInfo from './Episode.vue';

//props
const props = defineProps(['identifierId', 'serviceId']);

// Declaration
const { hasVisits, isCloseEpisode, isDCReferenceEpisode } = useEpisode();
const { canBeEdited } = usePatientServiceIdentifier();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { preferedIdentifierValue, fullName } = usePatient();
const { website, isDeskTop, isMobile } = useSystemUtils();
const { formatDate } = useDateUtils();
const isPatientActive = ref(false);
const isNewEpisode = ref(false);
const isCloseEpisoded = ref(false);
const selectedEpisode = ref(new Episode());
const showAddEditEpisode = ref(false);
const serviceInfoVisible = ref(true);
const showEditClinicalService = ref(false);

//Injection
const patient = inject('patient');
const showAddEditClinicalService = inject('showAddEditClinicalService');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const isCloseStep = inject('isCloseStep');
const isReOpenStep = inject('isReOpenStep');

// Hook

// Computed
const curIdentifier = computed(() => {
  return patientServiceIdentifierService.identifierCurr(
    props.identifierId,
    props.serviceId
  );
});
// Methods
const openEpisodeCreation = () => {
  selectedEpisode.value = new Episode();
  showAddEditEpisode.value = true;
  isNewEpisode.value = true;
};
const closeEpisodeCreation = () => {
  showAddEditEpisode.value = false;
  isNewEpisode.value = false;
};
const editEpisodeCreation = () => {
  showAddEditEpisode.value = false;
  isNewEpisode.value = false;
};
const checkPatientStatusOnService = () => {
  if (curIdentifier.value.endDate !== '') {
    isPatientActive.value = true;
  }
};
// Methods
const editClinicService = () => {
  if (!canBeEdited(curIdentifier.value)) {
    alertError(
      'Não pode fazer alterações sobre este serviço de saúde pois o mesmo ja possui registos de visitas do paciente/utente associados.'
    );
  } else {
    isCreateStep.value = false;
    isEditStep.value = true;
    isCloseStep.value = false;
    isReOpenStep.value = false;
    showEditClinicalService.value = true;
  }
};

const closeClinicService = () => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCloseStep.value = true;
  isReOpenStep.value = false;
  showEditClinicalService.value = true;
};
const reopenClinicService = () => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCloseStep.value = false;
  isReOpenStep.value = true;
  showEditClinicalService.value = true;
};

const close = () => {
  isCreateStep.value = false;
  isEditStep.value = false;
  isCloseStep.value = false;
  isReOpenStep.value = false;
  showEditClinicalService.value = false;
};

const createFirstEpisode = (identifier) => {
  selectedIdentifier.value = identifier;
  showAddEditClinicalService.value = false;
  showAddEditEpisode.value = true;
};
const cancelOperation = () => {
  alert.visible = false;
};
const canEditIdentifier = () => {
  // const curIdentifier = PatientServiceIdentifier.query()
  //   .with('episodes.patientVisitDetails')
  //   .where('id', curIdentifier.id)
  //   .first();
  return canBeEdited(curIdentifier);
};

// Computed
const clinicalServiceHeaderColor = computed(() => {
  return !showEndDetails.value;
});

const lastEpisode = computed(() => {
  return curIdentifier.value != null
    ? episodeService.lastEpisodeByIdentifier(curIdentifier.value.id)
    : new Episode();
});

const showEndDetails = computed(() => {
  if (lastEpisode.value === null || lastEpisode.value === undefined)
    return false;
  return (
    lastEpisode.value !== null &&
    isCloseEpisode(lastEpisode.value) &&
    !isDCReferenceEpisode(lastEpisode.value) &&
    curIdentifier.value.endDate !== null
  );
});

const islastEpisodeClosed = computed(() => {
  if (lastEpisode.value !== null && lastEpisode.value !== undefined) {
    return (
      isCloseEpisode(lastEpisode.value) &&
      (curIdentifier.value.endDate === null ||
        curIdentifier.value.reopenDate !== null)
    );
  } else {
    return true;
  }
});

const get3LastEpisodes = computed(() => {
  return episodeService.getlast3EpisodesByIdentifier(curIdentifier.value.id);
});

const canEdit = computed(() => {
  return canEditIdentifier();
});

//Provide
provide('showAddEditEpisode', showAddEditEpisode);
provide('curIdentifier', curIdentifier);
provide('isNewEpisode', isNewEpisode);
provide('closeEpisodeCreation', closeEpisodeCreation);
provide('editEpisodeCreation', editEpisodeCreation);
provide('isCloseEpisode', isCloseEpisoded);
provide('close', close);
</script>

<style>
.noRadius {
  border-radius: 0px;
}
</style>
