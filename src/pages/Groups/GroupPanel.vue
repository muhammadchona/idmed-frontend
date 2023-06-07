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
    <TitleBar v-else>Detalhe do Grupo</TitleBar>
    <div
      class="q-pa-md"
      v-if="mobile"
    >
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
                <groupInfo
                  @editGroup="editGroup"
                  @desintagrateGroup="desintagrateGroup"
                />
              </div>
            </div>
          </q-scroll-area>
        </q-drawer>
        <q-scroll-area style="height: 565px">
          <groupMembers
            v-if="dataFetchDone"
            @addMember="addMember"
            @newPrescription="newPrescription"
            @desintagrateGroup="desintagrateGroup"
          />

        </q-scroll-area>
      </div>
    </div>

    <span v-if="website">
      <div class="row q-mt-md">
        <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg panel">
          <groupInfo
            @editGroup="editGroup"
            @desintagrateGroup="desintagrateGroup"
          />
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
              <groupMembers
                v-if="dataFetchDone"
                @addMember="addMember"
                @getGroupMembers="getGroupMembers"
                @newPrescription="newPrescription"
                @desintagrateGroup="desintagrateGroup"
              />
              <groupPacks
                :packHeaders="group.packHeaders"
                @newPacking="newPacking"
                @getGroupMembers="getGroupMembers"
              />
            </span>
          </q-scroll-area>
        </div>
      </div>
    </span>
    <q-dialog
      persistent
      v-model="showRegisterRegister"
    >
      <groupRegister
        :step="groupAddEditStep"
        @getGroupMembers="getGroupMembers"
        @close="showRegisterRegister = false "
      />
    </q-dialog>
    <q-dialog
      persistent
      v-model="showNewPackingForm"
    >
      <groupPack
        :group="group"
        @getGroupMembers="getGroupMembers"
        :defaultPickUpDate="defaultPickUpDate"
        @close="showNewPackingForm = false"
      />
    </q-dialog>
    <q-dialog
      persistent
      v-model="showAddPrescription"
    >
      <addEditPrescription
        :selectedVisitDetails="patientVisitDetails"
        :service="group.service"
        :member="selectedMember"
        @getGroupMembers="getGroupMembers"
        step="create"
        @close="showAddPrescription = false"
      />
    </q-dialog>
  </div>
</template>

<script setup >
import { computed, inject, onMounted, provide, reactive, ref, watch } from 'vue';
import { SessionStorage, useQuasar, QSpinnerBall } from 'quasar'
import Group from '../../stores/models/group/Group'
import Patient from '../../stores/models/patient/Patient'
import Episode from '../../stores/models/episode/Episode'
import DispenseMode from '../../stores/models/dispenseMode/DispenseMode'
import PatientVisitDetails from '../../stores/models/patientVisitDetails/PatientVisitDetails'
import PatientVisit from '../../stores/models/patientVisit/PatientVisit'
import Clinic from '../../stores/models/clinic/Clinic'
import ClinicalService from '../../stores/models/ClinicalService/ClinicalService'
import PrescriptionDetail from '../../stores/models/prescriptionDetails/PrescriptionDetail'
import IdentifierType from '../../stores/models/identifierType/IdentifierType'
import PatientServiceIdentifier from '../../stores/models/patientServiceIdentifier/PatientServiceIdentifier'
import Prescription from '../../stores/models/prescription/Prescription'
import Pack from '../../stores/models/packaging/Pack'
import GroupMemberPrescription from '../../stores/models/group/GroupMemberPrescription'
// import mixinplatform from 'src/mixins/mixin-system-platform'
import GroupPackHeader from '../../stores/models/group/GroupPackHeader';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import patientService from 'src/services/api/patientService/patientService';
import episodeService from 'src/services/api/episode/episodeService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import groupService from 'src/services/api/group/groupService';
import prescriptionService from 'src/services/api/prescription/prescriptionService'
import packService from 'src/services/api/pack/packService'
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService'
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService'
import groupPackHeaderService from 'src/services/api/groupPackHeader/groupPackHeaderService'
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService'
import TitleBar from 'components/Shared/TitleBar.vue';
import groupInfo from 'components/Groups/Panel/GroupInfo.vue';
 import groupRegister from 'components/Groups/AddEditGroup.vue';
