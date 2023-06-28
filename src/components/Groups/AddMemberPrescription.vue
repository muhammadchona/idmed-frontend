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
              @click="showAddPrescription = false"
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
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import GroupMemberPrescription from 'src/stores/models/group/GroupMemberPrescription';
import { v4 as uuidv4 } from 'uuid';
// Declaration
const {
  idadeCalculator,
  getDDMMYYYFromJSDate,
  getDateFromHyphenDDMMYYYY,
  getYYYYMMDDFromJSDate,
} = useDateUtils();
const { preferedIdentifierValue, fullName } = usePatient();
const { alertSucess, alertError, alertInfo } = useSwal();
const { website, isDeskTop, isMobile } = useSystemUtils();
const mds = ref('US_');
const dispenseMode = ref();
const selected_model = ref([]);
const submitting = ref(false);
const curPatientVisit = ref(new PatientVisit());

//Inject
const patient = inject('patient');
const isNewPrescription = inject('isNewPrescription');
const showAddPrescription = inject('showAddPrescription');
const getGroupMembers = inject('getGroupMembers');
const selectedMember = inject('selectedMember');

//Hook
onMounted(() => {
  console.log(isNewPrescription.value);
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
  getGroupMembers(true);
};

const doValidationToDispense = () => {
  submitting.value = true;
  console.log('Entra para criar a prescricao para o membro');
  console.log(selectedMember);
  console.log(curPatientVisit.value.patientVisitDetails[0].prescription);

  const memberPrescription = new GroupMemberPrescription({
    id: uuidv4(),
    prescription: curPatientVisit.value.patientVisitDetails[0].prescription,
    member: selectedMember.value,
    used: false,
  });
  console.log(memberPrescription);
  memberPrescription.member.group.clinic = memberPrescription.member.clinic;
  memberPrescription.member.group.service.drugs = [];
  memberPrescription.member.group.service.attributes = [];
  memberPrescription.member.patient.identifiers = [];
  memberPrescription.member.group.members = [];
  memberPrescription.member.patient.district =
    memberPrescription.member.clinic.district;
  memberPrescription.prescription.prescribedDrugs.forEach((pd) => {
    pd.drug.therapeuticRegimenList = [];
    pd.drug.packaged_drugs = [];
  });
  //  memberPrescription.member.patient = patient
  //  memberPrescription.prescription.doctor = Doctor.query().with(['clinic.province', 'clinic.district.province', 'clinic.facilityType']).where('id', memberPrescription.prescription.doctor.id).first()
  /*
        memberPrescription.prescription.prescriptionDetails[0].therapeuticRegimen = TherapeuticRegimen.query()
                                                                                                        .with('clinicalService.identifierType')
                                                                                                        .has('code')
                                                                                                        .where('active', true)
                                                                                                        .where('id', memberPrescription.prescription.prescriptionDetails[0].therapeuticRegimen.id)
                                                                                                        .first()
                                                                                                        */
  if (isMobile.value) {
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
      memberPrescription.prescription.prescriptionDetails[0].therapeuticRegimen.id;
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
    // memberPrescription.member_id = SessionStorage.getItem('selectedMember').id
    // memberPrescription.prescription_id = this.curPatientVisitDetails[0].prescription.id
    memberPrescription.syncStatus = 'R';
  }
  console.log(memberPrescription.prescription.leftDuration);
  console.log(memberPrescription);
  groupMemberPrescriptionService
    .apiSave(memberPrescription)
    .then((resp1) => {
      executeGetGroupMembers();
      alertSucess('Prescricao gravada com sucesso');
      submitting.value = false;
      showAddPrescription.value = false;
      // this.$emit('getGroupMembers', true)
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
  //   }
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
// .q-expansion-item--expanded {
//   // border: 1px solid #000000;
//   // border-color: coral;
//   background-color: coral;
// }
</style>
