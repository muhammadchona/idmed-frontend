  <template>
  <div>
  <ListHeader
    :addVisible="false"
    @expandLess="expandLess"
    :bgColor="headerColor" >{{ (curIdentifier.service === null || curIdentifier.service === undefined) ? 'Sem Info' : curIdentifier.service.code}} </ListHeader>
    <div v-show="infoVisible">
      <q-card
      v-if="lastStartEpisode !== null && lastStartEpisode.lastVisit() !== null && prescriptionDetails !== null"
      class="noRadius">
      <q-card-section class="row q-pa-none">
        <div class="col-5 bg-white q-pa-md">
          <div class="row ">
            <div class="col text-grey-9 text-weight-medium">Data da Prescrição:</div>
            <div v-if="prescription.prescriptionDate !== null" class="col text-grey-8">{{ (prescription.prescriptionDate === null || prescription.prescriptionDate === undefined) ? 'Sem Info' : formatDate(prescription.prescriptionDate) }}</div>
            <div class="col text-grey-9 text-weight-medium">Regime Terapêutico:</div>
            <div class="col text-grey-8">{{ (prescriptionDetails.therapeuticRegimen === null || prescriptionDetails.therapeuticRegimen === undefined) ? 'Sem Info' : prescriptionDetails.therapeuticRegimen.description }}</div>
          </div>
          <div class="row ">
            <div v-if="prescriptionDetails.therapeuticLine !== null" class="col text-grey-9 text-weight-medium">Linha Terapêutica:</div>
            <div v-if="prescriptionDetails.therapeuticLine !== null" class="col text-grey-8">{{ (prescriptionDetails.therapeuticLine === null || prescriptionDetails.therapeuticLine === undefined) ? 'Sem Info' : prescriptionDetails.therapeuticLine.description }}</div>
            <div class="col text-grey-10">Clínico:</div>
            <div v-if="prescription.doctor !== null" class="col text-grey-8">{{ (prescription.doctor === null || prescription.doctor === undefined) ? 'Sem Info' : prescription.doctor.fullName }}</div>
          </div>
          <div class="row ">
            <div class="col text-grey-9 text-weight-medium">Tipo Dispensa:</div>
            <div v-if="prescriptionDetails.dispenseType !== null" class="col text-grey-8">{{ (prescriptionDetails.dispenseType === null || prescriptionDetails.dispenseType === undefined) ? 'Sem Info' : prescriptionDetails.dispenseType.description }}</div>
            <div class="col text-grey-9 text-weight-medium">Validade:</div>
            <div class="col" :class="validadeColor">{{ (prescriptionDetails === null || prescriptionDetails === undefined) ? 'Sem Info' : prescription.leftDuration }} mes(es)</div>
          </div>
          <div class="row ">
            <div class="col text-grey-9 text-weight-medium">Duração:</div>
            <div class="col text-grey-8">{{ (prescription === null || prescription === undefined || prescription.duration === null) ? 'Sem Info' : prescription.duration.description }}</div>
            <div class="col text-grey-9 text-weight-medium">Tipo Paciente:</div>
            <div class="col text-grey-8">{{ (prescription === null || prescription === undefined || prescription.patientStatus === null) ? 'Sem Info' : prescription.patientStatus }}</div>
          </div>
          <q-separator/>
          <div class="row q-my-md">
            <q-space/>
            <q-btn
              v-if="!isClosed"
              unelevated
              color="red"
              label="Remover"
              @click="removePrescription()"
              class="float-right q-ml-sm" />
          </div>
        </div>
        <div class="col q-py-md">
          <ListHeader :addVisible="!isClosed" bgColor="bg-primary" @showAdd="$emit('addNewPack', lastStartEpisode.lastVisit())">Dispensa</ListHeader>
          <EmptyList v-if="lastPackOnPrescription === null" >Nenhum registo de Levantamentos</EmptyList>
          <span v-if="lastPackOnPrescription !== null && lastPackOnPrescription.packagedDrugs.length > 0 && lastPackOnPrescription.packagedDrugs[0].drug !== null">
            <PackInfo
              @editPack="editPack"
              @removePack="removePack"
              :isClosed="isClosed"
              :pack="lastPackOnPrescription"/>
          </span>
        </div>
      </q-card-section>
    </q-card>
    <EmptyList v-else >Nenhuma Prescrição Adicionada para o serviço {{(identifier.service === null || identifier.service === undefined) ? 'Sem Info' : identifier.service.code}}</EmptyList>
    </div>
    <q-dialog persistent v-model="alert.visible">
        <Dialog :type="alert.type" @commitOperation="commitOperation" @closeDialog="closeDialog">
          <template v-slot:title> Informação</template>
          <template v-slot:msg> {{alert.msg}} </template>
        </Dialog>
      </q-dialog>
  </div>
