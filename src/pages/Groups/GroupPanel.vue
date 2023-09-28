<template>
  <div>
    <PanelTitleBar v-if="isMobile" @showGroupDetails="showGroupDetails">
      Detalhe do Grupo
    </PanelTitleBar>
    <TitleBar v-else />
    <div class="q-pa-md" v-if="isMobile">
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
            @desintagrateGroup="desintagrateGroup"
          />
          <groupPacks v-if="dataFetchDone" />
        </q-scroll-area>
      </div>
    </div>

    <span v-if="website">
      <div class="row q-mt-md">
        <div class="col-3 q-pa-md q-pl-lg q-ml-lg q-mr-lg panel">
          <groupInfo
            v-if="dataFetchDone"
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
                @desintagrateGroup="desintagrateGroup"
              />
              <groupPacks v-if="dataFetchDone" />
            </span>
          </q-scroll-area>
        </div>
      </div>
    </span>
    <q-dialog persistent v-model="showRegisterRegister">
      <groupRegister @close="showRegisterRegister = false" />
    </q-dialog>
    <q-dialog persistent v-model="loadedPrescriptionInfo">
      <addEditPrescription
        v-if="loadedPrescriptionInfo"
        @close="loadedPrescriptionInfo = false"
      />
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, provide, ref, watch } from 'vue';
import { SessionStorage } from 'quasar';
import Group from '../../stores/models/group/Group';
import GroupMemberPrescription from '../../stores/models/group/GroupMemberPrescription';
import GroupPackHeader from '../../stores/models/group/GroupPackHeader';
import patientService from 'src/services/api/patientService/patientService';
import episodeService from 'src/services/api/episode/episodeService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import groupService from 'src/services/api/group/groupService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import packService from 'src/services/api/pack/packService';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import groupPackHeaderService from 'src/services/api/groupPackHeader/groupPackHeaderService';
import TitleBar from 'components/Shared/TitleBar.vue';
import groupInfo from 'components/Groups/Panel/GroupInfo.vue';
import groupRegister from 'components/Groups/AddEditGroup.vue';
import groupMembers from 'components/Groups/Panel/GroupMembers.vue';
import groupPacks from 'components/Groups/Panel/GroupDispenses.vue';
import dispenseModeService from 'src/services/api/dispenseMode/dispenseModeService';
import PanelTitleBar from 'components/Groups/Panel/PanelTitleBar.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useGroupMember } from 'src/composables/group/groupMemberMethods';
import clinicService from 'src/services/api/clinicService/clinicService';
import { useGroup } from 'src/composables/group/groupMethods';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import PatientVisitDetails from '../../stores/models/patientVisitDetails/PatientVisitDetails';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import Prescription from '../../stores/models/prescription/Prescription';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import addEditPrescription from 'components/Groups/AddMemberPrescription.vue';
// import isOnline from 'is-online';

const { alertSucess } = useSwal();
const { closeLoading, showloading } = useLoading();
const { isOnline, isMobile, website } = useSystemUtils();

// const defaultPickUpDate = ref([]);
const selectedMember = ref(null);
const membersInfoLoaded = ref(false);
const showAddPrescription = ref(false);
const showNewPackingForm = ref(false);
const groupAddEditStep = ref(false);
const showRegisterRegister = ref(false);
const showGroupInfo = ref(false);
const patient = ref(null);
const allMembers = ref([]);
const fecthedMemberData = ref(0);
const members = ref([]);
const groupMembersNew = ref([]);
const loadedPrescriptionInfo = ref(false);
const patientVisitDetails = ref();
// const isNewPrescription = ref(false);
const isNewPrescription = ref(false);

const title = ref('Painel do Grupo');
const contentStyle = {
  backgroundColor: 'rgba(0,0,0,0.02)',
  color: '#555',
};

const contentActiveStyle = {
  backgroundColor: '#eee',
  color: 'black',
};

const thumbStyle = {
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
};

const fecthMembersData = () => {
  group.value.members.forEach((member) => {
    member.patient = patientService.getPatientByID(member.patient.id);
    member.patient.identifiers = member.patient.identifiers.filter(
      (identifier) => {
        return identifier.service.id === group.value.service.id;
      }
    );
  });
};

