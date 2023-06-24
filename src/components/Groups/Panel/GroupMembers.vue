<template>
  <div>
    <ListHeader
      :addVisible="!useGroup().isDesintegrated(selectedGroup)"
      :mainContainer="true"
      :addButtonActions="() => addMember()"
      :expandVisible="true"
      @expandLess="expandLess"
      bgColor="bg-primary"
    >Membros do Grupo
    </ListHeader>
    <span>
      <div class="q-mb-md box-border">
        <q-table
          class="col"
          dense
          flat
          :rows="loadedMembers"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div class="full-width row flex-center text-primary q-gutter-sm text-body2">
              <span>
                Nenhum Paciente adicionado
              </span>
              <q-icon
                size="2em"
                :name="filter ? 'filter_b_and_w' : icon"
              />
            </div>
          </template>
          <template #body="props">
            <q-tr :props="props">
              <!--q-td key="order" :props="props">
              </q-td-->
              <q-td
                key="id"
                :props="props"
              >
                {{usePatient().preferedIdentifier(props.row.patient).value}}
              </q-td>
              <q-td
                key="name"
                :props="props"
              >
                {{usePatient().fullName(props.row.patient)}}
              </q-td>
              <q-td
                key="lasPrescriptionDate"
                :props="props"
              >
                {{getDDMMYYYFromJSDate(props.row.groupMemberPrescription !== null ? (props.row.groupMemberPrescription.prescription.prescriptionDate) : useEpisode().lastVisit(props.row.patient.identifiers[0].episodes[0]).prescription.prescriptionDate)}}
              </q-td>
              <q-td
                key="remainingTime"
                :props="props"
              >
                {{props.row.groupMemberPrescription !== null ? usePrescription().remainigDuration(props.row.groupMemberPrescription.prescription) : useEpisode().lastVisit(props.row.patient.identifiers[0].episodes[0]).prescription.leftDuration}} mes(es)
              </q-td>
              <q-td
                key="lastDispenseDate"
                :props="props"
              >
                {{
                  usePrescription().lastPackOnPrescription(useEpisode().lastVisit(props.row.patient.identifiers[0].episodes[0]).prescription) !== null ?
                  getDDMMYYYFromJSDate(usePrescription().lastPackOnPrescription(useEpisode().lastVisit(props.row.patient.identifiers[0].episodes[0]).prescription).pickupDate)
                  :
                  '-'
                  }}
              </q-td>
              <q-td
                key="nextPickupDate"
                :props="props"
              >
                {{
                  usePrescription().lastPackOnPrescription(useEpisode().lastVisit(props.row.patient.identifiers[0].episodes[0]).prescription) !== null ?
                  getDDMMYYYFromJSDate(usePrescription().lastPackOnPrescription(useEpisode().lastVisit(props.row.patient.identifiers[0].episodes[0]).prescription).nextPickUpDate)
                  :
                  '-'
                  }}
              </q-td>
              <q-td
                key="options"
                :props="props"
              >
                <div class="col">
                  <q-btn
                    flat
                    round
                    color="blue-8"
                    :disable="useGroup().isDesintegrated(selectedGroup)"
                    icon="post_add"
                    @click="newPrescription(props.row, props.row.patient.identifiers[0])"
                  >
                    <q-tooltip class="bg-blue-5">Nova Prescrição</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="red-8"
                    :disable="useGroup().isDesintegrated(selectedGroup)"
                    icon="group_remove"
                    @click="removeMember(props.row)"
                  >
                    <q-tooltip class="bg-red-5">Remover do Grupo</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </span>
    <q-dialog
      persistent
      v-model="showAddPrescription"
    >
      <addEditPrescription
        :selectedVisitDetails="patientVisitDetails"
        :member="selectedMember"
        @getGroupMembers="getGroupMembers"
        step="create"
        @close="showAddPrescription = false"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, provide, ref, watch,defineExpose } from 'vue';
import Group from '../../../stores/models/group/Group'
import { SessionStorage, useQuasar, QSpinnerBall } from 'quasar'
import Prescription from '../../../stores/models/prescription/Prescription'
import moment from 'moment'
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails'
import episodeService from 'src/services/api/episode/episodeService'
import prescriptionService from 'src/services/api/prescription/prescriptionService'
import packService from 'src/services/api/pack/packService'
import groupMemberService from 'src/services/api/groupMember/groupMemberService'
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRouter } from 'vue-router';
import groupService from 'src/services/api/group/groupService'
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService'
import patientService from 'src/services/api/patientService/patientService'
// import packService from 'src/services/api/pack/packService';
import {  useGroup } from 'src/composables/group/groupMethods';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods'
import {  usePatient } from 'src/composables/patient/patientMethods';
import ListHeader from 'components/Shared/ListHeader.vue'
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import addEditPrescription from 'components/Groups/AddMemberPrescription.vue';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';


