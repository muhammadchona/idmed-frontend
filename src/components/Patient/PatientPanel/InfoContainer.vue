<template>
  <div>
    <ListHeader
      :addVisible="false"
      @expandLess="expandLess"
      :bgColor="clinicalServiceHeaderColor" >{{ (curIdentifier.service === null || curIdentifier.service === undefined) ? 'Sem Info' : curIdentifier.service.code }}
    </ListHeader>
    <q-card
      v-show="serviceInfoVisible"
      class="noRadius q-mt-xs">
      <q-card-section class="row q-pa-none">
        <div class="col-5 bg-white q-pa-md">
          <div class="row ">
            <div class="col-4 text-grey-9 text-weight-medium">Serviço de Saúde:</div>
            <div class="col text-grey-8">{{ (curIdentifier.service === null || curIdentifier.service === undefined) ? 'Sem Info' : curIdentifier.service.description  }}</div>
          </div>
          <div class="row ">
            <div class="col-4 text-grey-9 text-weight-medium">Data de Admissão:</div>
            <div class="col text-grey-8">{{ formatDate(curIdentifier.startDate) }}</div>
          </div>
          <div class="row " v-if="curIdentifier.value !== null">
            <div class="col-4 text-grey-9 text-weight-medium">Nr Identificador:</div>
            <div class="col text-grey-8">{{ curIdentifier.value }}</div>
          </div>
          <div v-show="showEndDetails" class="row ">
            <div class="col-4 text-grey-9 text-weight-medium">Data Fim:</div>
            <div class="col text-grey-8">{{ formatDate(curIdentifier.endDate) }}</div>
          </div>
          <div v-show="showEndDetails" class="row ">
            <div class="col-4 text-grey-9 text-weight-medium">Notas de Fim:</div>
            <div class="col text-grey-8">{{lastEpisode !== null && lastEpisode.isCloseEpisode() ? lastEpisode.startStopReason.reason : ''}}</div>
          </div>
          <div class="row ">
            <div class="col-4 text-grey-9 text-weight-medium">Estado:</div>
            <div class="col text-grey-8">{{ !isPatientActive ? 'Activo no Serviço' : 'Inactivo'}}</div>
          </div>
          <q-separator/>
          <div class="row q-my-md">
            <q-space/>
            <q-btn v-if="!showEndDetails" unelevated color="orange-5" label="Editar" @click="editClinicService()" class="float-right" />
            <q-btn v-if="!showEndDetails" unelevated color="red" label="Fechar" @click="$emit('closeClinicService', curIdentifier)" class="float-right q-ml-sm" />
            <q-btn v-if="showEndDetails" unelevated color="blue" label="Reabrir" @click="$emit('reopenClinicService', curIdentifier)" class="float-right q-ml-sm" />
          </div>
        </div>
        <div class="col q-py-md">
          <ListHeader :addVisible="!showEndDetails" bgColor="bg-primary" @showAdd="openEpisodeCreation">Episódios</ListHeader>
          <EmptyList v-if="curIdentifier.episodes.length <= 0" >Nenhum Episódio Iniciado</EmptyList>
          <span
            v-for="episode in episodes" :key="episode.id" >
            <Episode
              @editEpisode="editEpisode"
              @removeEpisode="removeEpisode"
              :episode="episode"/>
          </span>
        </div>
      </q-card-section>
    </q-card>
    <q-dialog persistent v-model="showAddEditEpisode">
        <AddEditEpisode
          :episodeToEdit="selectedEpisode"
          :curIdentifier="curIdentifier"
          :selectedPatient="selectedPatient"
          :stepp="step"
          @close="showAddEditEpisode = false" />
    </q-dialog>
    <q-dialog v-model="alert.visible">
      <Dialog :type="alert.type" @cancelOperation="cancelOperation" @closeDialog="closeDialog" @commitOperation="doOnConfirm">
        <template v-slot:title> Informação</template>
        <template v-slot:msg> {{alert.msg}} </template>
      </Dialog>
    </q-dialog>
  </div>
</template>

