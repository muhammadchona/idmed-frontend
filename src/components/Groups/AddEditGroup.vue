<template>
  <q-card style="width: 900px; max-width: 90vw; height: 80%">
    <q-responsive :ratio="16 / 9" class="col">
      <form @submit.prevent="submitForm" class="q-ma-none">
        <q-card-section class="q-pa-none bg-green-2">
          <div class="q-pa-md">
            <div class="row items-center">
              <q-icon name="groups" size="sm" />
              <span class="q-pl-sm text-subtitle2">Dados do Grupo</span>
            </div>
          </div>
          <q-separator color="grey-13" size="1px" />
        </q-card-section>
        <q-card-section class="q-px-md">
          <div class="q-mt-md">
            <div class="row">
              <q-select
                class="col"
                ref="curGroupServiceRef"
                dense
                :disable="isMemberEditionStep || isEditStep"
                outlined
                :options="clinicServices"
                v-model="curGroup.service"
                option-value="id"
                option-label="code"
                label="Serviço de Saúde *"
                :rules="[
                  (val) => !!val || 'Por favor indicar o Serviço de Saúde',
                ]"
                @update:model-value="disabelFieldSearch()"
              />
              <q-input
                outlined
                ref="curGroupCodeRef"
                v-model="curGroup.code"
                :value="curGroup.code"
                :disable="isMemberEditionStep"
                type="text"
                lazy-rules
                label="Numero do grupo *"
                dense
                class="col q-ml-md"
                :rules="[
                  (val) => !!val || 'Por favor indicar o Numero de Grupo',
                ]"
              >
                <template
                  v-slot:append
                  v-if="
                    curGroup.code !== null &&
                    curGroup.code !== undefined &&
                    curGroup.code !== ''
                  "
                >
                </template>
              </q-input>
              <q-input
                outlined
                ref="curGroupNameRef"
                v-model="curGroup.name"
                :value="curGroup.name"
                :disable="isMemberEditionStep"
                type="text"
                lazy-rules
                label="Nome *"
                dense
                class="col q-ml-md"
                :rules="[(val) => !!val || 'Por favor indicar o Nome do Grupo']"
              >
                <template
                  v-slot:append
                  v-if="
                    curGroup.name !== null &&
                    curGroup.name !== undefined &&
                    curGroup.name !== ''
                  "
                >
                </template>
              </q-input>
            </div>
            <div class="row q-mt-md">
              <q-select
                ref="curGroupGroupTypeRef"
                class="col"
                dense
                outlined
                :options="groupTypes"
                :disable="isMemberEditionStep"
                v-model="curGroup.groupType"
                option-value="id"
                option-label="description"
                label="Tipo *"
                :rules="[(val) => !!val || 'Por favor indicar o Tipo do Grupo']"
              />
              <q-select
                class="col q-ml-md"
                ref="curGroupDispenseTypeRef"
                dense
                :disable="isMemberEditionStep || isEditStep"
                outlined
                :options="dispenseTypes"
                v-model="curGroup.dispenseType"
                option-value="id"
                option-label="description"
                label="Tipo de Dispensa *"
                :rules="[
                  (val) => !!val || 'Por favor indicar o Tipo de dispensa',
                ]"
                @update:model-value="disabelFieldSearch()"
              />
              <q-input
                dense
                outlined
                class="col q-ml-md"
                v-model="startDate"
                :disable="isMemberEditionStep"
                ref="creationDateRef"
                label="Data de Criação *"
                :rules="[
                  (val) => !!val || 'Por favor indicar a Data de Criação',
                ]"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="qDateProxy"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="startDate" mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn
                            v-close-popup
                            label="Close"
                            color="primary"
                            flat
                          />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-space />
            </div>
          </div>
          <div class="q-mt-lg">
            <div class="row items-center q-mb-md">
              <q-icon name="person" size="sm" />
              <span class="q-pl-sm text-subtitle2">Membros</span>
            </div>
            <q-separator color="grey-13" size="1px" />
          </div>
          <div class="row">
            <q-input
              bottom-slots
              outlined
              v-model="searchParam"
              label="Pesquisar por Identificador/Nome"
              style="width: 400px"
              :disable="isSearchParamDisabled"
              class="q-mt-md"
              dense
            >
              <template v-slot:append class="q-mr-none"> </template>
            </q-input>
            <q-btn
              @click="search()"
              class="q-mt-md q-ml-md q-mb-md"
              square
              color="primary"
              icon="search"
              :disable="false"
            >
              <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
            </q-btn>
          </div>
          <q-separator color="grey-13" size="1px" />
          <div class="row q-mt-none">
            <div class="col-6 q-pr-sm">
              <div class="col text-center q-mb-lg text-subtitle1">
                Por Adicionar
              </div>
              <q-table
                class="col"
                dense
                flat
                :rows="searchResults"
                :columns="columns"
                row-key="id"
              >
                <template v-slot:no-data="{ icon, filter }">
                  <div
                    class="full-width row flex-center text-primary q-gutter-sm text-body2"
                  >
                    <span> Sem resultados para visualizar </span>
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
                    <q-td key="id" :props="props">
                      {{ preferedIdentifier(props.row).value }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ fullName(props.row) }}
                    </q-td>
                    <q-td key="options" :props="props">
                      <div class="col">
                        <q-btn
                          flat
                          round
                          color="primary"
                          icon="group_add"
                          @click="addPatient(props.row)"
                        >
                          <q-tooltip class="bg-primary">Adicionar</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
            <q-separator color="grey-13 q-ma-none" vertical inset />
            <div class="col q-pl-sm">
              <div class="col text-center q-mb-lg text-subtitle1">
                Existentes
              </div>
              <q-table
                class="col"
                dense
                flat
                :rows="curGroup.members"
                :columns="columns"
                row-key="id"
              >
                <template v-slot:no-data="{ icon, filter }">
                  <div
                    class="full-width row flex-center text-primary q-gutter-sm text-body2"
                  >
                    <span> Nenhum Paciente adicionado </span>
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
                    <q-td key="id" :props="props">
                      {{ preferedIdentifier(props.row.patient).value }}
                    </q-td>
                    <q-td key="name" :props="props">
                      {{ fullName(props.row.patient) }}
                    </q-td>
                    <q-td key="options" :props="props">
                      <div class="col">
                        <q-btn
                          flat
                          round
                          color="red-8"
                          icon="group_remove"
                          @click="removePatient(props.row)"
                        >
                          <q-tooltip class="bg-red-5">Remover</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="fixed-card-actions">
          <q-btn label="Cancelar" color="red" @click="$emit('close')" />
          <q-btn
            type="submit"
            label="Gravar"
            color="primary"
            :loading="submitting"
          />
        </q-card-actions>
      </form>
    </q-responsive>
  </q-card>