const columns = [
  { name: 'id', align: 'left', label: 'Identificador', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'lasPrescriptionDate', align: 'left', label: 'Data da Última Prescrição', sortable: false },
  { name: 'remainingTime', align: 'left', label: 'Validade', sortable: false },
  { name: 'lastDispenseDate', align: 'left', label: 'Data da Última Dispensa', sortable: false },
  { name: 'nextPickupDate', align: 'left', label: 'Data do Próximo Levantamento', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false }
]

const { alertSucess, alertError, alertInfo,alertWarningAction } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isMobile } = useSystemUtils();



const router = useRouter();
const searchField = ref('');
const filter = ref('');
const selected = ref([]);
const username = localStorage.getItem('user');
const clinic = inject('clinic');
let curGroup = ref(new Group({ members: [] }));
const patient = ref(null);
const showAddPrescription = ref(false);
const patientVisitDetails = ref();
const membersInfoLoaded = ref(true);
const fecthedMemberData = ref(0);
const allMembers = inject('allMembers');
const members = inject('members');
const selectedMember = ref([]);
const step =  'display';
const showPrescriptionData = ref(true);
const dialogTitle = ref('');

const selectedGroup =  inject('group');
const desintagrateGroup =  inject('desintagrateGroup');
const getGroupMemberss =  inject('getGroupMemberss');
 const getGroupMembers = inject('getGroupMembers')
console.log(selectedGroup)
watch(
  () => membersInfoLoaded.value,
  (oldp, newp) => {
    if (oldp !== newp) {
      console.log(loadedMembers.value)
      console.log(dataFechComplete.value)
      closeLoading();
    }
  }
);


const emit = defineEmits([
  'addMember',
  'desintagrateGroup'
 // 'newPrescription'
]);



const addMember = () => {
  emit('addMember')
}



const expandLess = (value) => {
  showPrescriptionData.value = !value
}

const removeMember = (member) => {
     selectedMember.value = member
      dialogTitle.value = 'Confirmação da remoção do membro.'
      if (members.value.length === 1) {
        // step = 'desintagrate'
        alertWarningAction('Nota: Ao remover este membro o grupo será desintegrado. Continuar?').then((result) => {
        if (result) {
          desintagrateGroup()
        }
      })
      } else {
        // this.step = 'memberRemotion'
       alertWarningAction('Confirma a remoção do membro [' + usePatient().fullName(member.patient) + '], deste grupo?').then((result) => {
        if (result) {
          doMemberRemotion();
        }
      })
      }
}

const doMemberRemotion = () => {
      selectedMember.value.endDate = new Date()
      const member = Object.assign({}, selectedMember.value)
      member.group = {}
      member.group.id = member.group_id
        console.log(member)
   groupMemberService.apiUpdate(member).then(resp => {
        getGroupMembers()
        alertSucess('Operação efectuada com sucesso.')
      })
    }
   /*
const newPrescription = (patient, identifier) => {
     emit('newPrescription', patient, identifier)
    }
    */

const getDDMMYYYFromJSDate = (jsDate) => {
    return moment(jsDate).format('DD-MM-YYYY')
}

