<template>
  <div>
    <q-expansion-item
      dense
      header-class="bg-grey-6 text-white text-bold vertical-middle q-pl-md"
      expand-icon-class="text-white"
      :default-opened="curIdentifier.service.code === 'TARV' || !website"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon color="white" name="medication" />
        </q-item-section>
        <q-item-section>
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code + ': ' + curIdentifier.value
          }}
          {{
            isPatientActiveGroupMember !== null &&
            isPatientActiveGroupMember !== undefined
              ? ' - [Paciente esta associado ao Grupo: ' +
                isPatientActiveGroupMember.groupType.description +
                ' - ' +
                isPatientActiveGroupMember.name +
                ']'
              : ''
          }}
        </q-item-section>
      </template>
      <div v-show="infoVisible">
        <EmptyList v-if="prescription === null || prescription === undefined"
          >Nenhuma Prescrição Adicionada para o serviço
          {{
            curIdentifier.service === null ||
            curIdentifier.service === undefined
              ? 'Sem Info'
              : curIdentifier.service.code
          }}</EmptyList
        >
        <q-card class="noRadius" v-else>
          <q-card-section class="row q-pa-none">
            <div class="col-5 bg-white q-pa-md">
              <div class="row">
                <div class="col text-grey-9 text-weight-medium">
                  Data da Prescrição:
                </div>
                <div class="col text-grey-8">
                  {{
                    prescription.prescriptionDate === null ||
                    prescription.prescriptionDate === undefined
                      ? 'Sem Info'
                      : formatDate(prescription.prescriptionDate)
                  }}
                </div>
                <div class="col text-grey-9 text-weight-medium">
                  Regime Terapêutico:
                </div>
                <div
                  v-if="prescription.prescriptionDetails !== null"
                  class="col text-grey-8"
                >
                  {{
                    prescription.prescriptionDetails.length > 0
                      ? prescription.prescriptionDetails[0]
                          .therapeuticRegimen === null ||
                        prescription.prescriptionDetails[0]
                          .therapeuticRegimen === undefined
                        ? 'Sem Info'
                        : prescription.prescriptionDetails[0].therapeuticRegimen
                            .description
                      : ''
                  }}
                </div>
              </div>
              <div
                v-if="
                  prescription.prescriptionDetails !== null &&
                  prescription.prescriptionDetails !== undefined &&
                  prescription.prescriptionDetails.length !== 0
                "
                class="row"
              >
                <div
                  v-if="
                    prescription.prescriptionDetails[0].therapeuticLine !==
                      null &&
                    prescription.prescriptionDetails[0].therapeuticLine !==
                      undefined
                  "
                  class="col text-grey-9 text-weight-medium"
                >
                  Linha Terapêutica:
                </div>
                <div
                  v-if="
                    prescription.prescriptionDetails[0].therapeuticLine !==
                      null &&
                    prescription.prescriptionDetails[0].therapeuticLine !==
                      undefined
                  "
                  class="col text-grey-8"
                >
                  {{
                    prescription.prescriptionDetails[0].therapeuticLine ===
                      null ||
                    prescription.prescriptionDetails[0].therapeuticLine ===
                      undefined
                      ? 'Sem Info'
                      : prescription.prescriptionDetails[0].therapeuticLine
                          .description
                  }}
                </div>
                <div class="col text-grey-10">Clínico:</div>
                <div
                  v-if="prescription.doctor !== null"
                  class="col text-grey-8"
                >
                  {{
                    prescription.doctor === null ||
                    prescription.doctor === undefined
                      ? 'Sem Info'
                      : prescription.doctor.fullName
                  }}
                </div>
              </div>
              <div
                v-if="
                  prescription !== null &&
                  prescription.prescriptionDetails !== undefined &&
                  prescription.prescriptionDetails.length !== 0
                "
                class="row"
              >
                <div class="col text-grey-9 text-weight-medium">
                  Tipo Dispensa:
                </div>
                <div
                  v-if="
                    prescription.prescriptionDetails[0].dispenseType !== null
                  "
                  class="col text-grey-8"
                >
                  {{
                    prescription.prescriptionDetails[0].dispenseType === null ||
                    prescription.prescriptionDetails[0].dispenseType ===
                      undefined
                      ? 'Sem Info'
                      : prescription.prescriptionDetails[0].dispenseType
                          .description
                  }}
                </div>
                <div class="col text-grey-9 text-weight-medium">Validade:</div>
                <div class="col" :class="validadeColor">
                  {{
                    prescription === null || prescription === undefined
                      ? 'Sem Info'
                      : remainigDuration(prescription)
                  }}
                  mes(es)
                </div>
              </div>
              <div class="row">
                <div class="col text-grey-9 text-weight-medium">Duração:</div>
                <div class="col text-grey-8">
                  {{
                    prescription === null ||
                    prescription === undefined ||
                    prescription.duration === null
                      ? 'Sem Info'
                      : prescription.duration.description
                  }}
                </div>
                <div class="col text-grey-9 text-weight-medium">
                  Tipo Paciente:
                </div>
                <div class="col text-grey-8">
                  {{
                    prescription === null ||
                    prescription === undefined ||
                    prescription.patientStatus === null
                      ? 'Sem Info'
                      : prescription.patientStatus
                  }}
                </div>
              </div>
              <div
                class="row"
                v-if="String(prescription?.clinic?.id) !== prescription.origin"
              >
                <div class="col text-grey-9 text-weight-medium">
                  <span> Origem da Prescrição:</span>
                </div>
                <div class="col text-grey-8 neon-text">
                  {{
                    prescription === null ||
                    prescription === undefined ||
                    prescription.origin === null
                      ? 'Sem Info'
                      : getOriginClinic
                  }}
                </div>
                <div class="col text-grey-8 neon-text"></div>
                <div class="col text-grey-8 neon-text"></div>
              </div>
              <q-separator />
              <div class="row q-my-md">
                <q-space />
                <q-btn
                  unelevated
                  color="blue"
                  label="Ver Detalhes"
                  @click="showPrescriptionDetailView"
                  class="float-right q-ml-sm"
                />
                <q-btn
                  v-if="canRemovePrescription && !isClosed"
                  unelevated
                  color="red"
                  label="Remover"
                  @click="removePrescription()"
                  class="float-right q-ml-sm"
                />
              </div>
            </div>
            <div class="col q-py-md">
              <q-banner
                dense
                inline-actions
                class="bg-primary text-white q-pa-none"
                v-if="prescription !== null"
              >
                <span class="text-bold text-subtitle1 vertical-middle q-pl-md">
                  <slot> Dispensa</slot>
                </span>

                <template v-slot:action>
                  <div class="q-gutter-x-md">
                    <q-btn
                      dense
                      flat
                      :loading="loadingFilaPDF"
                      color="white"
                      icon="print"
                      :label="
                        curIdentifier.service.code === 'TARV'
                          ? 'FILA'
                          : curIdentifier.service.code === 'TPT'
                          ? 'FILT'
                          : curIdentifier.service.code === 'PREP'
                          ? 'FILP'
                          : 'Ficha'
                      "
                      @click="printFilaReport(curIdentifier)"
                    />
                    <q-btn
                      v-if="
                        canAddPack &&
                        !isClosed &&
                        remainigDuration(prescription) > 0 &&
                        !isProvincialInstalation()
                      "
                      dense
                      flat
                      round
                      color="white"
                      icon="add"
                      class="float-right"
                      @click="editPrescriptionOption"
                    />
                  </div>
                </template>
              </q-banner>
              <EmptyList v-if="lastPackOnPrescription === null"
                >Nenhum registo de Levantamentos</EmptyList
              >
              <span v-else>
                <PackInfo />
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-expansion-item>
    <q-separator />
    <q-dialog persistent v-model="showPrescriptionDetails">
      <PrescriptionDetailsView />
    </q-dialog>
  </div>