</template>

<script setup>
import { computed, inject, onMounted, ref, watch } from 'vue';
import Group from '../../stores/models/group/Group';
import moment from 'moment';
import { SessionStorage } from 'quasar';
import GroupMember from '../../stores/models/groupMember/GroupMember';
import Episode from 'src/stores/models/episode/Episode';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRouter } from 'vue-router';
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import groupTypeService from 'src/services/api/groupType/groupTypeService';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import patientService from 'src/services/api/patientService/patientService';
import episodeService from 'src/services/api/episode/episodeService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import groupService from 'src/services/api/group/groupService';
import { v4 as uuidv4 } from 'uuid';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import dispenseTypeService from 'src/services/api/dispenseType/dispenseTypeService';
const columns = [
  { name: 'id', align: 'left', label: 'Identificador', sortable: false },
  { name: 'name', align: 'left', label: 'Nome', sortable: false },
  { name: 'options', align: 'left', label: 'Opções', sortable: false },
];
const { preferedIdentifier, fullName, hasEpisodes } = usePatient();
const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading, showloading } = useLoading();
const { isOnline } = useSystemUtils();

const emit = defineEmits(['close']);

const router = useRouter();
const startDate = ref('');
const filter = ref('');
const selected = ref([]);
const searchResults = ref([]);
const clinic = inject('clinic');
const loadMemberInfoToShowByGroupId = inject('loadMemberInfoToShowByGroupId');
const curGroup = ref(new Group({ id: uuidv4(), members: [] }));
const searchParam = ref('');
const initialGroupService = ref('');
const initialGroupDispenseType = ref('');
const step = inject('step');
const clinicServices = computed(() =>
  clinicalServiceService.getAllClinicalServices()
);