const loadVisitDetailsInfo = (visitDetails, i) => {
  prescriptionService
    .apiFetchById(visitDetails[i].prescription.id)
    .then((resp) => {
      visitDetails[i].prescription = resp.data;
      packService.apiFetchById(visitDetails[i].pack.id).then((resp) => {
        visitDetails[i].pack = resp.data;
        membersInfoLoaded.value = true;
        closeLoading();
      });
    });
};

const showGroupDetails = () => {
  showGroupInfo.value = !showGroupInfo.value;
};

const loadMemberInfoToShowByGroupId = async () => {
  groupMembersNew.value = await groupMemberService.apiGetGroupMemberInfo(
    SessionStorage.getItem('selectedGroupId')
  );
  membersInfoLoaded.value = true;
  closeLoading();
  return groupMembersNew;
};

const loadAllMembersInfoByMember2 = async () => {
  const promises = groupMembersNew.value.map(async (gm) => {
    if (gm.membershipEndDate === undefined) {
      const patient = await patientService.apiFetchById(gm.patientId);
      const respIdent = await patientServiceIdentifierService.apiFetchById(
        gm.patientServiceId
      );
      const identifier = respIdent.data;
      const resp = await episodeService.apiFetchById(gm.episodeId);
      const respGroupMemberPres =
        await groupMemberPrescriptionService.apiFetchByMemberId(
          gm.groupMemberId
        );

      if (resp.data) {
        identifier.episodes[0] = resp.data;

        //  for (const episode of identifier.episodes) {
        const episode = identifier.episodes[0];
        const respVisit =
          await patientVisitDetailsService.apiGetLastByEpisodeId(episode.id);

        if (respVisit.data) {
          episode.patientVisitDetails = [];
          episode.patientVisitDetails[0] = respVisit.data;

          const prescriptionResp = await prescriptionService.apiFetchById(
            episode.patientVisitDetails[0].prescription.id
          );
          episode.patientVisitDetails[0].prescription = prescriptionResp.data;
          if (respGroupMemberPres.status === 200) {
            await prescriptionService.apiFetchById(
              respGroupMemberPres.data.prescription.id
            );
          }
        }
        //  }
      }
    }
  });
  await Promise.all(promises);
};

const loadMemberInfoByMember2 = async (member, patientServiceId, episodeId) => {
  const patient = await patientService.apiFetchById(member.patient_id);
  const respIdent = await patientServiceIdentifierService.apiFetchById(
    patientServiceId
  );

  const identifier = respIdent.data;
  const resp = await episodeService.apiFetchById(episodeId);
  if (resp.data) {
    identifier.episodes[0] = resp.data;

    //  for (const episode of identifier.episodes) {
    const episode = identifier.episodes[0];
    const respVisit = await patientVisitDetailsService.apiGetLastByEpisodeId(
      episode.id
    );

    if (respVisit.data) {
      episode.patientVisitDetails = [];
      episode.patientVisitDetails[0] = respVisit.data;

      const prescriptionResp = await prescriptionService.apiFetchById(
        episode.patientVisitDetails[0].prescription.id
      );
      episode.patientVisitDetails[0].prescription = prescriptionResp.data;

      closeLoading();
    }
    //  }
  }
};

const loadMemberInfo = () => {
  showloading();
  if (!isOnline.value) {
    group.value.members.forEach((member) => {
      groupMemberPrescriptionService.apiFetchByMemberId(member.id);
    });
    /*
    GroupPackHeader.localDbGetAll().then((items) => {
      items.forEach((item) => {
        if (item.group_id === group.value.id) {
          GroupPackHeader.insert({ data: item });
        }
      });
    });
    */
    membersInfoLoaded.value = true;
    closeLoading();
  } else {
    dispenseModeService.apiGetAll();
    //  group.value.members.forEach((member) => {
    //    loadMemberInfoByMember(member);
    //  });
    loadMemberInfoToShowByGroupId();
  }
};
onMounted(() => {
  loadMemberInfo();
  //setTimeout(() => {
  // closeLoading();
  // }, 2000);
});

