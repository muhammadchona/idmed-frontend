<template>
  <div>
    <PanelTitleBar
      v-if="mobile"
      :name="group.name"
      :groupType="group.groupType.description"
      @showGroupDetails="showGroupDetails"
    >
    Detalhe do Grupo
    </PanelTitleBar>
    <TitleBar v-else >Detalhe do Grupo</TitleBar>
    <div class="q-pa-md" v-if="mobile">
      <div class="q-pa-md q-gutter-sm">
        <q-drawer
          v-model="showGroupInfo"
          :width="500"
          :breakpoint="500"
          overlay
          bordered
          behavior="mobile"
        >
          <q-scroll-area class="fit">
                <div class="row q-mt-md">
                  <div class="col q-pa-md q-pl-lg q-ml-lg q-mr-lg panel">
                    <groupInfo @editGroup="editGroup" @desintagrateGroup="desintagrateGroup"/>
                  </div>
                </div>
          </q-scroll-area>
        </q-drawer>
        <q-scroll-area style="height: 565px">
        <group-members
              v-if="dataFetchDone"
              @addMember="addMember"
              @newPrescription="newPrescription"
              @desintagrateGroup="desintagrateGroup"/>
            <groupPacks :packHeaders="group.packHeaders" @newPacking="newPacking" />
        </q-scroll-area>
      </div>
    </div>

   <span v-if="website">
      <div class="row q-mt-md">
        <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg panel">
          <groupInfo @editGroup="editGroup" @desintagrateGroup="desintagrateGroup"/>
        </div>
        <div class="col q-mr-lg">
          <q-scroll-area
            :thumb-style="thumbStyle"
            :content-style="contentStyle"
            :content-active-style="contentActiveStyle"
            style="height: 700px"
            class="q-pa-md"
          >
            <span>
              <group-members
                v-if="dataFetchDone"
                ref="groupMembers"
                @addMember="addMember"
                @getGroupMembers="getGroupMembers"
                @newPrescription="newPrescription"
                @desintagrateGroup="desintagrateGroup"/>
              <groupPacks :packHeaders="group.packHeaders" @newPacking="newPacking"   @getGroupMembers="getGroupMembers"/>
            </span>
          </q-scroll-area>
        </div>
      </div>
    </span>

      <q-dialog v-model="alert.visible" persistent>
        <Dialog :type="alert.type" @cancelOperation="cancelOperation" @closeDialog="closeDialog" @commitOperation="doOnConfirm">
          <template v-slot:title> {{dialogTitle}}</template>
          <template v-slot:msg> {{alert.msg}} </template>
        </Dialog>
      </q-dialog>
      <q-dialog persistent v-model="showRegisterRegister">
        <groupRegister
          :step="groupAddEditStep"
          @getGroupMembers="getGroupMembers"
          @close="showRegisterRegister = false , loadMembers2 = false" />
      </q-dialog>
      <q-dialog persistent v-model="showNewPackingForm" >
        <groupPack
          :group="group"
          @getGroupMembers="getGroupMembers"
          :defaultPickUpDate="defaultPickUpDate"
          @close="showNewPackingForm = false" />
      </q-dialog>
      <q-dialog persistent v-model="showAddPrescription" >
          <addEditPrescription
            :selectedVisitDetails="patientVisitDetails"
            :service="group.service"
            :member="selectedMember"
            @getGroupMembers="getGroupMembers"
            step="create"
            @close="showAddPrescription = false" />
      </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import { SessionStorage, useQuasar, QSpinnerBall } from 'quasar'