const groupTypes = computed(() => groupTypeService.getAllFromStorage());

const dispenseTypes = computed(() =>
  dispenseTypeService.getAllForGroupDispense()
);

const isCreateStep = computed(() => step.value === 'create');
// const isCreateStep = true

const isEditStep = computed(() => step.value === 'edit');
// const isEditStep = false
const isMemberEditionStep = computed(() => step.value === 'addMember');
const submitting = ref(false);

//Ref's
const curGroupServiceRef = ref(null);
const curGroupCodeRef = ref(null);
const curGroupNameRef = ref(null);
const curGroupGroupTypeRef = ref(null);
const creationDateRef = ref(null);
const curGroupDispenseTypeRef = ref(null);

const getGroupMembers = inject('getGroupMembers');

const isSearchParamDisabled = ref(true);

const disabelFieldSearch = () => {
  if (curGroup.value.service !== null && curGroup.value.dispenseType !== null) {
    if (initialGroupService.value !== curGroup.value.service.code) {
      initialGroupService.value = curGroup.value.service.code;
    }
    if (initialGroupDispenseType.value !== curGroup.value.service.code) {
      initialGroupDispenseType.value = curGroup.value.dispenseType.code;
    }
    isSearchParamDisabled.value = false;
    if (
      (initialGroupService.value !== curGroup.value.service.code ||
        initialGroupDispenseType.value !== curGroup.value.service.code) &&
      curGroup.value.members.length !== 0
    ) {
      curGroup.value.members = [];
      searchResults.value = [];
    }
  } else {
    isSearchParamDisabled.value = true;
  }
};

const checkFieldForEditGroup = () => {
  if (curGroup.value.service !== null && curGroup.value.dispenseType !== null) {
    isSearchParamDisabled.value = false;
  }
};

const isMemberOfGroupOnService = (patient, serviceCode) => {
  let res = false;
  const members = groupMemberService.getAllFromStorage();
  if (members !== null) {
    members.forEach((member) => {
      member.group = groupService.getGroupById(member.group_id);
      member.patient = patientService.getPatientByID(member.patient_id);
      if (
        patient.id === member.patient.id &&
        serviceCode === member.group.service.code &&
        (member.endDate === null || member.endDate === '')
      ) {
        res = true;
      }
    });
  }
  return res;
};

const lastEpisode = (identifier) => {
  episodeService.lastEpisodeByIdentifier(identifier.id);
};

const getGroupForEdit = () => {
  if (!isCreateStep.value) {
    curGroup.value = groupService.getGroupWithsById(
      SessionStorage.getItem('selectedGroupId')
    );
    curGroup.value.members = curGroup.value.members.filter((member) => {
      return member.endDate === null || member.endDate === '';
    });

    curGroup.value.members.map((member) => {
      member.patient = patientService.getPatienWithstByID(member.patient.id);
    });
    closeLoading();
    startDate.value = formatDate(curGroup.value.startDate);
  }
};