</template>

<script setup>
import { date } from 'quasar';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import EmptyList from 'components/Shared/ListEmpty.vue';
import PackInfo from 'components/Patient/Prescription/PackInfo.vue';
import episodeService from 'src/services/api/episode/episodeService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import packService from 'src/services/api/pack/packService';
import filaReport from 'src/services/reports/Patients/filaReport';
import { useEpisode } from 'src/composables/episode/episodeMethods';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { usePrescription } from 'src/composables/prescription/prescriptionMethods';
import groupService from 'src/services/api/group/groupService';
import PrescriptionDetailsView from 'components/Patient/Prescription/PrescriptionDetailsView.vue';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import StockService from 'src/services/api/stockService/StockService';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import clinicService from 'src/services/api/clinicService/clinicService';
import pocPrescriptionLogService from 'src/services/api/pocPrescriptionLog/pocPrescriptionLogService';
import PermissionService from 'src/services/api/user/PermissionService';

//Declaration
const { website, isMobile, isOnline } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const { isProvincialInstalation } = useSystemConfig();
const { isCloseEpisode, isDCReferenceEpisode } = useEpisode();
const { alertSucess, alertError, alertInfo, alertWarningAction } = useSwal();
const { remainigDuration } = usePrescription();
const infoVisible = ref(true);
const loadingFilaPDF = reactive(ref(false));
const showPrescriptionDetails = ref(false);

