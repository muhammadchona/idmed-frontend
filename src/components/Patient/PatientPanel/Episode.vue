<template>
  <div>
    <ListHeader :addVisible="false" bgColor="bg-grey-6" >Data de {{currEpisode.isStartEpisode() ? 'Início:' : 'Fim:'}} {{formatDate(currEpisode.episodeDate)}} </ListHeader>
    <q-card flat bordered class="noRadius">
      <q-card-section class="row q-pa-sm">
        <div class="col-9">
          <div class="row ">
            <div v-if="!currEpisode.isReferenceEpisode() && !currEpisode.isTranferenceEpisode()" class="col text-grey-9 text-weight-medium">Sector Clínico:</div>
            <div v-if="!currEpisode.isReferenceEpisode() && !currEpisode.isTranferenceEpisode()" class="col text-grey-8">{{currEpisode.clinicSector !== null ? currEpisode.clinicSector.description : ''}}</div>
            <div v-if="currEpisode.isReferenceEpisode() || currEpisode.isTranferenceEpisode()" class="col text-grey-9 text-weight-medium">Farmácia Referência:</div>
            <div v-if="currEpisode.isReferenceEpisode() || currEpisode.isTranferenceEpisode()" class="col text-grey-8">{{currEpisode.referralClinic !== null ? currEpisode.referralClinic.clinicName : ''}}</div>
            <div class="col text-grey-9 text-weight-medium">{{currEpisode.isStartEpisode() ? 'Data de Início:' : 'Data de Fim:'}}</div>
            <div class="col text-grey-8">{{formatDate(currEpisode.episodeDate)}}</div>
          </div>
          <div class="row ">
            <div class="col-3 text-grey-9 text-weight-medium">Notas de {{currEpisode.isStartEpisode() ? 'Início: ' : 'Fim: '}}</div>
            <div class="col text-grey-8">{{currEpisode.startStopReason !== null ? currEpisode.startStopReason.reason : ''}}</div>
          </div>
        </div>
        <div class="col items-center">

          <q-btn
            v-if="canEdit"
            @click="$emit('removeEpisode', currEpisode)"
            dense unelevated
            color="red"
            label="Remover"
            class="float-right q-ml-md" />
          <q-btn
            v-if="canEdit"
            @click="$emit('editEpisode', currEpisode)"
            dense unelevated
            color="orange-5"
            label="Editar"
            class="float-right" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { date } from 'quasar'
import Episode from '../../../store/models/episode/Episode'
export default {
  props: ['episode'],
  setup () {
    return {
    }
  },
  computed: {
    currEpisode: {
      get () {
        return Episode.query()
                    .withAll()
                    .where('id', this.episode.id)
                    .first()
      }
    },
    canEdit () {
      return this.canBeEdited()
    }
  },
  methods: {
    formatDate (dateString) {
      return date.formatDate(dateString, 'DD-MM-YYYY')
    },
    canBeEdited () {
      if (this.currEpisode.isReferenceEpisode() || this.currEpisode.isTranferenceEpisode() || this.currEpisode.isBackReferenceEpisode()) return false
      const eps = Episode.query().withAll().where('id', this.episode.id).first()
      return this.episode.isLast && !eps.hasVisits()
    }
  },
  components: {
    ListHeader: require('components/Shared/ListHeader.vue').default
  },
  created () {
      this.currEpisode = Object.assign({}, this.episode)
  }
}
</script>

<style>

</style>