import Group from '../../store/models/group/Group'
import Patient from '../../store/models/patient/Patient'
import Episode from '../../store/models/episode/Episode'
import DispenseMode from '../../store/models/dispenseMode/DispenseMode'
import PatientVisitDetails from '../../store/models/patientVisitDetails/PatientVisitDetails'
import PatientVisit from '../../store/models/patientVisit/PatientVisit'
import Clinic from '../../store/models/clinic/Clinic'
import ClinicalService from '../../store/models/ClinicalService/ClinicalService'
import PrescriptionDetail from '../../store/models/prescriptionDetails/PrescriptionDetail'
import IdentifierType from '../../store/models/identifierType/IdentifierType'
import PatientServiceIdentifier from '../../store/models/patientServiceIdentifier/PatientServiceIdentifier'
import Prescription from '../../store/models/prescription/Prescription'
import Pack from '../../store/models/packaging/Pack'
import GroupMemberPrescription from '../../store/models/group/GroupMemberPrescription'
import mixinplatform from 'src/mixins/mixin-system-platform'
import GroupMember from 'src/store/models/groupMember/GroupMember'
import GroupPackHeader from '../../store/models/group/GroupPackHeader'
export default {
  mixins: [mixinplatform],
  data () {
    return {
      showGroupInfo: ref(false),
      alert: ref({
        type: '',
        visible: false,
        msg: ''
      }),
      contentStyle: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555'
      },

      contentActiveStyle: {
        backgroundColor: '#eee',
        color: 'black'
      },

      thumbStyle: {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#0ba58b',
        width: '5px',
        opacity: 0.75
      },
      fecthedEpisodes: 0,
      showRegisterRegister: false,
      groupAddEditStep: '',
      showNewPackingForm: false,
      showAddPrescription: false,
      patientVisitDetails: '',
      membersInfoLoaded: false,
      $q: useQuasar(),
      selectedMember: null,
      defaultPickUpDate: null
    }
  },
  watch: {
     membersInfoLoaded (oldp, newp) {
      if (oldp !== newp) {
        this.fecthMembersData()
        this.hideLoading()
      }
    }
  },
  methods: {
    showGroupDetails () {
      this.showGroupInfo = !this.showGroupInfo
    },
    showloading () {
      console.log('loaging')
       this.$q.loading.show({
          spinner: QSpinnerBall,
          spinnerColor: 'gray',
          spinnerSize: 140,
          message: 'Processando, aguarde por favor...',
          messageColor: 'white'
        })
    },
    hideLoading () {
      this.$q.loading.hide()
    },
    fecthMembersData () {
      this.group.members.forEach((member) => {
        member.patient = Patient.query().with(['identifiers.identifierType', 'identifiers.service.identifierType'])
                                .with('province')
                                .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                .where('id', member.patient.id).first()
        member.patient.identifiers = member.patient.identifiers.filter((identifier) => {
          return identifier.service.id === this.group.service.id
        })
      })
    },
    async loadMemberInfo () {
      this.showloading()
      if (this.mobile) {
        await this.group.members.forEach((member) => {
           GroupMemberPrescription.localDbGetAll().then(memberPrescriptions => {
            memberPrescriptions.forEach((mPre) => {
              if (mPre.member.id === member.id && !mPre.used) {
                GroupMemberPrescription.insert({ data: mPre })
              }
            })
          })
        })
        await GroupPackHeader.localDbGetAll().then(items => {
          items.forEach((item) => {
            if (item.group_id === this.group.id) {
              GroupPackHeader.insert({ data: item })
            }
          })
        })

        this.membersInfoLoaded = true
      } else {
        DispenseMode.apiGetAll()
        this.group.members.forEach((member) => {
          GroupMemberPrescription.apiFetchByMemberId(member.id).then(respd => {
            if (respd.response.status === 200) {
              Prescription.apiFetchById(respd.response.data.prescription.id)
            }
          })
          Patient.apiFetchById(member.patient.id).then(res0 => {
            member.patient = res0.response.data
            member.patient.identifiers.forEach((identifier) => {
              identifier = PatientServiceIdentifier.query().withAll().where('id', identifier.id).first()
              if (identifier.service.code === this.group.service.code) {
                Episode.apiGetAllByIdentifierId(identifier.id).then(resp => {
                  if (resp.response.data.length > 0) {
                    identifier.episodes = resp.response.data
                    identifier.episodes.forEach(episode => {
                      PatientVisitDetails.apiGetLastByEpisodeId(episode.id).then(resp => {
                        if (resp.response.data) {
                          episode.patientVisitDetails[0] = resp.response.data
                          PatientVisitDetails.apiGetAllofPrecription(episode.patientVisitDetails[0].prescription.id).then(resp1 => {
                          })
                          this.loadVisitDetailsInfo(episode.patientVisitDetails, 0)
                        }
                      })
                    })
                    this.group.packHeaders.forEach(packHeader => {
                      GroupPackHeader.apiFetchById(packHeader.id).then(resp => {
                        console.log(resp)
                      })
                    })
                  }
                })
              }
            })
          })
        })
      }
    },
    loadVisitDetailsInfo (visitDetails, i) {
        Prescription.apiFetchById(visitDetails[i].prescription.id).then(resp => {
          visitDetails[i].prescription = resp.response.data
            Pack.apiFetchById(visitDetails[i].pack.id).then(resp => {
              visitDetails[i].pack = resp.response.data
              this.membersInfoLoaded = true
            })
        })
    },
    desintagrateGroup () {
      this.group.members = this.group.members.filter((member) => { return member.isActive() })
          this.group.members.forEach((member) => {
            if (member.syncStatus !== 'R') member.syncStatus = 'U'
            member.endDate = new Date()
            member.patient = Patient.query()
                                    .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                    .with('province')
                                    .with('district.province')
                                    .where('id', member.patient.id)
                                    .first()
            member.group = null
            member.clinic = Clinic.query()
                                  .with('province')
                                  .with('district.province')
                                  .with('facilityType')
                                  .where('id', member.clinic_id)
                                  .first()
        })
       this.group.service.identifierType = IdentifierType.find(this.group.service.identifier_type_id)
       this.group.endDate = new Date()
       const group = Object.assign({}, this.group)
       group.packHeaders = []
       if (this.mobile) {
        if (this.group.syncStatus !== 'R') this.group.syncStatus = 'U'
        const groupUpdate = new Group(JSON.parse(JSON.stringify((this.group))))
        Group.localDbUpdate(groupUpdate).then(group => {
          group.members.forEach((member) => {
            const memberUpdate = new GroupMember(JSON.parse(JSON.stringify((member))))
            GroupMember.localDbUpdate(memberUpdate)
            GroupMember.update({ where: memberUpdate.id, data: memberUpdate })
          })
        })
        Group.update({ where: groupUpdate.id, data: groupUpdate })
        this.displayAlert('info', 'Operação efectuada com sucesso.')
       } else {
         Group.apiUpdate(group).then(resp => {
          Group.apiFetchById(group.id)
          this.displayAlert('info', 'Operação efectuada com sucesso.')
        })
       }
    },
    displayAlert (type, msg) {
      this.alert.type = type
      this.alert.msg = msg
      this.alert.visible = true
    },
    closeDialog () {
      this.alert.visible = false
    },
    newPrescription (member, identifier) {
      this.selectedMember = member
      const patient = member.patient
      patient.identifiers[0].episodes[0].lastVisit().prescription.prescriptionDetails[0] = PrescriptionDetail.query()
                                                                                                          .with('therapeuticLine')
                                                                                                          .with('therapeuticRegimen')
                                                                                                          .with('dispenseType')
                                                                                                          .where('prescription_id', patient.identifiers[0].episodes[0].lastVisit().prescription.id)
                                                                                                          .first()
      const pvd = new PatientVisitDetails({
                          patientVisit: new PatientVisit({
                                          visitDate: new Date(),
                                          patient: Patient.query()
                                                          .with('province')
                                                          .with('district.province')
                                                          .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                                                          .where('id', patient.id)
                                                          .first(),
                                          clinic: this.clinic
                                        }),
                          clinic: this.clinic,
                          createPackLater: true,
                          prescription: patient.identifiers[0].episodes[0].lastVisit().prescription,
                          episode: Episode.query()
                                          .with('startStopReason')
                                          .with('episodeType')
                                          .with('clinicSector')
                                          .with('patientServiceIdentifier.service')
                                          .where('id', identifier.episodes[0].id)
                                          .first()
                        })
      this.patientVisitDetails = pvd
      this.group.service = ClinicalService.query()
                                          .with('identifierType')
                                          .with('attributes.clinicalServiceAttributeType')
                                          .with('therapeuticRegimens')
                                          .where('id', this.group.service.id)
                                          .first()
      SessionStorage.set('selectedPatient', patient)
      SessionStorage.set('selectedMember', member)
      this.showAddPrescription = true
    },
    addMember () {
      this.groupAddEditStep = 'addMember'
      this.showRegisterRegister = true
    },
    editGroup () {
      this.groupAddEditStep = 'edit'
      this.showRegisterRegister = true
    },
    newPacking (lasHeader) {
      if (lasHeader !== null && lasHeader !== undefined) this.defaultPickUpDate = lasHeader.nextPickUpDate
      this.showNewPackingForm = true
    },
    getGroupMembers (isPrescription) {
      this.$refs.groupMembers.getGroupMembers(isPrescription)
    }
  },
  mounted () {
    this.loadMemberInfo()
  },
  computed: {
    group: {
      get () {
        return Group.query()
                    .with('service')
                    .with(['packHeaders.groupPacks.pack', 'packHeaders.duration'])
                    .with('members.patient.identifiers.identifierType')
                    .with('groupType')
                    .with(['clinic.province', 'clinic.district.province', 'clinic.facilityType'])
                    .where('id', SessionStorage.getItem('selectedGroup').id)
                    .first()
      }
    },
    clinic () {
      if (SessionStorage.getItem('currClinic') === null || SessionStorage.getItem('currClinic').id === null) {
          const clinic = Clinic.query()
                                .with('province.*')
                                .with('facilityType.*')
                                .with('district.*')
                                .with('sectors.*')
                                .where('mainClinic', true)
                                .first()
           SessionStorage.set('currClinic', clinic)
           return clinic
        } else {
          return new Clinic(SessionStorage.getItem('currClinic'))
        }
    },
    dataFetchDone () {
      return this.membersInfoLoaded
    }
  },
  components: {
    TitleBar: require('components/Shared/TitleBar.vue').default,
    groupInfo: require('components/Groups/Panel/GroupInfo.vue').default,
    groupRegister: require('components/Groups/AddEditGroup.vue').default,
    groupPack: require('components/Groups/GroupDispense.vue').default,
    groupMembers: require('components/Groups/Panel/GroupMembers.vue').default,
    groupPacks: require('components/Groups/Panel/GroupDispenses.vue').default,
    addEditPrescription: require('components/Patient/PatientPanel/AddEditPrescription.vue').default,
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
    PanelTitleBar: require('components/Groups/Panel/PanelTitleBar.vue').default
  }
}
</script>

<style lang="scss">
  .panel {
    border: 1px solid $grey-13;
    border-radius: 10px
  }
</style>