//props
const props = defineProps(['identifierId']);

// Inject
const editPrescriptionOption = inject('editPrescriptionOption');
const patient = inject('patient');

//Hook
onMounted(() => {
  showloading();
  init();
  if (isMobile.value && !isOnline.value) {
    StockService.get(0);
  }
});
//Methods
const init = () => {
  groupMemberService.getPatientGroupByPatientId(patient.value.id);
  closeLoading();
};

const canRemovePrescription = computed(() => {
  if (isOnline.value) {
    return PermissionService.canPerformUiAction('prescription', 'remove');
  } else {
    return true;
  }
});

const canAddPack = computed(() => {
  if (isOnline.value) {
    return PermissionService.canPerformUiAction('prescription', 'add');
  } else {
    return true;
  }
});

const removePack = () => {
  showloading();
  let isPatientVisitRemoveble = true;
  if (
    patientVisit.value.tbScreenings.length > 0 ||
    patientVisit.value.pregnancyScreenings.length > 0 ||
    patientVisit.value.adherenceScreenings.length > 0 ||
    patientVisit.value.ramScreenings.length > 0 ||
    patientVisit.value.vitalSignsScreenings.length > 0
  ) {
    isPatientVisitRemoveble = false;
  }
  const patientVisitDetailsList =
    patientVisitDetailsService.getAllPatientVisitByPrescriptioId(
      lastPatientVisitDetails.value.prescription.id
    );
  alertWarningAction('Deseja remover a Dispensa?').then((result) => {
    if (result) {
      if (isPatientVisitRemoveble && patientVisitDetailsList.length <= 1) {
        let packIdToRemove = lastPatientVisitDetails.value.pack.id;
        let prescriptionToRemove =
          lastPatientVisitDetails.value.prescription.id;
        let countPatientVisitDetailsByPrescription =
          patientVisitDetailsService.getAllPatientVisitByPrescriptioId(
            prescriptionToRemove
          );
        patientVisitService
          .delete(patientVisit.value.id)
          .then(async (resp) => {
            packService.removeFromStorage(packIdToRemove);

            if (countPatientVisitDetailsByPrescription.length <= 1) {
              prescriptionService.removeFromStorage(prescriptionToRemove);
            }

            await patientVisitDetailsService.apiGetPatientVisitDetailsByPatientId(
              patient.value.id
            );

            closeLoading();
            console.log(resp);
            alertSucess('Dispensa removida com sucesso');
          })
          .catch((error) => {
            closeLoading();
            console.log(error);
            alertError('Aconteceu um erro ao remover a Dispensa');
          });
      } else {
        let packIdToRemove = lastPatientVisitDetails.value.pack.id;

        patientVisitDetailsService
          .delete(lastPatientVisitDetails.value.id)
          .then((resp) => {
            packService.removeFromStorage(packIdToRemove);

            closeLoading();
            console.log(resp);
            alertSucess('Dispensa removida com sucesso');
          })
          .catch((error) => {
            closeLoading();
            console.log(error);
            alertError('Aconteceu um erro ao remover a Dispensa');
          });
      }
    } else {
      closeLoading();
      alertInfo('Operação cancelada');
    }
  });
};
const removePrescription = async () => {
  showloading();
  if (lastPackOnPrescription.value !== null) {
    alertError(
      'Esta prescrição ja possui registo de dispensas associados, remova primeiro as dispensas.'
    );
    closeLoading();
  } else {
    alertWarningAction('Deseja remover a Prescrição?').then((result) => {
      if (result) {
        prescriptionService
          .delete(prescription.value.id)
          .then(async (resp) => {
            alertSucess('Prescrição removida com sucesso');
            await patientVisitDetailsService.apiGetPatientVisitDetailsByPatientId(
              patient.value.id
            );
            closeLoading();
            console.log(resp);
          })
          .catch((error) => {
            closeLoading();
            console.log(error);
            alertError('Aconteceu um erro ao gravar a Prescrição');
          });
      } else {
        closeLoading();
        alertInfo('Operação cancelada');
      }
    });
  }
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'DD-MM-YYYY');
};

