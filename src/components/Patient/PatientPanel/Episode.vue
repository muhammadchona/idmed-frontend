<template>
  <div>
    <q-expansion-item
      dense
      :header-class="
        isStartEpisode(currEpisode)
          ? 'bg-grey-6 text-white text-bold vertical-middle q-pl-md'
          : 'bg-red text-white text-bold vertical-middle q-pl-md blink'
      "
      expand-icon-class="text-white"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="medical_information" />
        </q-item-section>

        <q-item-section v-if="!isStartEpisode(currEpisode)">
          <span>
            Data de
            {{ isStartEpisode(currEpisode) ? 'Início:' : 'Fim:' }}
            {{ formatDate(currEpisode.episodeDate) }}
            [{{
              currEpisode.startStopReason !== null
                ? currEpisode.startStopReason.reason
                : ''
            }}]
          </span>
        </q-item-section>
        <q-item-section v-else>
          Data de
          {{ isStartEpisode(currEpisode) ? 'Início:' : 'Fim:' }}
          {{ formatDate(currEpisode.episodeDate) }}
          [{{
            currEpisode.startStopReason !== null
              ? currEpisode.startStopReason.reason
              : ''
          }}]
        </q-item-section>
      </template>

      <q-card flat bordered class="noRadius">
        <q-card-section class="row q-pa-sm">
          <div class="col">
            <div class="row">
              <div
                v-if="
                  !isReferenceEpisode(currEpisode) &&
                  !isTranferenceEpisode(currEpisode)
                "
                class="col text-grey-9 text-weight-medium"
              >
                Sector Clínico:
              </div>
              <div
                v-if="
                  !isReferenceEpisode(currEpisode) &&
                  !isTranferenceEpisode(currEpisode)
                "
                class="col text-grey-8"
              >
                {{
                  currEpisode.clinicSector !== null
                    ? currEpisode.clinicSector.clinicName
                    : ''
                }}
              </div>
              <div
                v-if="
                  isReferenceEpisode(currEpisode) ||
                  isTranferenceEpisode(currEpisode)
                "
                class="col text-grey-9 text-weight-medium"
              >
                Farmácia Referência:
              </div>
              <div
                v-if="
                  isReferenceEpisode(currEpisode) ||
                  isTranferenceEpisode(currEpisode)
                "
                class="col text-grey-8"
              >
                {{
                  currEpisode.clinicSector !== null
                    ? currEpisode.clinicSector.clinicName
                    : ''
                }}
              </div>
              <div class="col text-grey-9 text-weight-medium">
                {{
                  isStartEpisode(currEpisode)
                    ? 'Data de Início:'
                    : 'Data de Fim:'
                }}
              </div>
              <div class="col text-grey-8">
                {{ formatDate(currEpisode.episodeDate) }}
              </div>
            </div>
            <div class="row">
              <div class="col-3 text-grey-9 text-weight-medium">
                Notas de
                {{ isStartEpisode(currEpisode) ? 'Início: ' : 'Fim: ' }}
              </div>
              <div class="col text-grey-8">
                {{
                  currEpisode.startStopReason !== null
                    ? currEpisode.startStopReason.reason
                    : ''
                }}
              </div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions>
          <div
            class="col items-center"
            v-if="props.isLast && isLastEpisode && !isCloseEpisode(currEpisode)"
          >
            <q-btn
              v-if="
                canEdit &&
                !isPharmacyDDDOrAPEOrDCP() &&
                !isProvincialInstalation()
              "
              @click="removeEpisode"
              dense
              unelevated
              color="red"
              label="Remover"
              class="float-right q-ml-md"
            />
            <q-btn
              v-if="
                !canEdit &&
                !isPharmacyDDDOrAPEOrDCP() &&
                !isProvincialInstalation()
              "
              @click="closeEpisode"
              dense
              unelevated
              color="red"
              label="Fechar"
              class="float-right q-ml-md"
            />
            <q-btn
              v-if="
                canEdit &&
                !isPharmacyDDDOrAPEOrDCP() &&
                !isProvincialInstalation()
              "
              @click="editEpisode"
              dense
              unelevated
              color="orange-5"
              label="Editar"
              class="float-right"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-expansion-item>
    <q-separator />
    <q-dialog persistent v-model="showAddEditEpisode">
      <AddEditEpisode />
    </q-dialog>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import episodeService from 'src/services/api/episode/episodeService';
