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
      <groupRegister
        @getGroupMembers="getGroupMembers"
        @close="showRegisterRegister = false"
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
// const isNewPrescription = ref(false);

const title = ref('Procurar ou adicionar Grupo');
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
      });
    });
};

const showGroupDetails = () => {
  showGroupInfo.value = !showGroupInfo.value;
};

const loadMemberInfo = () => {
  // showloading();
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
    group.value.members.forEach((member) => {
      groupMemberPrescriptionService
        .apiFetchByMemberId(member.id)
        .then((respd) => {
          if (respd.status === 200) {
            prescriptionService.apiFetchById(respd.data.prescription.id);
          }
        });
      patientService.apiFetchById(member.patient_id).then((res0) => {
        member.patient = res0.data;
        member.patient.identifiers.forEach((identifier) => {
          identifier = patientServiceIdentifierService.curIdentifierById(
            identifier.id
          );
          if (identifier.service.code === group.value.service.code) {
            episodeService
              .apiGetAllByIdentifierId(identifier.id)
              .then((resp) => {
                if (resp.data.length > 0) {
                  identifier.episodes = resp.data;
                  identifier.episodes.forEach((episode) => {
                    patientVisitDetailsService
                      .apiGetLastByEpisodeId(episode.id)
                      .then((resp) => {
                        if (resp.data) {
                          episode.patientVisitDetails = [];
                          episode.patientVisitDetails[0] = resp.data;
                          patientVisitDetailsService.apiGetAllofPrecription(
                            episode.patientVisitDetails[0].prescription.id
                          );
                          loadVisitDetailsInfo(episode.patientVisitDetails, 0);
                        }
                      });
                  });
                  group.value.packHeaders.forEach((packHeader) => {
                    groupPackHeaderService
                      .apiFetchById(packHeader.id)
                      .then((resp) => {
                        console.log(resp);
                      });
                    closeLoading();
                  });
                }
              });
          }
        });
      });
    });
  }
};
onMounted(() => {
  loadMemberInfo();
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
    groupService.apiFetchById(group.value.id);
    alertSucess('Operação efectuada com sucesso.');
  });
};

watch(
  () => membersInfoLoaded.value,
  (oldp, newp) => {
    if (oldp !== newp) {
      fecthMembersData();
      closeLoading();
    }
  }
);

const getGroupMembers = (isPrescription) => {
  const group = groupService.getGroupById(
    SessionStorage.getItem('selectedGroupId')
  );
  group.members.forEach((member) => {
    member.groupMemberPrescription =
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
      member.groupMemberPrescription !== null &&
      member.groupMemberPrescription !== undefined &&
      isPrescription
    ) {
      member.groupMemberPrescription.prescription.leftDuration =
        calculateRemainingTime(member.groupMemberPrescription);
    }

    //   member.patient.identifiers[0].episodes = []
    member.patient.identifiers[0].episodes[0] =
      lastStartEpisodeWithPrescription(member.patient.identifiers[0].id);
    if (
      member.patient.identifiers[0].episodes.length > 0 &&
      member.patient.identifiers[0].episodes[0] !== null
    ) {
      fecthMemberPrescriptionData(
        useEpisode().lastVisit(member.patient.identifiers[0].episodes[0]),
        member
      );
    }
  });
  allMembers.value = group.members;
  if (!useGroup().isDesintegrated(group)) {
    members.value = group.members.filter((member) => {
      return useGroupMember().isActive(member);
    });
    //  group.members = members.value
  } else {
    members.value = group.members;
  }
};

const lastStartEpisodeWithPrescription = (identifierId) => {
  return episodeService.getStartEpisodeByIdentifierId(identifierId);
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
    if (member.groupMemberPrescription !== null) {
      prescriptionService
        .apiFetchById(member.groupMemberPrescription.prescription.id)
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
provide('getGroupMembers', getGroupMembers);
provide('allMembers', allMembers);
provide('members', members);
</script>

<style lang="scss">
.panel {
  border: 1px solid $grey-13;
  border-radius: 10px;
}
</style>
