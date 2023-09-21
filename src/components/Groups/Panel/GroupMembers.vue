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
      <div class="q-mb-md box-border" v-if="isOnline">
        <q-table
          class="col"
          dense
          flat
          :rows="loadedMembers"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div
              class="full-width row flex-center text-primary q-gutter-sm text-body2"
            >
              <span> Nenhum Paciente adicionado </span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template #body="props">
            <q-tr
              :props="props"
              :style="
                !useGroupMember().isActiveView(props.row)
                  ? 'color: red'
                  : ' color: black'
              "
            >
              <!--q-td key="order" :props="props">
              </q-td-->
              <q-td key="id" :props="props">
                {{ props.row.NID }}
              </q-td>
              <q-td key="name" :props="props">
                {{ props.row.fullName }}
              </q-td>
              <q-td key="lasPrescriptionDate" :props="props">
                {{
                  getDDMMYYYFromJSDate(
                    props.row.lastPrescriptionDateMember !== undefined
                      ? props.row.lastPrescriptionDateMember
                      : props.row.lastPrescriptionDate
                  )
                }}
              </q-td>
              <q-td key="remainingTime" :props="props">
                {{
                  props.row.lastPrescriptionDateMember !== undefined
                    ? props.row.validadeNova
                    : props.row.validade
                }}
                mes(es)
              </q-td>
              <q-td key="lastDispenseDate" :props="props">
                {{ getDDMMYYYFromJSDate(props.row.lastPickupDate) }}
              </q-td>
              <q-td key="nextPickupDate" :props="props">
                {{ getDDMMYYYFromJSDate(props.row.nextPickupDate) }}
              </q-td>
              <q-td key="options" :props="props">
                <div class="col">
                  <q-btn
                    flat
                    round
                    color="blue-8"
                    :disable="
                      useGroup().isDesintegrated(selectedGroup) ||
                      !useGroupMember().isActiveView(props.row) ||
                      props.row.validadeNova > 0 ||
                      props.row.validade > 0
                    "
                    icon="post_add"
                    @click="
                      newPrescription(
                        props.row.groupMemberId,
                        props.row.patientServiceId,
                        props.row.episodeId
                      )
                    "
                  >
                    <q-tooltip class="bg-blue-5">Nova Prescrição</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    :disable="
                      useGroup().isDesintegrated(selectedGroup) ||
                      !useGroupMember().isActiveView(props.row) ||
                      (props.row.validadeNova === 0 && props.row.validade === 0)
                    "
                    color="red-8"
                    icon="delete"
                    @click="removeGroupMemberPrescription(props.row)"
                  >
                    <q-tooltip class="bg-red-5">Remover Prescrição</q-tooltip>
                  </q-btn>

                  <q-btn
                    flat
                    round
                    color="red-8"
                    :disable="
                      useGroup().isDesintegrated(selectedGroup) ||
                      !useGroupMember().isActiveView(props.row)
                    "
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
      <div class="q-mb-md box-border" v-if="!isOnline">
        <q-table
          class="col"
          dense
          flat
          :rows="loadedMembers"
          :columns="columns"
          row-key="id"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div
              class="full-width row flex-center text-primary q-gutter-sm text-body2"
            >
              <span> Nenhum Paciente adicionado </span>
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            </div>
          </template>
          <template #body="props">
            <q-tr :props="props">
              <!--q-td key="order" :props="props">
              </q-td-->
              <q-td key="id" :props="props">
                {{ usePatient().preferedIdentifier(props.row.patient).value }}
              </q-td>
              <q-td key="name" :props="props">
                {{ usePatient().fullName(props.row.patient) }}
              </q-td>
              <q-td key="lasPrescriptionDate" :props="props">
                {{
                  getDDMMYYYFromJSDate(
                    props.row.groupMemberPrescriptions[0] !== undefined &&
                      props.row.groupMemberPrescriptions[0] !== null
                      ? props.row.groupMemberPrescriptions[0].prescription
                          .prescriptionDate
                      : useEpisode().lastVisit(
                          props.row.patient.identifiers[0].episodes[0]
                        ).prescription.prescriptionDate
                  )
                }}
              </q-td>
              <q-td key="remainingTime" :props="props">
                {{
                  props.row.groupMemberPrescriptions[0] !== undefined &&
                  props.row.groupMemberPrescriptions[0] !== null
                    ? usePrescription().remainigDuration(
                        props.row.groupMemberPrescriptions[0].prescription
                      )
                    : useEpisode().lastVisit(
                        props.row.patient.identifiers[0].episodes[0]
                      ).prescription.leftDuration
                }}
                mes(es)
              </q-td>
              <q-td key="lastDispenseDate" :props="props">
                {{
                  usePrescription().lastPackOnPrescription(
                    useEpisode().lastVisit(
                      props.row.patient.identifiers[0].episodes[0]
                    ).prescription
                  ) !== null
                    ? getDDMMYYYFromJSDate(
                        usePrescription().lastPackOnPrescription(
                          useEpisode().lastVisit(
                            props.row.patient.identifiers[0].episodes[0]
                          ).prescription
                        ).pickupDate
                      )
                    : '-'
                }}
              </q-td>
              <q-td key="nextPickupDate" :props="props">
                {{
                  usePrescription().lastPackOnPrescription(
                    useEpisode().lastVisit(
                      props.row.patient.identifiers[0].episodes[0]
                    ).prescription
                  ) !== null
                    ? getDDMMYYYFromJSDate(
                        usePrescription().lastPackOnPrescription(
                          useEpisode().lastVisit(
                            props.row.patient.identifiers[0].episodes[0]
                          ).prescription
                        ).nextPickUpDate
                      )
                    : '-'
                }}
              </q-td>
              <q-td key="options" :props="props">
                <div class="col">
                  <q-btn
                    flat
                    round
                    color="blue-8"
                    :disable="
                      useGroup().isDesintegrated(selectedGroup) ||
                      !useGroupMember().isActive(props.row)
                    "
                    icon="post_add"
                    @click="
                      newPrescription(
                        props.row,
                        props.row.patient.identifiers[0]
                      )
                    "
                  >
                    <q-tooltip class="bg-blue-5">Nova Prescrição</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="red-8"
                    :disable="
                      useGroup().isDesintegrated(selectedGroup) ||
                      !useGroupMember().isActive(props.row)
                    "
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
    <q-dialog persistent v-model="showAddPrescription">
      <addEditPrescription @close="showAddPrescription = false" />
    </q-dialog>
  </div>