const addMember = () => {
  groupAddEditStep.value = 'addMember';
  showRegisterRegister.value = true;
};

const editGroup = () => {
  groupAddEditStep.value = 'edit';
  showRegisterRegister.value = true;
};

const dataFetchDone = computed(() => {
  return membersInfoLoaded.value;
});

const group = computed(() => {
  return groupService.getGroupWithsById(
    SessionStorage.getItem('selectedGroupId')
  );
});

const desintagrateGroup = () => {
  group.value.members = group.value.members.filter((member) => {
    return useGroupMember().isActive(member);
  });
  group.value.members.forEach((member) => {
    if (member.syncStatus !== 'R') member.syncStatus = 'U';
    member.endDate = new Date();
    //  member.patient = patientService.getPatientByID(member.patient.id);
    const memberPatientId = member.patient.id;
    member.patient = {};
    member.patient.id = memberPatientId;
    member.group = null;
    member.clinic = clinic.value;
  });
  //  group.service.identifierType = IdentifierType.find(group.service.identifier_type_id)
  group.value.endDate = new Date();
  group.value.packHeaders = [];
  groupService.apiUpdate(group.value).then((resp) => {
    // groupService.apiFetchById(group.value.id);
    loadMemberInfoToShowByGroupId();
    alertSucess('Operação efectuada com sucesso.');
  });
};

watch(
  () => membersInfoLoaded.value,
  (oldp, newp) => {
    if (oldp !== newp) {
      // fecthMembersData();
      // closeLoading();
    }
  }
);

const getGroupMembers = async (isPrescription) => {
  const group = groupService.getGroupById(
    SessionStorage.getItem('selectedGroupId')
  );
  for (const member of group.members) {
    member.groupMemberPrescriptions[0] =
      groupMemberPrescriptionService.getGroupMemberPrescriptionByMemberId(
        member.id
      );

    member.patient = patientService.getPatienWithstByID(member.patient_id);

    member.patient.identifiers = member.patient.identifiers.filter(
      (identifier) => {
        return identifier.service.id === group.service.id;
      }
    );
    if (
      member.groupMemberPrescriptions[0] !== null &&
      member.groupMemberPrescriptions[0] !== undefined
    ) {
      member.groupMemberPrescriptions[0].prescription.leftDuration =
        calculateRemainingTime(member.groupMemberPrescriptions[0]);
    }

    //   member.patient.identifiers[0].episodes = []
    member.patient.identifiers[0].episodes[0] =
      lastStartEpisodeWithPrescription(member.patient.identifiers[0].id);

    if (member.patient.identifiers[0].episodes[0] === null) {
      // showloading();
      //  const loadedMemberInfo = await loadMemberInfoByMember(member);
      //  if (loadedMemberInfo) {
      member.patient.identifiers[0].episodes[0] =
        lastStartEpisodeWithPrescription(member.patient.identifiers[0].id);
      // }
    }
    if (
      member.patient.identifiers[0].episodes.length > 0 &&
      member.patient.identifiers[0].episodes[0] !== null
    ) {
      fecthMemberPrescriptionData(
        useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]),
        member
      );
    }
  }
  allMembers.value = group.members;
  if (!useGroup().isDesintegrated(group)) {
    //  members.value = group.members.filter((member) => {
    //    return useGroupMember().isActive(member);
    //   });
    group.members = members.value;
  } else {
    members.value = group.members;
  }
  // closeLoading();
};

const lastStartEpisodeWithPrescription = (identifierId) => {
  const episode = episodeService.getStartEpisodeByIdentifierId(identifierId);
  return episode;
};

const calculateRemainingTime = (memberPrescription) => {
  if (memberPrescription !== null && memberPrescription !== undefined) {
    return usePrescription().remainigDuration(memberPrescription.prescription);
  } else {
    return 0;
  }
};

