<template>
  <q-card style="width: 1350px; max-width: 110vw">
    <q-card-section style="max-height: 50vh" class="q-pa-none bg-green-2">
      <div class="row items-center text-subtitle1 q-pa-md">
        <q-icon
          :name="patient.gender == 'Feminino' ? 'female' : 'male'"
          size="md"
          color="primary"
        />
        <div class="text-bold text-grey-10 q-ml-sm">
          {{ fullName(patient) }}
        </div>
        <div class="text-grey-10 q-ml-sm">
          <span class="text-bold text-h6">|</span> {{ patient.gender }}
        </div>
        <div
          class="text-grey-10 q-ml-sm"
          v-if="
            idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) <= 14
          "
        >
          <span class="text-bold text-h6">
            | <q-icon name="child_care" />
          </span>
          {{ idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) }}
          Ano(s) de Idade
        </div>
        <div class="text-grey-10 q-ml-sm" v-else>
          <span class="text-bold text-h6">|</span>
          {{ idadeCalculator(getDDMMYYYFromJSDate(patient.dateOfBirth)) }}
          Anos de Idade
        </div>
      </div>
      <q-separator />
    </q-card-section>
    <q-scroll-area style="height: 800px" class="q-pr-md">
      <q-card-section>
        <q-list bordered>
          <q-expansion-item
            v-for="identifier in patient.identifiers"
            :key="identifier.id"
            group="somegroup"
            dense
            :label="
              'Prescrição ' +
              identifier.service.code +
              ' - ' +
              identifier.identifierType.code +
              ': ' +
              identifier.value
            "
            :default-opened="identifier.service.code === 'TARV'"
            :header-class="
              selected_model[identifier.service.code]
                ? 'bg-amber-9 text-white text-bold text-subtitle1 vertical-middle q-pl-md'
                : 'bg-primary text-white text-bold text-subtitle1 vertical-middle q-pl-md'
            "
            expand-icon-class="text-white"
            v-model="selected_model[identifier.service.code]"
          >
            <q-card>
              <q-card-section>
                <ListHeader bgColor="bg-grey-6"
                  >Informação da Prescrição
                </ListHeader>
                <add-edit-prescription-unit :identifier="identifier" />
              </q-card-section>
            </q-card>
            <q-separator />
          </q-expansion-item>
        </q-list>
      </q-card-section>
      <q-card-actions>
        <div class="row q-mt-xl q-pt-md">
          <span
            class="text-right absolute-bottom q-mb-lg q-mr-md q-mt-xl no-pointer-events"
          >
            <q-btn
              label="Cancelar"
              color="red"
              class="all-pointer-events"
              @click="loadedPrescriptionInfo = false"
            />
            <q-btn
              :label="dispenseLabel"
              loader
              :disable="curPatientVisit.patientVisitDetails.length === 0"
              :loading="submitting"
              @click="doValidationToDispense()"
              color="primary"
              class="q-ml-md all-pointer-events"
            >
            </q-btn>
          </span>
        </div>
      </q-card-actions>
    </q-scroll-area>
  </q-card>
</template>

<script setup>
import { computed, inject, onMounted, provide, ref } from 'vue';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { usePatient } from 'src/composables/patient/patientMethods';
import addEditPrescriptionUnit from 'src/components/Patient/PatientPanel/AddEditPrescriptionUnit.vue';
import ListHeader from 'src/components/Shared/ListHeader.vue';
import PatientVisit from 'src/stores/models/patientVisit/PatientVisit';
import moment from 'moment';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import GroupMemberPrescription from 'src/stores/models/group/GroupMemberPrescription';
import { v4 as uuidv4 } from 'uuid';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
// Declaration
const {
  idadeCalculator,
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
} = useDateUtils();
const { preferedIdentifierValue, fullName } = usePatient();
const { alertSucess, alertError, alertInfo } = useSwal();
const mds = ref('US_');
const selected_model = ref([]);
const submitting = ref(false);
const curPatientVisit = ref(
  new PatientVisit({
    id: uuidv4(),
  })
);
const { isOnline } = useSystemUtils();

//Inject
const patient = inject('patient');
const isNewPrescription = inject('isNewPrescription');
const showAddPrescription = inject('showAddPrescription');
const loadMemberInfoToShowByGroupId = inject('loadMemberInfoToShowByGroupId');
const selectedMember = inject('selectedMember');
const loadedPrescriptionInfo = inject('loadedPrescriptionInfo');
const getGroupMembers = inject('getGroupMembers');
//Hook
onMounted(() => {
  init();
});

const dispenseLabel = computed(() => {
  return 'Gravar';
});
// Methods

const init = () => {
  if (isNewPrescription) {
    curPatientVisit.value.visitDate = getYYYYMMDDFromJSDate(moment());
    curPatientVisit.value.clinic = patient.value.clinic;
    curPatientVisit.value.clinic_id = patient.value.clinic_id;
    curPatientVisit.value.patient = patient.value;
    curPatientVisit.value.patient_id = patient.value.id;
    curPatientVisit.value.patientVisitDetails = [];
  }
};