</template>

<script>
import { date } from 'quasar'
import PatientServiceIdentifier from '../../../store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Episode from '../../../store/models/episode/Episode'
import Prescription from '../../../store/models/prescription/Prescription'
import PatientVisitDetails from '../../../store/models/patientVisitDetails/PatientVisitDetails'
import Pack from '../../../store/models/packaging/Pack'
// import TherapeuticRegimen from '../../../store/models/therapeuticRegimen/TherapeuticRegimen'
import TherapeuticLine from '../../../store/models/therapeuticLine/TherapeuticLine'
import Doctor from '../../../store/models/doctor/Doctor'
import Duration from '../../../store/models/Duration/Duration'
import DispenseType from '../../../store/models/dispenseType/DispenseType'
import PrescriptionDetail from '../../../store/models/prescriptionDetails/PrescriptionDetail'
// import Drug from '../../../store/models/drug/Drug'
import ClinicalService from '../../../store/models/ClinicalService/ClinicalService'
import mixinutils from 'src/mixins/mixin-utils'
import mixinplatform from 'src/mixins/mixin-system-platform'
import PatientVisit from 'src/store/models/patientVisit/PatientVisit'
import AuditSyncronization from 'src/store/models/auditSyncronization/AuditSyncronization'
import Stock from '../../../store/models/stock/Stock'
import StockEntrance from 'src/store/models/stockentrance/StockEntrance'
export default {
  props: ['identifier'],
  mixins: [mixinplatform, mixinutils],
  data () {
    return {
      infoVisible: true,
      isPatientActive: false,
      selectedPack: new Pack(),
      showAddEditEpisode: false
    }
  },
  components: {
    ListHeader: require('components/Shared/ListHeader.vue').default,
    EmptyList: require('components/Shared/ListEmpty.vue').default,
    PackInfo: require('components/Patient/Prescription/PackInfo.vue').default
  },
  methods: {
     init () {
       if (this.website) {
          if (this.identifier !== null) {
            PatientServiceIdentifier.apiFetchById(this.identifier.id)
            if (this.identifier.service !== null) {
              ClinicalService.apiFetchById(this.identifier.service.id)
            }
          }
          if (this.prescriptionDetails !== null) {
          PrescriptionDetail.apiFetchById(this.prescriptionDetails.id)
          }
       }
    },
    expandLess (value) {
      this.infoVisible = !value
    },
    checkPatientStatusOnService () {
      if (this.curIdentifier.endDate !== '') {
        this.isPatientActive = true
      }
    },
    editPack () {
      this.$emit('editPack', this.patientVisitDetais)
    },
    removePack () {
      this.displayAlert('confirmation', 'Deseja mesmo remover esta dispensa?')
    },
    callRemovePackAlert () {
      if (this.mobile) {
        //
         PatientVisit.localDbGetById(this.patientVisitDetais.patient_visit_id).then(item => {
          if (item.syncStatus !== 'R') {
                        const auditSync = new AuditSyncronization()
                          auditSync.operationType = 'remove'
                          auditSync.className = PatientVisit.getClassName()
                          auditSync.entity = item
                          AuditSyncronization.localDbAdd(auditSync)
                    }
                    item.patientVisitDetails.forEach(pvd => {
                      console.log(this.patientVisitDetais)
                      if (pvd.id === this.patientVisitDetais.id) {
                        console.log(this.patientVisitDetais)
                        pvd.pack.packagedDrugs.forEach(pd => {
              pd.packagedDrugStocks.forEach(pds => {
                  Stock.localDbGetById(pds.stock.id).then(stock => {
                    stock.stockMoviment += pds.quantitySupplied
                    stock.syncStatus = 'U'
                    Stock.localDbUpdate(stock)
                    StockEntrance.localDbGetById(stock.entrance.id).then(entrance => {
                     entrance.syncStatus = 'U'
                     StockEntrance.localDbUpdate(entrance)
                    })
                  })
              })
            })
            Prescription.delete(pvd.prescription.id)
                      Pack.delete(pvd.pack.id)
                      console.log(this.patientVisitDetais)
                      const index = item.patientVisitDetails.findIndex(o => o.id === pvd.id)
                      item.patientVisitDetails.splice(index, 1)
                      PatientVisit.localDbUpdate(item)
                      PatientVisit.update({ data: item })
                   }
                      if (item.patientVisitDetails.length === 0) {
                        PatientVisit.localDbDelete(item)
                    PatientVisit.delete(item)
                      }
          })
                  })
      } else {
        PatientVisitDetails.apiDelete(this.patientVisitDetais).then(resp => {
          PatientVisitDetails.delete(this.patientVisitDetais.id)
          this.displayAlert('info', 'Operação efectuada com sucesso.')
      })
      }
    },
    removePrescription () {
      if (this.lastPack !== null) {
        this.displayAlert('error', 'Esta prescrição ja possui registo de dispensas associados, remova primeiro as dispensas.')
      } else {
        // remotion code
      }
    },
    commitOperation () {
        this.callRemovePackAlert()
      },
    lastStartEpisodeWithPrescription () {
      let episode = null
      const episodes = Episode.query()
                              .with('startStopReason')
                              .with('clinicSector')
                              .with('patientServiceIdentifier')
                              .with('patientVisitDetails.*')
                              .whereHas('episodeType', (query) => {
                                    query.where('code', 'INICIO')
                                  })
                              .where('patientServiceIdentifier_id', this.identifier.id)
                              .orderBy('creationDate', 'desc')
                              .get()
      Object.keys(episodes).forEach(function (k) {
        const id = episodes[k]
        if (episode === null && id.hasVisits()) {
          episode = id
        }
      })
      return episode
    },
    reloadParams () {
      if (this.website) {
        // this.loadParamsToVueX()
        this.loadWebRegimensToVueX()
        this.loadWebDrugsToVueX()
        // TherapeuticRegimen.apiGetAll()
        TherapeuticLine.apiGetAll()
        Doctor.apiGetAll()
        Duration.apiGetAll()
        DispenseType.apiGetAll()
        // Drug.apiGetAll(0, 200)
      }
    },
    async reloadPrescriptionDetails (id) {
      await PrescriptionDetail.apiFetchById(id)
    },
    async reloadPrescription (id) {
      await Prescription.apiFetchById(id)
    },
    getRemainigDuration () {
      if (this.prescription === null) return null
      if (this.prescription.patientVisitDetails.length <= 0) {
        this.prescription.patientVisitDetails = PatientVisitDetails.query()
                                                                   .with('pack')
                                                                   .where('prescription_id', this.prescription.id)
                                                                   .get()
      }
      return this.prescription.remainigDuration()
    },
    loadAllPacksOfPrescription () {
      if (this.prescription === null) return null
      if (this.prescription.patientVisitDetails.length <= 0) {
        this.prescription.patientVisitDetails = PatientVisitDetails.query()
                                                                   .with('pack.packagedDrugs.drug')
                                                                   .where('prescription_id', this.prescription.id)
                                                                   .get()
      }
      return this.prescription.lastPackOnPrescription()
    },
    formatDate (dateString) {
      return date.formatDate(dateString, 'DD-MM-YYYY')
    }
  },
  computed: {
    episodes: {
      get () {
          const episodes = Episode.query()
                                .withAll()
                                .with('episodeType')
                                .with('clinicSector')
                                .where('patientServiceIdentifier_id', this.identifier.id)
                                .orderBy('creationDate', 'desc')
                                .limit(2)
                                .get()
        if (episodes.length > 0) {
          episodes[0].isLast = true
        }
        return episodes
      }
    },
    lastPackOnPrescription () {
      if (this.loadAllPacksOfPrescription() === null) return null
      return Pack.query()
                 .with('packagedDrugs.*')
                 .with('patientVisitDetails')
                 .where('id', this.loadAllPacksOfPrescription().id)
                 .orderBy('pickupDate', 'desc')
                 .first()
    },
    patient: {
      get () {
        return this.selectedPatient
      }
    },
    validadeColor () {
      if (this.prescription !== null && this.prescription.leftDuration > 0) {
        return 'text-primary'
      } else {
        return 'text-red'
      }
    },
    curIdentifier: {
        get () {
          return PatientServiceIdentifier.query()
                                      .with('identifierType')
                                      .with('service.*')
                                      .with('episodes.*', (query) => {
                                              query.orderBy('creationDate', 'desc')
                                            })
                                      .where('id', this.identifier.id).first()
        }
      },
    prescriptionDetails: {
      get () {
        if (this.prescription === null) return null
        return PrescriptionDetail.query().withAll().where('prescription_id', this.prescription.id).first()
      }
    },
    patientVisitDetais: {
      get () {
        if (this.prescription === null) return null
        return PatientVisitDetails.query().with('pack').with('prescription.*').where('id', this.prescription.patientVisitDetails[0].id).first()
      }
    },
    patientVisit: {
      get () {
        if (this.prescription === null) return null
        return PatientVisit.query().with('patientVisitDetails.*').where('id', this.lastStartEpisode.lastVisit().id).first()
      }
    },
    prescription () {
      if (this.lastStartEpisode === null || this.lastStartEpisode.lastVisit() === null || this.lastStartEpisode.lastVisit().prescription === null) return null
        const presc = Prescription.query()
                                  .with('clinic')
                                  .with('doctor')
                                  .with('patientVisitDetails.pack')
                                  .with('prescriptionDetails.*')
                                  .with('duration')
                                  .with('prescribedDrugs.*')
                                  .where('id', this.lastStartEpisode.lastVisit().prescription.id)
                                  .first()
        return presc
    },
    remainigDuration () {
      return this.getRemainigDuration()
    },
    lastStartEpisode () {
      return this.lastStartEpisodeWithPrescription()
    },
    lastPack: {
      get () {
         return Pack.query()
                 .with('packagedDrugs.*')
                 .with('patientVisitDetails')
                 .where('id', this.lastStartEpisode.lastVisit().pack.id)
                 .orderBy('pickupDate', 'desc')
                 .first()
      }
    },
    lastEpisode: {
      get () {
        return Episode.query()
                    .withAll()
                    .where('patientServiceIdentifier_id', this.identifier.id)
                    .orderBy('episodeDate', 'desc')
                    .first()
      }
    },
    showEndDetails () {
      return this.lastEpisode !== null && this.lastEpisode.isCloseEpisode() && !this.lastEpisode.isDCReferenceEpisode()
    },
    headerColor () {
      if (!this.showEndDetails) {
        return 'bg-grey-6'
      } else {
        return 'bg-red-7'
      }
    },
    isClosed () {
      return this.showEndDetails || this.prescription.leftDuration <= 0
    }
  },
  created () {
    this.init()
    this.patient = Object.assign({}, this.selectedPatient)
    this.reloadParams()
  },
  mounted () {
  }
}
</script>

<style>
  .noRadius {
    border-radius: 0px
  }
</style>
