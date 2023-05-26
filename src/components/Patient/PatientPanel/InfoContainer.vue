<template>
  <div v-for="identifier in patient.identifiers" :key="identifier.id">
    <ListHeader
      :addVisible="false"
      @expandLess="expandLess"
      :bgColor="clinicalServiceHeaderColor"
      >{{
        identifier.service === null || identifier.service === undefined
          ? 'Sem Info'
          : identifier.service.code
      }}
    </ListHeader>
    <q-card v-show="serviceInfoVisible" class="noRadius q-mt-xs">
      <q-card-section class="row q-pa-none">
        <div class="col-5 bg-white q-pa-md">
          <div class="row">
            <div class="col-4 text-grey-9 text-weight-medium">
              Serviço de Saúde:
            </div>
            <div class="col text-grey-8">
              {{
                identifier.service === null || identifier.service === undefined
                  ? 'Sem Info'
                  : identifier.service.description
              }}
            </div>
          </div>
          <div class="row">
            <div class="col-4 text-grey-9 text-weight-medium">
              Data de Admissão:
            </div>
            <div class="col text-grey-8">
              {{ formatDate(identifier.startDate) }}
            </div>
          </div>
          <div class="row" v-if="identifier.value !== null">
            <div class="col-4 text-grey-9 text-weight-medium">
              Nr Identificador:
            </div>
            <div class="col text-grey-8">{{ identifier.value }}</div>
          </div>
          <div v-show="showEndDetails" class="row">
            <div class="col-4 text-grey-9 text-weight-medium">Data Fim:</div>
            <div class="col text-grey-8">
              {{ formatDate(identifier.endDate) }}
            </div>
          </div>
          <div v-show="showEndDetails" class="row">
            <div class="col-4 text-grey-9 text-weight-medium">
              Notas de Fim:
            </div>
            <div class="col text-grey-8">
              {{
                lastEpisode !== null && isCloseEpisode(identifier)
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
              @click="editClinicService()"
              class="float-right"
            />
            <q-btn
              v-if="!showEndDetails"
              unelevated
              color="red"
              label="Fechar"
              @click="$emit('closeClinicService', identifier)"
              class="float-right q-ml-sm"
            />
            <q-btn
              v-if="showEndDetails"
              unelevated
              color="blue"
              label="Reabrir"
              @click="$emit('reopenClinicService', identifier)"
              class="float-right q-ml-sm"
            />
          </div>
        </div>
        <div class="col q-py-md">
          <ListHeader
            :addVisible="!showEndDetails"
            bgColor="bg-primary"
            @showAdd="openEpisodeCreation"
            >Episódios</ListHeader
          >
          <EmptyList v-if="identifier.episodes.length <= 0"
            >Nenhum Episódio Iniciado</EmptyList
          >
          <span v-for="episode in identifier.episodes" :key="episode.id">
            <!-- <EpisodeInfo
              @editEpisode="editEpisode"
              @removeEpisode="removeEpisode"
              :episode="episode"
            /> -->
          </span>
        </div>
      </q-card-section>
    </q-card>
    <!-- <q-dialog persistent v-model="showAddEditEpisode">
      <AddEditEpisode
        :episodeToEdit="selectedEpisode"
        :curIdentifier="curIdentifier"
        :selectedPatient="selectedPatient"
        :stepp="step"
        @close="showAddEditEpisode = false"
      />
    </q-dialog>
    <q-dialog v-model="alert.visible">
      <Dialog
        :type="alert.type"
        @cancelOperation="cancelOperation"
        @closeDialog="closeDialog"
        @commitOperation="doOnConfirm"
      >
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{ alert.msg }} </template>
      </Dialog>
    </q-dialog> -->
  </div>
</template>

<script setup>
// import AuditSyncronization from 'src/store/models/auditSyncronization/AuditSyncronization';
import ListHeader from 'components/Shared/ListHeader.vue';
import EmptyList from 'components/Shared/ListEmpty.vue';
// import Dialog from 'components/Shared/Dialog/Dialog.vue';
// import AddEditEpisode from 'components/Patient/PatientPanel/AddEditEpisode.vue';
import { computed, inject, onMounted, ref } from 'vue';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import episodeService from 'src/services/api/episode/episodeService';
import { useEspisode } from 'src/composables/episode/episodeMethods';
import { usePatientServiceIdentifier } from 'src/composables/patient/patientServiceIdentifierMethods';
import Episode from 'src/stores/models/episode/Episode';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import EpisodeInfo from './Episode.vue';

// Declaration
const { hasVisits, isCloseEpisode, isDCReferenceEpisode } = useEspisode();
const { canBeEdited } = usePatientServiceIdentifier();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { preferedIdentifierValue, fullName } = usePatient();
const { website, isDeskTop, isMobile } = useSystemUtils();
const { formatDate } = useDateUtils();
const isPatientActive = ref(false);
const showAddEpisode = ref(false);
const selectedEpisode = ref(new Episode());
const showAddEditEpisode = ref(false);
const serviceInfoVisible = ref(true);

//Injection
const patient = inject('patient');
const curIdentifier = inject('curIdentifier');
const reopenClinicService = inject('reopenClinicService');
const closeClinicService = inject('closeClinicService');
const editClinicService = inject('editClinicService');

// Hook
onMounted(() => {
  console.log('Current NID', patient.value);
});

// Methods
const expandLess = (value) => {
  serviceInfoVisible.value = !value;
};
const openEpisodeCreation = () => {
  step = 'create';
  selectedEpisode.value = new Episode();
  showAddEditEpisode.value = true;
};
const checkPatientStatusOnService = () => {
  if (curIdentifier.value.endDate !== '') {
    isPatientActive.value = true;
  }
};
const editEpisode = (episodeParams) => {
  const eps = episodeService.getEpisodeById(episodeParams.id);
  if (hasVisits(eps)) {
    alertInfo(
      'error',
      'Não pode fazer alterações sobre este episódio pois o mesmo ja possui registos de visitas do paciente/utente associados.'
    );
  } else {
    step = 'edit';
    selectedEpisode.value = Object.assign({}, episodeParams);
    showAddEditEpisode.value = true;
  }
};
const removeEpisode = (episodeParams) => {
  const eps = episodeService.getEpisodeById(episodeParams.id);
  if (hasVisits(eps)) {
    alertInfo(
      'error',
      'Não pode remover este episódio pois o mesmo ja possui registos de visitas do paciente/utente associados.'
    );
  } else {
    selectedEpisode.value = eps;
    alertWarningAction(
      'confirmation',
      'Confirma a remoção deste episódio?'
    ).then((result) => {
      if (result) {
        doOnConfirm();
      }
    });
  }
};
const doOnConfirm = () => {
  closeDialog();
  if (website) {
    episodeService
      .delete(selectedEpisode.value.id)
      .then((result) => {
        alertSucess('Sucesso', 'Operação efectuada com sucesso.');
      })
      .catch((error) => {
        alertError('Erro ao remover o episodio');
      });
  }
  // else {
  //   Episode.localDbGetById(selectedEpisode.value.id).then((item) => {
  //     if (item.syncStatus !== 'R') {
  //       const auditSync = new AuditSyncronization();
  //       auditSync.operationType = 'remove';
  //       auditSync.className = Episode.getClassName();
  //       auditSync.entity = item;
  //       AuditSyncronization.localDbAdd(auditSync);
  //     }
  //     Episode.localDbDelete(selectedEpisode.value);
  //     Episode.delete(selectedEpisode.value.id);
  //     alertInfo('info', 'Operação efectuada com sucesso.');
  //   });
  // }
};
const cancelOperation = () => {
  alert.visible = false;
};
const canEditIdentifier = () => {
  // const identifier = PatientServiceIdentifier.query()
  //   .with('episodes.patientVisitDetails')
  //   .where('id', identifier.id)
  //   .first();
  return canBeEdited(curIdentifier);
};

// Computed
const clinicalServiceHeaderColor = computed(() => {
  if (!showEndDetails.value) {
    return 'bg-grey-6';
  } else {
    return 'bg-red-7';
  }
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
    !isDCReferenceEpisode(lastEpisode.value)
  );
});

const canEdit = computed(() => {
  return canEditIdentifier();
});
</script>

<style>
.noRadius {
  border-radius: 0px;
}
</style>