<script>
import Patient from '../../../store/models/patient/Patient'
import PatientServiceIdentifier from '../../../store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Episode from '../../../store/models/episode/Episode'
import EpisodeType from '../../../store/models/episodeType/EpisodeType'
import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
import mixinplatform from 'src/mixins/mixin-system-platform'
import mixinutils from 'src/mixins/mixin-utils'
import AuditSyncronization from 'src/store/models/auditSyncronization/AuditSyncronization'
export default {
  props: ['identifier', 'selectedPatient'],
   mixins: [mixinplatform, mixinutils],
  data () {
    return {
      isPatientActive: false,
      showAddEpisode: false,
      selectedEpisode: new Episode(),
      showAddEditEpisode: false,
      serviceInfoVisible: true
    }
  },
  components: {
    ListHeader: require('components/Shared/ListHeader.vue').default,
    EmptyList: require('components/Shared/ListEmpty.vue').default,
    Episode: require('components/Patient/PatientPanel/Episode.vue').default,
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    AddEditEpisode: require('components/Patient/PatientPanel/AddEditEpisode.vue').default
  },
  methods: {
    init () {
      if (this.website) {
        PatientServiceIdentifier.apiFetchById(this.curIdentifier.id)
        Episode.apiGetAllByIdentifierId(this.curIdentifier.id)
      }
    },
    expandLess (value) {
      this.serviceInfoVisible = !value
    },
    openEpisodeCreation () {
      this.step = 'create'
      this.selectedEpisode = new Episode()
      this.showAddEditEpisode = true
    },
    checkPatientStatusOnService () {
      if (this.curIdentifier.endDate !== '') {
        this.isPatientActive = true
      }
    },
    editClinicService () {
      if (!this.canEdit) {
        this.displayAlert('error', 'Não pode fazer alterações sobre este serviço de saúde pois o mesmo ja possui registos de visitas do paciente/utente associados.')
      } else {
        this.$emit('editClinicService', this.curIdentifier)
      }
    },
    editEpisode (episode) {
      const eps = Episode.query().withAll().where('id', episode.id).first()
      if (eps.hasVisits()) {
        this.displayAlert('error', 'Não pode fazer alterações sobre este episódio pois o mesmo ja possui registos de visitas do paciente/utente associados.')
      } else {
        this.step = 'edit'
        this.selectedEpisode = Object.assign({}, episode)
        this.showAddEditEpisode = true
      }
    },
    removeEpisode (episode) {
      const eps = Episode.query().withAll().where('id', episode.id).first()
      if (eps.hasVisits()) {
        this.displayAlert('error', 'Não pode remover este episódio pois o mesmo ja possui registos de visitas do paciente/utente associados.')
      } else {
        this.selectedEpisode = episode
        this.displayAlert('confirmation', 'Confirma a remoção deste episódio?')
      }
    },
    doOnConfirm () {
      this.closeDialog()
      if (this.website) {
        Episode.apiRemove(this.selectedEpisode).then(resp => {
          Episode.delete(this.selectedEpisode.id)
          this.displayAlert('info', 'Operação efectuada com sucesso.')
        }).catch(error => {
          const listErrors = []
          if (error.request.response !== null) {
            const arrayErrors = JSON.parse(error.request.response)
            if (arrayErrors.total === null) {
              listErrors.push(arrayErrors.message)
            } else {
              arrayErrors._embedded.errors.forEach(element => {
                listErrors.push(element.message)
              })
            }
          }
          this.displayAlert('error', listErrors)
        })
      } else {
        Episode.localDbGetById(this.selectedEpisode.id).then(item => {
          if (item.syncStatus !== 'R') {
                        const auditSync = new AuditSyncronization()
                          auditSync.operationType = 'remove'
                          auditSync.className = Episode.getClassName()
                          auditSync.entity = item
                          AuditSyncronization.localDbAdd(auditSync)
                    }
       Episode.localDbDelete(this.selectedEpisode)
        Episode.delete(this.selectedEpisode.id)
        this.displayAlert('info', 'Operação efectuada com sucesso.')
  })
      }
    },
    cancelOperation () {
      this.alert.visible = false
    },
    canEditIdentifier () {
      const identifier = PatientServiceIdentifier.query()
                                                .with('episodes.patientVisitDetails')
                                                .where('id', this.identifier.id)
                                                .first()
      return identifier.canBeEdited()
    }
  },
  mounted () {
    this.init()
  },
  computed: {
    identifiers: {
      get () {
        return this.selectedPatient.identifiers
      }
    },
      curIdentifier: {
        get () {
          return PatientServiceIdentifier.query()
                                      .with('identifierType')
                                      .with('service')
                                      .with('clinic.province')
                                      .with('episodes.*', (query) => {
                                              query.orderBy('episodeDate', 'desc')
                                            })
                                      .where('id', this.identifier.id).first()
        }
      },
    clinicalServiceHeaderColor () {
      if (!this.showEndDetails) {
        return 'bg-grey-6'
      } else {
        return 'bg-red-7'
      }
    },
    episodes: {
      get () {
          const episodes = Episode.query()
                                .with('startStopReason')
                                .with('episodeType')
                                .with('patientServiceIdentifier')
                                .with('clinicSector.*')
                                .where('patientServiceIdentifier_id', this.curIdentifier.id)
                                .orderBy('episodeDate', 'desc')
                                .limit(2)
                                .get()
        if (episodes.length > 0) {
          episodes[0].isLast = true
        }
        return episodes
      }
    },
    services: {
      get () {
        return ClinicalService.query().hasNot('code').get()
      }
    },
    patient: {
      get () {
      return Patient.query().with(['identifiers.identifierType', 'identifiers.service.identifierType', 'identifiers.clinic.province'])
                            .with('province')
                            .with('attributes')
                            .with('appointments')
                            .with('district')
                            .with('postoAdministrativo')
                            .with('bairro')
                            .with('clinic').where('id', this.selectedPatient.id).first()
      }
    },
    episodeTypes: {
      get () {
        return EpisodeType.all()
      }
    },
    lastEpisode: {
      get () {
        return Episode.query()
                    .with('startStopReason')
                    .with('episodeType')
                    .with('patientServiceIdentifier')
                    .with('clinicSector.*')
                    .where('patientServiceIdentifier_id', this.curIdentifier.id)
                    .orderBy('episodeDate', 'desc')
                    .first()
      }
    },
    showEndDetails () {
      if (this.lastEpisode === null || this.lastEpisode === undefined) return false
      return this.lastEpisode !== null && this.lastEpisode.isCloseEpisode() && !this.lastEpisode.isDCReferenceEpisode()
    },
    canEdit () {
      return this.canEditIdentifier()
    }
  },
  created () {
    if (this.website) {
      PatientServiceIdentifier.apiGetAllByPatientId(this.selectedPatient.id)
    }
  }
}
</script>

<style>
  .noRadius {
    border-radius: 0px
  }
</style>