const printFilaReport = async (patientServiceIdentifier) => {
  filaReport.downloadPDF(
    patient.value,
    patientServiceIdentifier,
    loadingFilaPDF
  );
};

// Computed
const curIdentifier = computed(() => {
  const patientIdentifiers = patient.value?.identifiers;
  if (Array.isArray(patientIdentifiers)) {
    const identifierFromPatient = patientIdentifiers.find(
      (identifier) => identifier?.id === props.identifierId
    );
    if (identifierFromPatient) {
      return identifierFromPatient;
    }
  }

  const identifier = patientServiceIdentifierService.identifierCurr(
    props.identifierId,
    ''
  );

  return (
    identifier ?? {
      service: null,
      value: '',
      episodes: [],
    }
  );
});

const validadeColor = computed(() => {
  if (prescription.value !== null && remainigDuration(prescription.value) > 0) {
    return 'text-primary';
  } else {
    // return 'text-red';
  }
});
const lastPackOnPrescription = computed(() => {
  if (prescription.value !== null) {
    /*
    return packService.getLastPackFromPatientVisitAndPrescription(
      prescription.value.id
    );
    */
    if (isMobile.value && lastPatientVisitDetails.value !== null) {
      console.log(lastPatientVisitDetails.value.pack);
      return lastPatientVisitDetails.value.pack;
    }
  } else {
    return null;
  }
});

const lastLog = computed(() => {
  if (!curIdentifier.value?.service?.id) {
    return null;
  }
  return pocPrescriptionLogService.getLastPrescriptionLogByPatientIdAndClinicalServiceId(
    patient.value.id,
    curIdentifier.value.service.id
  );
});

const prescription = computed(() => {
  if (lastLog.value && lastLog.value.prescription) {
    return lastLog.value.prescription;
  }
  if (lastPatientVisitDetails.value !== null) {
    /*
    return prescriptionService.getLastPrescriptionFromPatientVisitDetails(
      lastPatientVisitDetails.value.prescription.id
    );
    */
    if (isMobile.value && lastPatientVisitDetails.value !== null) {
      console.log(lastPatientVisitDetails.value.prescription);
      return lastPatientVisitDetails.value.prescription;
    }
  } else {
    return null;
  }
});

const patientVisit = computed(() => {
  const listPatietVisitIds = [];
  /*
  if (lastStartEpisode.value !== null && lastStartEpisode.value !== undefined) {
    const listPatietVisitDetails =
      patientVisitDetailsService.getAllPatientVisitDetailsFromEpisode(
        lastStartEpisode.value.id
      );

    if (
      listPatietVisitDetails !== null &&
      listPatietVisitDetails !== undefined
    ) {
      listPatietVisitDetails.forEach((patientvisitdetails) => {
        listPatietVisitIds.push(patientvisitdetails.patient_visit_id);
      });
    }
    return patientVisitService.getLastFromPatientVisitList(listPatietVisitIds);
  } else {
    if (
      lastRefferedEpisode.value !== null &&
      lastRefferedEpisode.value !== undefined
    ) {
      const listPatietVisitDetails =
        patientVisitDetailsService.getAllPatientVisitDetailsFromEpisode(
          lastRefferedEpisode.value.id
        );

      if (
        listPatietVisitDetails !== null &&
        listPatietVisitDetails !== undefined
      ) {
        listPatietVisitDetails.forEach((patientvisitdetails) => {
          listPatietVisitIds.push(patientvisitdetails.patient_visit_id);
        });
      }
      return patientVisitService.getLastFromPatientVisitList(
        listPatietVisitIds
      );
    } else return null;
  }
     */
  if (
    isMobile.value &&
    lastStartEpisode.value !== null &&
    lastStartEpisode.value !== undefined
  ) {
    console.log(patient.value);
    const matchingVisits = patient.value.patientVisits.filter((visit) => {
      if (
        !visit.patientVisitDetails ||
        !Array.isArray(visit.patientVisitDetails)
      ) {
        return false;
      }

      // Check if any detail in this visit matches the episode ID
      return visit.patientVisitDetails.some((detail) => {
        const detailEpisodeId = String(
          detail?.episode?.id ?? detail?.episodeId ?? ''
        )
          .trim()
          .toLowerCase();
        return detailEpisodeId === lastStartEpisode.value.id;
      });
    });

    // If no matches found
    if (matchingVisits.length === 0) {
      return null;
    }
    matchingVisits.sort((a, b) => {
      const dateA = a?.visitDate ?? '';
      const dateB = b?.visitDate ?? '';
      return String(dateB).localeCompare(String(dateA));
    });
    console.log(matchingVisits[0]);
    return matchingVisits[0];
  }
});

