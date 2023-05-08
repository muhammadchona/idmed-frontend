<template>
<div>
  <ListHeader
    :addVisible="showAddButton"
    :mainContainer="true"
    bgColor="bg-primary"
    @expandLess="expandLess"
    @showAdd="selectedVisitDetails='', step='', showAddPrescription = true">Prescrição
  </ListHeader>
  <div v-show="infoVisible">
    <EmptyList v-if="patientHasNoPrescriptio" >Nenhuma Prescrição Adicionada</EmptyList>
  <div v-if="flagGo" >
    <span
      v-for="identifier in patient.identifiers" :key="identifier.id" >
      <PrescriptionInfoContainer
        :identifier="identifier"
        @addNewPack="addNewPack"
        @editPack="editPack"/>
    </span>
  </div>

  <q-dialog persistent v-model="showAddPrescription" >
      <AddEditPrescription
        :patient="selectedPatient"
        :selectedVisitDetails="selectedVisitDetails"
        :stepp="step"
        @close="showAddPrescription = false" />
  </q-dialog>
  </div>
</div>
</template>

<script>
import Patient from '../../../store/models/patient/Patient'
import Episode from '../../../store/models/episode/Episode'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import Pack from '../../../store/models/packaging/Pack'
import Prescription from '../../../store/models/prescription/Prescription'
import mixinutils from 'src/mixins/mixin-utils'
import mixinplatform from 'src/mixins/mixin-system-platform'
import PatientVisit from '../../../store/models/patientVisit/PatientVisit'
export default {
  mixins: [mixinplatform, mixinutils],
  data () {
    return {
      showAddPrescription: false,
      infoVisible: true,
      selectedVisitDetails: '',
      step: '',
      flagGoReady: false
    }
  },
  methods: {
    async init () {
      console.log('On PrescriptionInfo initialization')
      if (this.mobile) {
            PatientVisit.localDbGetAll().then(visitList => {
              visitList.forEach((visit) => {
                if (visit.patient.id === this.patient.id) {
                  PatientVisit.insert({ data: visit })
                }
              })
            })
            this.flagGoReady = true
      }
      if (this.identifiers.length <= 0) {
            this.flagGoReady = true
      } else {
        this.identifiers.forEach(identifier => {
          if (this.mobile) {
            const episodeList = Episode.query()
                                        .with('startStopReason')
                                        .with('patientServiceIdentifier')
                                       .with('patientVisitDetails.*')
                                        .where('patientServiceIdentifier_id', identifier.id)
                                        .get()
           episodeList.forEach((episode) => {
               PatientVisitDetails.localDbGetAll().then(pvds => {
                 if (pvds.length > 0) {
                  pvds.forEach((p) => {
                    if (p.episode_id === episode.id) {
                      PatientVisitDetails.insert({ data: p })
                    }
                  Prescription.localDbGetById(p.prescription_id).then(prescription => {
                      Prescription.insert({ data: prescription })
                  })
                  Pack.localDbGetById(p.pack_id).then(pack => {
                      Pack.insert({ data: pack })
                  })
                  })
                }
              })
            })
          } else {
            Episode.apiGetAllByIdentifierId(identifier.id).then(resp => {
              if (resp.response.data.length > 0) {
                this.identifiers.episodes = resp.response.data
                this.identifiers.episodes.forEach(episode => {
                  PatientVisitDetails.apiGetLastByEpisodeId(episode.id).then(resp => {
                    if (resp.response.data) {
                      episode.patientVisitDetails[0] = resp.response.data
                      this.loadVisitDetailsInfo(episode.patientVisitDetails, 0)
                    } else this.flagGoReady = true
                  })
                })
              } else {
                this.flagGoReady = true
              }
            })
          }
        })
      }
    },
    loadVisitDetailsInfo (visitDetails, i) {
      if (visitDetails[i] !== undefined && visitDetails[i] !== null) {
        Prescription.apiFetchById(visitDetails[i].prescription.id).then(resp => {
          visitDetails[i].prescription = resp.response.data
          if (visitDetails[i].pack !== null) {
            Pack.apiFetchById(visitDetails[i].pack.id).then(resp => {
              visitDetails[i].pack = resp.response.data
              this.flagGoReady = true
            })
          } else {
            this.flagGoReady = true
          }
        })
      } else {
        this.flagGoReady = true
      }
    },
    checkPrescription () {
      const hasPresc = this.patient.identifiers.some((identifier) => {
        if (identifier.episodes.length > 0) {
          identifier.episodes.some((episode) => {
            return episode.patientVisitDetails.length > 0
          })
        } else {
          return false
        }
        return false
      })
      return hasPresc
    },
    expandLess (value) {
      this.infoVisible = !value
    },
    addNewPack (patientVisitDetails) {
      this.selectedVisitDetails = patientVisitDetails
      this.step = 'addNewPack'
      this.showAddPrescription = true
    },
    editPack (patientVisitDetails) {
      this.selectedVisitDetails = patientVisitDetails
      this.step = 'editPack'
      this.showAddPrescription = true
    }
  },
  created () {
    this.showloading()
    this.init()
  },
  mounted () {
  },
  watch: {
    flagGoReady: function (newVal, oldVal) {
      if (newVal) {
        this.hideLoading()
      }
    }
  },
  computed: {
    flagGo: {
      get () {
        return this.flagGoReady
      },
      set (value) {
        this.flagGoReady = value
      }
    },
    patientHasNoPrescriptio () {
      if (this.patient.identifiers.length <= 0) return true
      return !this.patientHasEpisodes && !this.flagGo
    },
    showAddButton () {
      return this.patientHasEpisodes && !this.patientHasClosedIdentifier
    },
    hasPrescription () {
      return this.checkPrescription()
    },
    identifiers () {
      return this.patient.identifiers
    },
    patientHasEpisodes () {
      return this.patient.hasEpisodes()
    },
    patientHasClosedIdentifier () {
      return this.patient.hasOneAndClosedIdentifier()
    },
    patient: {
      get () {
      return Patient.query().with('identifiers.*')
                            .with('province')
                            .with('attributes')
                            .with('appointments')
                            .with('district')
                            .with('postoAdministrativo')
                            .with('bairro')
                            .with('clinic')
                            .where('id', this.selectedPatient.id).first()
      }
    }
  },
  components: {
      AddEditPrescription: require('components/Patient/PatientPanel/AddEditPrescription.vue').default,
      ListHeader: require('components/Shared/ListHeader.vue').default,
      EmptyList: require('components/Shared/ListEmpty.vue').default,
      PrescriptionInfoContainer: require('components/Patient/Prescription/PrescriptionInfoContainer.vue').default
  }
}
</script>

<style>

</style>