const executeGetGroupMembers = () => {
  if (!isOnline.value) {
    getGroupMembers(true);
  } else {
    loadMemberInfoToShowByGroupId();
  }
};

const doValidationToDispense = () => {
  submitting.value = true;
  selectedMember.value.groupMemberPrescriptions = [];
  const memberPrescription = new GroupMemberPrescription({
    id: uuidv4(),
    prescription: curPatientVisit.value.patientVisitDetails[0].prescription,
    member: selectedMember.value,
    used: false,
  });


  const groupId = memberPrescription.member.group.id;
  const patientId = memberPrescription.member.patient.id;
  memberPrescription.member.group = {};
  memberPrescription.member.group.id = groupId;
  memberPrescription.member.group_id = groupId;
  memberPrescription.member.clinic = {};
  memberPrescription.member.clinic.id = patient.value.clinic.id;
  memberPrescription.member.clinic_id = patient.value.clinic.id;
  memberPrescription.member.patient = {};
  memberPrescription.member.patient.id = patientId;

  const doctorId = memberPrescription.prescription.doctor.id;
  memberPrescription.prescription.doctor = {};
  memberPrescription.prescription.doctor.id = doctorId;
  memberPrescription.prescription.doctor_id = doctorId;
  memberPrescription.prescription.clinic = {};
  memberPrescription.prescription.clinic.id =
    memberPrescription.member.clinic.id;
  memberPrescription.prescription.clinic_id =
    memberPrescription.member.clinic.id;
  const durationId = memberPrescription.prescription.duration.id;
  memberPrescription.prescription.duration = {};
  memberPrescription.prescription.duration.id = durationId;
  memberPrescription.prescription.duration_id = durationId;
  memberPrescription.prescription.prescribedDrugs.forEach((pd) => {
    const drugId = pd.drug.id;
    pd.drug = {};
    pd.drug.id = drugId;
    pd.drug.therapeuticRegimenList = [];
    pd.drug.packaged_drugs = [];
  });
  const therapeuticalRegimenId =
    memberPrescription.prescription.prescriptionDetails[0].therapeuticRegimen
      .id;
  memberPrescription.prescription.prescriptionDetails[0].therapeuticRegimen =
    {};
  memberPrescription.prescription.prescriptionDetails[0].therapeuticRegimen.id =
    therapeuticalRegimenId;
  if (!isOnline.value) {
    memberPrescription.prescription.doctor_id =
      memberPrescription.prescription.doctor.id;
    memberPrescription.prescription.clinic_id =
      memberPrescription.prescription.clinic.id;
    memberPrescription.prescription.duration_id =
      memberPrescription.prescription.duration.id;
    memberPrescription.prescription.prescriptionDetails[0].prescription_id =
      memberPrescription.prescription.id;
    memberPrescription.prescription.prescriptionDetails[0].therapeutic_line_id =
      memberPrescription.prescription.prescriptionDetails[0].therapeuticLine.id;
    memberPrescription.prescription.prescriptionDetails[0].therapeutic_regimen_id =
      therapeuticalRegimenId;
    memberPrescription.prescription.prescriptionDetails[0].dispense_type_id =
      memberPrescription.prescription.prescriptionDetails[0].dispenseType.id;
    if (
      memberPrescription.prescription.prescriptionDetails[0]
        .spetialPrescriptionMotive !== null
    ) {
      memberPrescription.prescription.prescriptionDetails[0].spetialPrescriptionMotive_id =
        memberPrescription.prescription.prescriptionDetails[0].spetialPrescriptionMotive.id;
    }
    memberPrescription.prescription.prescribedDrugs.forEach((pDrug) => {
      pDrug.prescription_id = memberPrescription.prescription.id;
      pDrug.drug_id = pDrug.drug.id;
    });
    memberPrescription.syncStatus = 'R';
  }
  selectedMember.value.groupMemberPrescriptions[0] = memberPrescription;
  groupMemberPrescriptionService
    .apiSave(memberPrescription)
    .then((resp1) => {
      selectedMember.value.groupMemberPrescriptions[0] = memberPrescription;
      console.log(selectedMember.value.groupMemberPrescription);
      executeGetGroupMembers();
      alertSucess('Prescrição gravada com sucesso');
      submitting.value = false;
      loadedPrescriptionInfo.value = false;
    })
    .catch((error) => {
      selectedMember.value.groupMemberPrescriptions[0] = null;
      submitting.value = false;
      alertError('Ocorreu um erro ao gravar o prescrição do Membro');
    });
};

provide('curPatientVisit', curPatientVisit);
provide('selectedMember', selectedMember);
</script>

<style lang="scss">
.prescription-box {
  border: 1px solid $grey-4;
}
.box-border {
  border: 1px solid $grey-4;
}

</style>