const fecthMemberPrescriptionData = (visitDetails, member) => {
  if (!isOnline.value) {
    //mudar para Online
    if (visitDetails.pack !== null) {
      fecthedMemberData.value = fecthedMemberData.value + 1;
    }
  } else {
    if (visitDetails.pack !== null)
      packService.apiFetchById(visitDetails.pack.id);
    if (member.groupMemberPrescriptions[0] !== null) {
      prescriptionService
        .apiFetchById(member.groupMemberPrescriptions[0].prescription.id)
        .then((resp) => {
          fecthedMemberData.value = fecthedMemberData.value + 1;
        });
    } else {
      prescriptionService
        .apiFetchById(visitDetails.prescription.id)
        .then((resp) => {
          fecthedMemberData.value = fecthedMemberData.value + 1;
        });
    }
  }
};
const clinic = computed(() => {
  return clinicService.currClinic();
});

const newPrescription = async (member, patientServiceId, episodeId) => {
  showloading();

  selectedMember.value = groupMemberService.getMemberById(member);
  //  selectedMember.value = groupMemberService.getMemberById(member); membersInfoLoaded.value = false;
  await loadMemberInfoByMember2(
    selectedMember.value,
    patientServiceId,
    episodeId
  );
  // const identifier = patientServiceIdentifierService.getLatestIdentifierSlimByPatientId(patientId)
  patient.value = patientService.getPatienWithstByID(
    selectedMember.value.patient_id
  );
  // await patientServiceIdentifierService.apiGetAllByPatientId(
  //   selectedMember.value.patient.id
  // );
  const identifier =
    patientServiceIdentifierService.getLatestIdentifierSlimByPatientId(
      selectedMember.value.patient.id
    );
  // isNewPrescription.value = true;
  //   patient.identifiers[0].episodes[0].lastVisit().prescription.prescriptionDetails[0] = prescriptionDetailsService.getPrescriptionDetailByPrescriptionID(patient.identifiers[0].episodes[0].lastVisit().prescription.id)
  const pvd = new PatientVisitDetails({
    patientVisit: new PatientVisit({
      visitDate: new Date(),
      patient: patientService.getPatientByID(patient.value.id),
      clinic: group.value.clinic,
    }),
    clinic: group.value.clinic,
    createPackLater: true,
    //prescription: patient.identifiers[0].episodes[0].lastVisit().prescription,
    prescription: new Prescription(),
    episode: episodeService.getEpisodeById(identifier.episodes[0].id),
  });
  patientVisitDetails.value = pvd;
  group.value.service =
    clinicalServiceService.getClinicalServicePersonalizedById(
      group.value.service.id
    );
  // SessionStorage.set('selectedPatient', patient);
  // SessionStorage.set('selectedMember', member);
  // if (loadedPrescriptionInfo.value === true) {
  //   showAddPrescription.value = true;
  // }\
  setTimeout(() => {
    closeLoading();
  }, 2000);
  console.log(patient.value);
  isNewPrescription.value = true;
  loadedPrescriptionInfo.value = true;
  // closeLoading();
};

provide('title', title);
provide('step', groupAddEditStep);
provide('group', group);
provide('patient', patient);
provide('clinic', clinic);
provide('selectedMember', selectedMember);
provide('showAddPrescription', showAddPrescription);
provide('showNewPackingForm', showNewPackingForm);
provide('desintagrateGroup', desintagrateGroup);
provide('dataFetchDone', dataFetchDone);
provide('loadMemberInfoToShowByGroupId', loadMemberInfoToShowByGroupId);
provide('allMembers', allMembers);
provide('members', members);
provide('groupMembersNew', groupMembersNew);
provide('groupMembersNew', groupMembersNew);
provide('loadMemberInfoByMember2', loadMemberInfoByMember2);
provide('membersInfoLoaded', membersInfoLoaded);
provide('newPrescription', newPrescription);
provide('loadedPrescriptionInfo', loadedPrescriptionInfo);
provide('isNewPrescription', isNewPrescription);
provide('loadAllMembersInfoByMember2', loadAllMembersInfoByMember2);
</script>

<style lang="scss">
.panel {
  border: 1px solid $grey-13;
  border-radius: 10px;
}
</style>