import AddEditEpisode from 'components/Patient/PatientPanel/AddEditEpisode.vue';
import { computed, provide, inject, ref } from 'vue';
import packService from 'src/services/api/pack/packService';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import { useLoading } from 'src/composables/shared/loading/loading';

const {
  isReferenceEpisode,
  isTranferenceEpisode,
  isBackReferenceEpisode,
  hasVisits,
  isCloseEpisode,
  isStartEpisode,
  checkIsReferedToRemove,
} = useEpisode();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { closeLoading, showloading } = useLoading();
const { isPharmacyDDDOrAPEOrDCP, isProvincialInstalation } = useSystemConfig();
//Props
const props = defineProps(['episodeId', 'isLast']);
//Inject
const showAddEditEpisode = inject('showAddEditEpisode');
const isNewEpisode = inject('isNewEpisode');
const isClosingEpisode = inject('isClosingEpisode');
//Computed
const currEpisode = computed(() => {
  return episodeService.getEpisodeById(props.episodeId);
});
const lastPack = computed(() => {
  let lastPack = packService.getLastPackFromEpisode(props.episodeId);
  if (lastPack === null) {
    lastPack = packService.getLastPackFromPatientId(
      currEpisode.value.patientServiceIdentifier_id
    );
  }
  return lastPack;
});
const currIdentifier = computed(() => {
  return currEpisode.value.patientServiceIdentifier;
});
const canEdit = computed(() => {
  return canBeEdited();
});
// Methods
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};
const canBeEdited = () => {
  if (
    isReferenceEpisode(currEpisode.value) ||
    isTranferenceEpisode(currEpisode.value) ||
    isBackReferenceEpisode(currEpisode.value)
  )
    return false;
  return !hasVisits(currEpisode.value);
};
const editEpisode = () => {
  // isClosingEpisode.value = true;
  const eps = currEpisode.value;
  if (hasVisits(eps)) {
    alertError(
      'Não pode fazer alterações sobre este episódio pois o mesmo ja possui registos de visitas do paciente/utente associados.'
    );
  } else {
    showAddEditEpisode.value = true;
    isNewEpisode.value = false;
  }
};

const closeEpisode = () => {
  isClosingEpisode.value = true;
  showAddEditEpisode.value = true;
  isNewEpisode.value = false;
};

const removeEpisode = () => {
  isClosingEpisode.value = false;
  const eps = currEpisode.value;
  if (hasVisits(eps)) {
    alertInfo(
      'error',
      'Não pode remover este episódio pois o mesmo ja possui registos de visitas do paciente/utente associados.'
    );
  } else {
    alertWarningAction('Deseja remover o Histórico Clínico?').then((result) => {
      console.log(result);
      if (result) {
        doOnConfirm();
      } else {
        alertInfo('Operação cancelada');
      }
    });
  }
};

const doOnConfirm = () => {
  showloading();
  episodeService
    .delete(currEpisode.value.id)
    .then(() => {
      const episodes = episodeService.getlast3EpisodesByIdentifier(
        currIdentifier.value.id
      );
      if (episodes.length > 0 && checkIsReferedToRemove(episodes)) {
        episodeService.deletePinia(episodes[0].id);
      }
      closeLoading();
      alertSucess('Sucesso', 'Operação efectuada com sucesso.');
    })
    .catch((error) => {
      console.error(error);
      alertError('Erro ao remover o episodio');
      closeLoading();
    });
};

const isLastEpisode = computed(() => {
  if (currEpisode.value !== null) {
    return (
      episodeService.lastEpisodeByIdentifier(currIdentifier.value.id).id ===
      currEpisode.value.id
    );
  }
  return true;
});

provide('curEpisode', currEpisode);
provide('lastPack', lastPack);
// provide('isCloseEpisode', isCloseEpisode);
provide('curEpisodeIdentifier', currIdentifier);
</script>
<style scoped>
.blink {
  text-align: center;
  line-height: 50px;
}
span {
  font-weight: bold;
  color: rgb(255, 255, 255);
  animation: blink 1s linear infinite;
}
@keyframes blink {
  0% {
    opacity: 0.1;
  }
  0% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}
</style>