const getJSDateFromDDMMYYY = (dateString) => {
      const dateParts = dateString.split('-')
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    }
/*
const getGroupMembers = (isPrescription) => {
        const group = groupService.getGroupById(SessionStorage.getItem('selectedGroupId'))
        group.members.forEach((member) => {
            member.groupMemberPrescription = groupMemberPrescriptionService.getGroupMemberPrescriptionByMemberId(member.id)

            member.patient = patientService.getPatienWithstByID(member.patient_id)

            member.patient.identifiers = member.patient.identifiers.filter((identifier) => {
              return identifier.service.id === selectedGroup.value.service.id
            })
            if (member.groupMemberPrescription !== null && member.groupMemberPrescription !== undefined && isPrescription) member.groupMemberPrescription.prescription.leftDuration = calculateRemainingTime(member.groupMemberPrescription)
         //   member.patient.identifiers[0].episodes = []
            member.patient.identifiers[0].episodes[0] = lastStartEpisodeWithPrescription(member.patient.identifiers[0].id)
            if (member.patient.identifiers[0].episodes.length > 0 && member.patient.identifiers[0].episodes[0] !== null) {
             fecthMemberPrescriptionData(useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]), member)
            }
        })
        allMembers.value = group.members
        if (!useGroup().isDesintegrated(group)) {
          members.value = group.members.filter((member) => {
            return useGroupMember().isActive(member) })
            console.log(members.value)
          //  group.members = members.value
        } else {
          members.value = group.members
        }
        console.log(group.members)
    }
    */

 const  fecthMemberPrescriptionData = (visitDetails, member) => {
      if (!isMobile.value) {
        if (visitDetails.pack !== null) {
          fecthedMemberData.value = fecthedMemberData.value + 1
        }
     } else {
        if (visitDetails.pack !== null) packService.apiFetchById(visitDetails.pack.id)
        if (member.groupMemberPrescription !== null) {
          Prescription.apiFetchById(member.groupMemberPrescription.id).then(resp => {
          fecthedMemberData.value = this.fecthedMemberData + 1
        })
        } else {
          prescriptionService.apiFetchById(visitDetails.prescription.id).then(resp => {
          fecthedMemberData.value = fecthedMemberData.value + 1
        })
        }
      }
    }

 const loadMembers = () => {
        if (useGroup().isDesintegrated(selectedGroup)) {
          members.value = allMembers.value
        }
        console.log(members.value)
        members.value = members.value.filter((member) => {
            return useGroupMember().isActive(member) })
            console.log(members.value)
        members.value.forEach((member) => {
          if (member.patient.identifiers[0].episodes[0] !== null && useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).pack !== null) {
            useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).pack = packService.getPackWithsByID(useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).pack.id)
          }
          if (member.patient.identifiers[0].episodes[0] !== null && useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).prescription !== null) {
          /*
            const prescription = Prescription.query()
                                          .with('prescriptionDetails')
                                          .with('duration')
                                          .with(['prescribedDrugs.drug.form', 'prescribedDrugs.drug.clinicalService.identifierType'])
                                          .with('doctor')
                                          .with('patientVisitDetails.*')
                                          .where('id', member.patient.identifiers[0].episodes[0].lastVisit().prescription.id)
                                          .first()
          prescription.patientVisitDetails = PatientVisitDetails.query().withAll().where('prescription_id', prescription.id).get()
          member.patient.identifiers[0].episodes[0].lastVisit().prescription = prescription
          */
         console.log(useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).prescription)
          }
        })

       console.log(members.value)
        return members.value
    }


const  lastStartEpisodeWithPrescription = (identifierId) => {
      let episode = null
      const episodes = episodeService.getStartEpisodeByIdentifierId(identifierId)
      Object.keys(episodes).forEach(function (k) {
        const id = episodes[k]
        if (episode === null && useEpisode().hasVisits(id)) {
          episode = id
        }
      })
      return episode
    }


const  calculateRemainingTime = (memberPrescription) => {
      if (memberPrescription !== null && memberPrescription !== undefined) {
     //   console.log(memberPrescription.prescription.remainigDuration())
        return usePrescription().remainigDuration(memberPrescription.prescription)
      } else {
        return 0
      }
    }



onMounted(() => {
  console.log('Child Component: onMounted');
      getGroupMembers()
     // getGroupMemberss = getGroupMembers()
     // console.log(loadedMembers.value)
     // console.log(getGroupMemberss.value)
   //   console.log(dataFechComplete.value)
})



const dataFechComplete = computed(() => {
  console.log(loadedMembers.value)
      console.log(dataFechComplete.value)
      console.log(loadedMembers.value.length)
return membersInfoLoaded.value
})

const loadedMembers = computed({
  // getter
  get()
     {
        return loadMembers()
      }
})


const  newPrescription = (member, identifier) => {
  showloading();
      selectedMember.value = member
       patient.value = member.patient
   //    isNewPrescription.value = true
   //   patient.identifiers[0].episodes[0].lastVisit().prescription.prescriptionDetails[0] = prescriptionDetailsService.getPrescriptionDetailByPrescriptionID(patient.identifiers[0].episodes[0].lastVisit().prescription.id)
      const pvd = new PatientVisitDetails({
                          patientVisit: new PatientVisit({
                                          visitDate: new Date(),
                                          patient: patientService.getPatientByID(patient.value.id),
                                          clinic: selectedGroup.value.clinic
                                        }),
                          clinic: selectedGroup.value.clinic,
                          createPackLater: true,
                        //  prescription: patient.identifiers[0].episodes[0].lastVisit().prescription,
                          prescription: new Prescription(),
                          episode: episodeService.getEpisodeById(identifier.episodes[0].id)
                        })
      patientVisitDetails.value = pvd
      selectedGroup.value.service = clinicalServiceService.getClinicalServicePersonalizedById(selectedGroup.value.service.id)
      SessionStorage.set('selectedPatient', patient)
      SessionStorage.set('selectedMember', member)
      showAddPrescription.value = true
      closeLoading();
    }



console.log(loadedMembers)
provide('patient', patient);
// provide('getGroupMembers', getGroupMembers)
provide('isNewPrescription', true);
provide('selectedMember', selectedMember);
provide('showAddPrescription', showAddPrescription);
// provide('closePrescriptionOption', closePrescriptionOption);

defineExpose({
      getGroupMembers
    })
</script>

<style lang="scss">
  .box-border {
    border: 1px solid $grey-4
  }
</style>
