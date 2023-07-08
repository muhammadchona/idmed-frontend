<template>
  <div>
    <q-expansion-item
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="medical_information" />
        </q-item-section>
        <q-item-section>
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
                    ? currEpisode.clinicSector.description
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
                  currEpisode.referralClinic !== null
                    ? currEpisode.referralClinic.clinicName
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
              v-if="canEdit"
              @click="removeEpisode"
              dense
              unelevated
              color="red"
              label="Remover"
              class="float-right q-ml-md"
            />
            <q-btn
              v-if="!canEdit"
              @click="closeEpisode"
              dense
              unelevated
              color="red"
              label="Fechar"
              class="float-right q-ml-md"
            />
            <q-btn
              v-if="canEdit"
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
// import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import packService from 'src/services/api/pack/packService';

const {
  isReferenceEpisode,
  isTranferenceEpisode,
  isBackReferenceEpisode,
  hasVisits,
  isCloseEpisode,
  isStartEpisode,
} = useEpisode();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
//Props
const props = defineProps(['episodeId', 'isLast']);
//Inject
const showAddEditEpisode = inject('showAddEditEpisode');
const isNewEpisode = inject('isNewEpisode');
//Computed
const currEpisode = computed(() => {
  return episodeService.getEpisodeById(props.episodeId);
});
const lastPack = computed(() => {
  return packService.getLastPackFromEpisode(props.episodeId);
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
  isCloseEpisode.value = false;
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
  isCloseEpisode.value = true;
  showAddEditEpisode.value = true;
  isNewEpisode.value = false;
};

const removeEpisode = () => {
  isCloseEpisode.value = false;
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
  episodeService
    .delete(currEpisode.value.id)
    .then((result) => {
      alertSucess('Sucesso', 'Operação efectuada com sucesso.');
    })
    .catch((error) => {
      console.error(error);
      alertError('Erro ao remover o episodio');
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
provide('isCloseEpisode', isCloseEpisode);
provide('curEpisodeIdentifier', currIdentifier);
</script>

<style></style>