const lastPatientVisitDetails = computed(() => {
  if (patientVisit.value !== null && patientVisit.value !== undefined) {
    if (
      isMobile.value &&
      lastStartEpisode.value !== null &&
      lastStartEpisode.value !== undefined
    ) {
      console.log(patientVisit.value);
      return patientVisit.value.patientVisitDetails[0];
    } else {
      return patientVisitDetailsService.getLastPatientVisitDetailFromPatientVisitAndEpisode(
        patientVisit.value.id,
        lastRefferedEpisode.value.id
      );
    }
  } else {
    return null;
  }
});

const lastStartEpisode = computed(() => {
  if (curIdentifier.value?.id) {
    return episodeService.getLastStartEpisodeWithPrescription(
      curIdentifier.value.id
    );
  } else {
    return null;
  }
});

const lastRefferedEpisode = computed(() => {
  if (curIdentifier.value?.id) {
    return episodeService.getLastRefferedEpisodeWithPrescription(
      curIdentifier.value.id
    );
  } else {
    return null;
  }
});

const lastEpisode = computed(() => {
  if (curIdentifier.value?.id) {
    return episodeService.lastEpisodeByIdentifier(curIdentifier.value.id);
  } else {
    return [];
  }
});
const showEndDetails = computed(() => {
  return (
    lastEpisode.value !== null &&
    isCloseEpisode(lastEpisode.value) &&
    !isDCReferenceEpisode(lastEpisode.value)
  );
});

const isClosed = computed(() => {
  return showEndDetails.value;
});

const isPatientActiveGroupMember = computed(() => {
  if (!curIdentifier.value?.service?.id) {
    return null;
  }
  return groupService.getGroupByPatientAndService(
    patient.value.id,
    curIdentifier.value.service.id
  );
});

const getOriginClinic = computed(() => {
  const clinic = clinicService.getById(prescription.value.origin);
  return clinic?.clinicName;
});

const showPrescriptionDetailView = () => {
  showPrescriptionDetails.value = true;
};

//Provide
provide('lastPackOnPrescription', lastPackOnPrescription);
provide('isClosed', isClosed);
provide('removePack', removePack);
provide('curIdentifier', curIdentifier);
provide('prescription', prescription);
provide('showPrescriptionDetails', showPrescriptionDetails);
provide('validadeColor', validadeColor);
</script>

<style>
.noRadius {
  border-radius: 0px;
}
.item {
  position: relative;
  padding-top: 5px;
  /* display: inline-block; */
}
.notify-badge {
  /* position: absolute; */
  right: -20px;
  top: -10px;
  background: red;
  text-align: center;
  border-radius: 30px 30px 30px 30px;
  color: white;
  padding: 5px 8px;
  font-size: 10px;
}
.neon-text {
  font-size: 1rem;
  color: #ffff;
  text-shadow: 0 0 5px #0059ff, 0 0 10px #0059ff, 0 0 20px #0059ff,
    0 0 40px #0059ff, 0 0 80px #0059ff;
  animation: glow 1.5s infinite alternate;
}
@keyframes glow {
  0% {
    text-shadow: 0 0 5px #0059ff, 0 0 10px #0059ff, 0 0 20px #0059ff,
      0 0 40px #0059ff, 0 0 80px #0059ff;
  }
  100% {
    text-shadow: 0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff,
      0 0 80px #00d4ff, 0 0 160px #00d4ff;
  }
}
</style>