</template>

<script setup>
import {
  computed,
  inject,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from 'vue';
import Group from '../../../stores/models/group/Group';
import { SessionStorage } from 'quasar';
import Prescription from '../../../stores/models/prescription/Prescription';
import moment from 'moment';
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails';
import episodeService from 'src/services/api/episode/episodeService';
import packService from 'src/services/api/pack/packService';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import patientService from 'src/services/api/patientService/patientService';
// import packService from 'src/services/api/pack/packService';
import { useGroup } from 'src/composables/group/groupMethods';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import { usePatient } from 'src/composables/patient/patientMethods';
import ListHeader from 'components/Shared/ListHeader.vue';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import addEditPrescription from 'components/Groups/AddMemberPrescription.vue';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';

const columns = [
  { name: 'id', align: 'left', label: 'Identificador', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  {
    name: 'lasPrescriptionDate',
    align: 'left',
    label: 'Data da Última Prescrição',
    sortable: false,
  },
  { name: 'remainingTime', align: 'left', label: 'Validade', sortable: false },
  {
    name: 'lastDispenseDate',
    align: 'left',
    label: 'Data da Última Dispensa',
    sortable: false,
  },
  {
    name: 'nextPickupDate',
    align: 'left',
    label: 'Data do Próximo Levantamento',
    sortable: false,
  },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];

const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { closeLoading, showloading } = useLoading();
const { website, isDeskTop, isOnline } = useSystemUtils();
const username = localStorage.getItem('user');
const clinic = inject('clinic');
let curGroup = reactive(ref(new Group({ members: [] })));
const patient = ref(null);
const showAddPrescription = ref(false);
const patientVisitDetails = ref();
const membersInfoLoaded = ref(true);
const allMembers = inject('allMembers');
const members = inject('members');
const selectedMember = ref([]);
const step = 'display';
const showPrescriptionData = ref(true);
const dialogTitle = ref('');
const isNewPrescription = ref();
const selectedGroup = inject('group');
const desintagrateGroup = inject('desintagrateGroup');
const loadMemberInfoToShowByGroupId = inject('loadMemberInfoToShowByGroupId');
const groupMembersNew = inject('groupMembersNew');
const loadMemberInfoByMember2 = inject('loadMemberInfoByMember2');
// const loadedPrescriptionInfo = ref(false);
//const membersInfoLoaded = inject('membersInfoLoaded');
const newPrescription = inject('newPrescription');
const loadedPrescriptionInfo = inject('loadedPrescriptionInfo');
const getGroupMembers = inject('getGroupMembers');

watch(
  () => membersInfoLoaded.value,
  (oldp, newp) => {
    if (oldp !== newp) {
      //  closeLoading();
    }
  }
);

const emit = defineEmits([
  'addMember',
  'desintagrateGroup',
  // 'newPrescription'
]);

const addMember = () => {
  emit('addMember');
};

const expandLess = (value) => {
  showPrescriptionData.value = !value;
};

const removeGroupMemberPrescription = (row) => {
  const groupMemberPrescription =
    groupMemberPrescriptionService.getGroupMemberPrescriptionByMemberId(
      row.groupMemberId
    );
  alertWarningAction(
    'Confirma a remoção da Prescrição do Membro[' + row.fullName + '?'
  ).then((result) => {
    if (result) {
      groupMemberPrescriptionService.delete(groupMemberPrescription.id);
      loadMemberInfoToShowByGroupId();
    }
  });
};

const removeMember = (row) => {
  dialogTitle.value = 'Confirmação da remoção do membro.';
  if (!isOnline) {
    selectedMember.value = row;
    if (members.value.length === 1) {
      // step = 'desintagrate'
      alertWarningAction(
        'Nota: Ao remover este membro o grupo será desintegrado. Continuar?'
      ).then((result) => {
        if (result) {
          desintagrateGroup();
        }
      });
    } else {
      // this.step = 'memberRemotion'
      alertWarningAction(
        'Confirma a remoção do membro [' +
          usePatient().fullName(row.patient) +
          '], deste grupo?'
      ).then((result) => {
        if (result) {
          doMemberRemotion();
        }
      });
    }
  } else {
    selectedMember.value = groupMemberService.getMemberById(row.groupMemberId);
    if (useGroup().getActiveMemberRows(groupMembersNew.value).length === 1) {
      // step = 'desintagrate'
      alertWarningAction(
        'Nota: Ao remover este membro o grupo será desintegrado. Continuar?'
      ).then((result) => {
        if (result) {
          desintagrateGroup();
        }
      });
    } else {
      // this.step = 'memberRemotion'
      alertWarningAction(
        'Confirma a remoção do membro [' + row.fullName + '], deste grupo?'
      ).then((result) => {
        if (result) {
          doMemberRemotion();
        }
      });
    }
  }
};

const doMemberRemotion = () => {
  selectedMember.value.endDate = new Date();
  const member = Object.assign({}, selectedMember.value);
  member.group = {};
  member.group.id = member.group_id;
  const memberPatientId = member.patient.id;
  member.patient = {};
  member.patient.id = memberPatientId;
  member.clinic = {};
  member.clinic.id = clinic.value.id;
  groupMemberService.apiUpdate(member).then((resp) => {
    if (!isOnline) getGroupMembers();
    loadMemberInfoToShowByGroupId();
    alertSucess('Operação efectuada com sucesso.');
  });
};
const getDDMMYYYFromJSDate = (jsDate) => {
  return moment(jsDate).format('DD-MM-YYYY');
};

const loadMembers = () => {
  if (useGroup().isDesintegrated(selectedGroup)) {
    members.value = allMembers.value;
  }
  // members.value = members.value.filter((member) => {
  //  return useGroupMember().isActive(member);
  // });
  members.value.forEach((member) => {
    /*
    if (member.patient.identifiers === undefined) {
      member.patient = patientService.getPatienWithstByID(member.patient.id);
    }
    */
    if (member.patient.identifiers !== undefined) {
      member.patient.identifiers[0].episodes[0] =
        lastStartEpisodeWithPrescription(member.patient.identifiers[0].id);
      if (
        member.patient.identifiers[0].episodes[0] !== null &&
        useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
          .pack !== null
      ) {
        useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]).pack =
          packService.getPackWithsByID(
            useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
              .pack.id
          );
      }
      /*
      if (
        member.patient.identifiers[0].episodes[0] !== null &&
        useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
          .prescription !== null
      ) {

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

        console.log(
          useEpisode().lastVisit(member.patient.identifiers[0].episodes[0])
            .prescription
        );
      }
      */
    }
  });
  if (!isOnline) return members.value;
  // closeLoading();
  return groupMembersNew.value;
};

const lastStartEpisodeWithPrescription = (identifierId) => {
  return episodeService.getStartEpisodeByIdentifierId(identifierId);
};

onMounted(() => {
  // showloading();
  if (!isOnline) getGroupMembers();
  // getGroupMembers();
  // closeLoading();
  console.log(groupMembersNew);
});

const dataFechComplete = computed(() => {
  return membersInfoLoaded.value;
});

const loadedMembers = computed({
  // getter
  get() {
    return loadMembers();
  },
});

const loadedMembersInfo = computed(() => {
  console.log(loadedPrescriptionInfo.value);
  return loadedPrescriptionInfo.value;
});

provide('patient', patient);
provide('loadMemberInfoToShowByGroupId', loadMemberInfoToShowByGroupId);
provide('isNewPrescription', isNewPrescription);
provide('selectedMember', selectedMember);
provide('showAddPrescription', showAddPrescription);
// provide('closePrescriptionOption', closePrescriptionOption);
</script>

<style lang="scss">
.box-border {
  border: 1px solid $grey-4;
}
</style>
