<template>
  <div>
    <ListHeader :addVisible="false" bgColor="bg-grey-6"
      >Data de {{ currEpisode.isStartEpisode() ? 'Início:' : 'Fim:' }}
      {{ formatDate(currEpisode.episodeDate) }}
    </ListHeader>
    <q-card flat bordered class="noRadius">
      <q-card-section class="row q-pa-sm">
        <div class="col-9">
          <div class="row">
            <div
              v-if="
                !currEpisode.isReferenceEpisode() &&
                !currEpisode.isTranferenceEpisode()
              "
              class="col text-grey-9 text-weight-medium"
            >
              Sector Clínico:
            </div>
            <div
              v-if="
                !currEpisode.isReferenceEpisode() &&
                !currEpisode.isTranferenceEpisode()
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
                currEpisode.isReferenceEpisode() ||
                currEpisode.isTranferenceEpisode()
              "
              class="col text-grey-9 text-weight-medium"
            >
              Farmácia Referência:
            </div>
            <div
              v-if="
                currEpisode.isReferenceEpisode() ||
                currEpisode.isTranferenceEpisode()
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
                currEpisode.isStartEpisode()
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
              Notas de {{ currEpisode.isStartEpisode() ? 'Início: ' : 'Fim: ' }}
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
        <div class="col items-center">
          <q-btn
            v-if="canEdit"
            @click="$emit('removeEpisode', currEpisode)"
            dense
            unelevated
            color="red"
            label="Remover"
            class="float-right q-ml-md"
          />
          <q-btn
            v-if="canEdit"
            @click="$emit('editEpisode', currEpisode)"
            dense
            unelevated
            color="orange-5"
            label="Editar"
            class="float-right"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import episodeService from 'src/services/api/episode/episodeService';
import { computed, inject } from 'vue';

// Injection
const episode = inject('episode');

//Computed
const canEdit = computed(() => {
  return this.canBeEdited();
});
// Methods
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};
const canBeEdited = () => {
  if (
    this.currEpisode.isReferenceEpisode() ||
    this.currEpisode.isTranferenceEpisode() ||
    this.currEpisode.isBackReferenceEpisode()
  )
    return false;
  const eps = episodeService.getEpisodeById(episode.id);
  return this.episode.isLast && !eps.hasVisits();
};
</script>

<style></style>