const search = () => {
  showloading();
  if (!isOnline.value) {
    // Depois mudar para mobile
    const patients = patientService.getPatientByClinicId(clinic.value.id);
    searchResults.value = patients.filter((patient) => {
      return (
        hasIdentifierLike(patient, searchParam.value) ||
        stringContains(patient.firstNames, searchParam.value) ||
        stringContains(patient.middleNames, searchParam.value) ||
        stringContains(patient.lastNames, searchParam.value)
      );
    });
    closeLoading();
  } else {
    if (searchParam.value.length > 0) {
      patientService.deletePatientStorage((patient) => {
        return notMember(patient);
      });
      patientService
        .apisearchByParam(searchParam.value, clinic.value.id)
        .then((resp) => {
          const patients = patientService.getPatientByClinicId(clinic.value.id);
          searchResults.value = patients.filter((patient) => {
            return (
              hasIdentifierLike(patient, searchParam.value) ||
              stringContains(patient.firstNames, searchParam.value) ||
              stringContains(patient.middleNames, searchParam.value) ||
              stringContains(patient.lastNames, searchParam.value)
            );
          });
          //    }
        });
    } else {
      closeLoading();
    }
  }
};
const isAssociatedToSelectedService = (patient) => {
  if (patient.identifiers.length <= 0) return false;

  const match = patient.identifiers.some((identifier) => {
    return identifier.service.id === curGroup.value.service.id;
  });
  return match;
};

const hasIdentifierLike = (patientToCheck, identifierString) => {
  if (patientToCheck.identifiers.length <= 0) return false;

  const match = patientToCheck.identifiers.some((identifier) => {
    return stringContains(identifier.value, identifierString);
  });
  return match;
};

const stringContains = (stringToCheck, stringText) => {
  if (stringText === '' || stringToCheck === null) return false;
  return stringToCheck.toLowerCase().includes(stringText.toLowerCase());
};

const formatDate = (dateString) => {
  if (!dateString || !moment(dateString).isValid()) return '';
  const dateMoment = moment(dateString).format('DD-MM-YYYY');
  return dateMoment;
};

const loadMembersData = () => {
  curGroup.value.members.forEach((member) => {
    member.patient.identifiers.forEach((identifier) => {
      identifier.episodes.forEach((episode) => {
        if (isOnline.value) {
          patientVisitDetailsService.apiGetAllByEpisodeId(episode.id, 0, 500);
        }
      });
    });
  });
};

const removePatient = (member) => {
  const members = curGroup.value.members.filter((mb) => {
    return mb.patient.id !== member.patient.id;
  });
  curGroup.value.members = members;
};

const notMember = (patient) => {
  const exists = curGroup.value.members.some((mb) => {
    return mb.patient.id === patient.id;
  });
  return !exists;
};

const initNewMember = (patient) => {
  const member = new GroupMember({
    id: uuidv4(),
    startDate: getJSDateFromDDMMYYY(startDate.value),
    patient: patient,
    clinic: clinic,
  });
  return member;
};
const getJSDateFromDDMMYYY = (dateString) => {
  const dateParts = dateString.split('-');
  return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
};
const addPatient = (patient) => {
  showloading();
  const patientExists = curGroup.value.members.some((member) => {
    return member.patient.id === patient.id;
  });
  if (patientExists) {
    closeLoading();
    alertError(
      'O paciente selecionado ja se encontra associado a este grupo [' +
        curGroup.value.service.code +
        '].'
    );
  } else {
    if (!isOnline.value) {
      // Validar paciente antes de adicionar, se o ultimo episodio e' de inicio (deve ser de inicio)  //mudar Para mobile
      let lastEpisode = {};
      patient.identifiers.forEach((identifier) => {
        let episode = null;
        if (identifier.service.code === curGroup.value.service.code) {
          episode = episodeService.lastEpisode(identifier.id);
          identifier.episodes = [];
          identifier.episodes.push(episode);
          closeLoading();
          if (!identifier.episodes.length > 0) {
            alertError('O paciente selecionado não possui episódios.');
          } else if (!identifier.episodes[0].startStopReason.isStartReason) {
            alertError('O Último episódio do paciente não é de inicio');
          }
        }
      });
      if (patientVisitService.getAllFromPatient(patient.id).length === 0) {
        alertError(
          'error',
          'O paciente selecionado não possui visitas efectuadas.'
        );
      }
      if (isMemberOfGroupOnService(patient, curGroup.value.service.code)) {
        alertError(
          'O paciente selecionado ja se encontra associado a um grupo activo do serviço '
        );
      } else {
        curGroup.value.members.push(initNewMember(patient));
      }
      closeLoading();
    } else {
      groupService
        .apiValidateBeforeAdd(
          patient.id,
          curGroup.value.service.code,
          curGroup.value.dispenseType.code
        )
        .then((resp) => {
          if (resp.data === 'Accepted') {
            curGroup.value.members.push(initNewMember(patient));
          } else {
            alertError(resp.data);
          }
          closeLoading();
        });
    }
  }
};