import groupMembers from 'components/Groups/Panel/GroupMembers.vue';
 import groupPacks from 'components/Groups/Panel/GroupDispenses.vue';
// import addEditPrescription from 'components/Groups/Panel/AddEditPrescription.vue';
// import Dialog from 'components/Groups/Panel/Dialog.vue';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import PanelTitleBar from 'components/Groups/Panel/PanelTitleBar.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRouter } from 'vue-router';
import Dialog from 'components/Shared/Dialog/Dialog.vue';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';


const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();

const defaultPickUpDate = ref([]);
const selectedMember = ref([]);
const membersInfoLoaded = ref(false);
const patientVisitDetails = ref([]);
const showAddPrescription = ref(false);
const showNewPackingForm = ref(false);
const groupAddEditStep = ref(false);
const showRegisterRegister = ref(false);
const showGroupInfo = ref(false);

const contentStyle = {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555'
      }

const contentActiveStyle = {
        backgroundColor: '#eee',
        color: 'black'
      }

 const thumbStyle = {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#0ba58b',
        width: '5px',
        opacity: 0.75
      }

const fecthMembersData = () => {
      group.value.members.forEach((member) => {
        member.patient = patientService.getPatientByID(member.patient.id)
        member.patient.identifiers = member.patient.identifiers.filter((identifier) => {
          return identifier.service.id === group.value.service.id
        })
      })
}

const loadVisitDetailsInfo = (visitDetails, i) => {
  prescriptionService.apiFetchById(visitDetails[i].prescription.id).then(resp => {
          visitDetails[i].prescription = resp.data
          packService.apiFetchById(visitDetails[i].pack.id).then(resp => {
              visitDetails[i].pack = resp.data
             membersInfoLoaded.value = true
            })
        })
    }

const showGroupDetails =  () => {
   showGroupInfo.value = !showGroupInfo.value
}