const submitForm = () => {
  doSave();
};

const doSave = async () => {
  submitting.value = true;
  curGroupServiceRef.value.validate();
  curGroupCodeRef.value.validate();
  curGroupGroupTypeRef.value.validate();
  curGroupDispenseTypeRef.value.validate();
  curGroupNameRef.value.validate();
  creationDateRef.value.validate();
  if (
    !curGroupServiceRef.value.hasError &&
    !curGroupCodeRef.value.hasError &&
    !curGroupGroupTypeRef.value.hasError &&
    !curGroupNameRef.value.hasError &&
    !creationDateRef.value.hasError
  ) {
    if (curGroup.value.members.length === 0) {
      submitting.value = false;
      return alertError('Por favor adicione membros ao grupo antes de gravar.');
    }
    showloading();
    setTimeout(() => {
      closeLoading();
    }, 700);
    curGroup.value.startDate = getJSDateFromDDMMYYY(startDate.value);
    const groupToSend = new Group(JSON.parse(JSON.stringify(curGroup.value)));
    groupToSend.clinic = {};
    groupToSend.service = {};
    groupToSend.groupType = {};
    groupToSend.clinic.id = clinic.value.id;
    groupToSend.clinic_id = clinic.value.id;
    groupToSend.service.id = curGroup.value.service.id;
    groupToSend.service_id = curGroup.value.service.id;
    groupToSend.groupType.id = curGroup.value.groupType.id;
    groupToSend.groupType_id = curGroup.value.groupType.id;
    groupToSend.members.forEach((member) => {
      member.startDate = groupToSend.startDate;
      member.group_id = curGroup.value.id;
      const memberPatientId = member.patient.id;
      member.patient = {};
      member.clinic = {};
      member.group = {};
      member.patient.id = memberPatientId;
      member.patient_id = memberPatientId;
      member.clinic_id = groupToSend.clinic.id;
      member.clinic.id = clinic.value.id;
      member.group.id = groupToSend.id;
      member.syncStatus = 'R';
    });
    if (isCreateStep.value) {
      groupService
        .apiSave(groupToSend)
        .then((resp) => {
          submitting.value = false;
          loadMembersData();
          alertSucess('Operação efectuada com sucesso.');
          SessionStorage.set('selectedGroupId', curGroup.value.id);
          router.push('/group/panel');
        })
        .catch((error) => {
          submitting.value = false;
          const listErrors = [];
          console.log(error);
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response);
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
          }
          alertError('error', listErrors);
        });
    } else {
      groupToSend.packHeaders = [];
      groupService
        .apiUpdate(groupToSend)
        .then((resp) => {
          submitting.value = false;
          if (!isOnline.value) {
            getGroupMembers();
          } else {
            loadMemberInfoToShowByGroupId();
          }
          alertSucess('Operação efectuada com sucesso.');
          emit('close');
          SessionStorage.set('selectedGroupId', curGroup.value.id);
        })
        .catch((error) => {
          submitting.value = false;
          const listErrors = [];
          console.log(error);
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response);
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
          }
          alertError('error', listErrors);
        });
    }
  } else {
    submitting.value = false;
  }
};

const init = () => {
  curGroup.value = new Group({
    id: uuidv4(),
  });
};

onMounted(() => {
  //  init()
  getGroupForEdit();
  checkFieldForEditGroup();
});

watch(
  () => searchResults,
  (oldp, newp) => {
    if (oldp !== newp) {
      closeLoading();
    }
  }
);
</script>

<style>
.fixed-card-actions {
  position: sticky;
  bottom: 0;
  right: 0;
  width: 100%;
  z-index: 1;
}
</style>