const loadMemberInfo =  () => {
  showloading()
      if (isMobile.value) {
         group.value.members.forEach((member) => {
           GroupMemberPrescription.localDbGetAll().then(memberPrescriptions => {
            memberPrescriptions.forEach((mPre) => {
              if (mPre.member.id === member.id && !mPre.used) {
                GroupMemberPrescription.insert({ data: mPre })
              }
            })
          })
        })
         GroupPackHeader.localDbGetAll().then(items => {
          items.forEach((item) => {
            if (item.group_id === group.value.id) {
              GroupPackHeader.insert({ data: item })
            }
          })
        })
        membersInfoLoaded.value = true
      } else {
        dispenseModeService.apiGetAll()
        group.value.members.forEach((member) => {
          groupMemberPrescriptionService.apiFetchByMemberId(member.id).then(respd => {
            if (respd.status === 200) {
              prescriptionService.apiFetchById(respd.response.data.prescription.id)
            }
          })
          patientService.apiFetchById(member.patient_id).then(res0 => {
            member.patient = res0.data
            member.patient.identifiers.forEach((identifier) => { 
              console.log(patientServiceIdentifierService.curIdentifierById(identifier.id))
              identifier = patientServiceIdentifierService.curIdentifierById(identifier.id)
              if (identifier.service.code === group.value.service.code) {
                episodeService.apiGetAllByIdentifierId(identifier.id).then(resp => {
                  if (resp.data.length > 0) {
                    identifier.episodes = resp.data
                    identifier.episodes.forEach(episode => {
                      patientVisitDetailsService.apiGetLastByEpisodeId(episode.id).then(resp => {
                        if (resp.data) {
                          episode.patientVisitDetails[0] = resp.data
                          patientVisitDetailsService.apiGetAllofPrecription(episode.patientVisitDetails[0].prescription.id)
                          loadVisitDetailsInfo(episode.patientVisitDetails, 0)
                        }
                      })
                    })
                    group.value.packHeaders.forEach(packHeader => {
                      groupPackHeaderService.apiFetchById(packHeader.id).then(resp => {
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
}

onMounted(() => {
  loadMemberInfo()
  console.log('Parent Component: onMounted');
});

  const   newPrescription = (member, identifier) => {
      selectedMember.value = member
      const patient = member.patient
   //   patient.identifiers[0].episodes[0].lastVisit().prescription.prescriptionDetails[0] = prescriptionDetailsService.getPrescriptionDetailByPrescriptionID(patient.identifiers[0].episodes[0].lastVisit().prescription.id)
      const pvd = new PatientVisitDetails({
                          patientVisit: new PatientVisit({
                                          visitDate: new Date(),
                                          patient: patientService.getPatientByID(patient.id),
                                          clinic: clinic
                                        }),
                          clinic: clinic,
                          createPackLater: true,
                        //  prescription: patient.identifiers[0].episodes[0].lastVisit().prescription,
                          prescription: new Prescription(),
                          episode: episodeService.getEpisodeById(identifier.episodes[0].id)      
                        })
      patientVisitDetails.value = pvd
      group.value.service = clinicalServiceService.getClinicalServicePersonalizedById(group.value.service.id)
      SessionStorage.set('selectedPatient', patient)
      SessionStorage.set('selectedMember', member)
      showAddPrescription.value = true
    }

const addMember = () => {
   groupAddEditStep.value = 'addMember'
   showRegisterRegister.value = true
}

const editGroup = () => {
   groupAddEditStep.value = 'edit'
   showRegisterRegister.value = true
}

const newPacking = (lasHeader) => {
  if (lasHeader !== null && lasHeader !== undefined) defaultPickUpDate.value = lasHeader.nextPickUpDate
    showNewPackingForm.value = true
}

const getGroupMembers = (isPrescription) => {
 // this.$refs.groupMembers.getGroupMembers(isPrescription)
}




const dataFetchDone = computed(() => { 
  console.log(membersInfoLoaded.value)
  console.log(dataFetchDone.value)
  return membersInfoLoaded.value })


const group = computed(() => {
   return groupService.getGroupById(SessionStorage.getItem('selectedGroupId'))
})


const  desintagrateGroup = () => {
  console.log(group)
      group.value.members = group.members.filter((member) => { return useGroupMember().isActive(member) })
          group.value.members.forEach((member) => {
            if (member.syncStatus !== 'R') member.syncStatus = 'U'
            member.endDate = new Date()
            member.patient = patientService.getPatientByID(member.patient.id)
            member.group = null
            member.clinic = clinic.value
        })
     //  group.service.identifierType = IdentifierType.find(group.service.identifier_type_id)
       group.endDate = new Date()
       const group = Object.assign({}, group)
       group.packHeaders = []
       if (isMobile.value) {
        if (group.syncStatus !== 'R') group.syncStatus = 'U'
        const groupUpdate = new Group(JSON.parse(JSON.stringify((group))))
        Group.localDbUpdate(groupUpdate).then(group => {
          group.members.forEach((member) => {
            const memberUpdate = new GroupMember(JSON.parse(JSON.stringify((member))))
            GroupMember.localDbUpdate(memberUpdate)
            GroupMember.update({ where: memberUpdate.id, data: memberUpdate })
          })
        })
        Group.update({ where: groupUpdate.id, data: groupUpdate })
        displayAlert('info', 'Operação efectuada com sucesso.')
       } else {
         groupService.apiUpdate(group).then(resp => {
          groupService.apiFetchById(group.id)
          displayAlert('info', 'Operação efectuada com sucesso.')
        })
       }
    }
   
watch(
  () => membersInfoLoaded.value,
  (oldp, newp) => {
    if (oldp !== newp) {
      fecthMembersData()
      console.log(dataFetchDone.value)
      closeLoading();
    }
  }
);    

provide('step', groupAddEditStep);
provide('group', group);
</script>

<style lang="scss">
  .panel {
    border: 1px solid $grey-13;
    border-radius: 10px
  }
</style>
