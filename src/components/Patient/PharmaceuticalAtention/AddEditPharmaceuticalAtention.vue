<template>
  <q-card style="max-width: 100vw">
    <form @submit.prevent="submitMobilizer">
      <q-card-section class="q-pa-none bg-green-2">
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
          <div class="text-grey-10 q-ml-sm" v-if="age(patient) <= 14">
            <span class="text-bold text-h6">
              | <q-icon name="child_care" />
            </span>
            {{ age(patient) }} Ano(s) de Idade
          </div>
          <div class="text-grey-10 q-ml-sm" v-else>
            <span class="text-bold text-h6">|</span> {{ age(patient) }} Anos de
            Idade
          </div>
        </div>
        <q-separator />
      </q-card-section>
      <div class="text-center text-h6 q-mt-sm">Atenção Farmacêutica</div>
      <q-scroll-area
        :thumb-style="thumbStyle"
        :content-style="contentStyle"
        :content-active-style="contentActiveStyle"
        style="height: 600px; width: 1200px"
        class="q-pr-md"
      >
        <div class="text-left text-h7 bold q-ml-sm q-pa-md q-my-lg">
          <q-input
            dense
            outlined
            style="width: 350px"
            v-model="visitDate"
            ref="dataRef"
            :disable="editMode"
            label="Data da Consulta"
          >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy
                  ref="qDateProxy"
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="visitDate"
                    :options="optionsNonFutureDate"
                    mask="DD-MM-YYYY"
                    @update:model-value="verifyHasSameDay()"
                  >
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="q-mx-lg">
          <q-stepper
            v-model="screeningStep"
            ref="stepper"
            header-class="text-bold bg-grey-3"
            color="primary"
            active-color="orange-7"
            animated
          >
            <q-step
              :name="1"
              title="Dados Vitais"
              icon="show_chart"
              :done="screeningStep > 1"
            >
              <div class="row q-mt-md">
                <q-input
                  outlined
                  class="col"
                  dense
                  v-model="vitalSignsScreening.height"
                  label="Altura *"
                  mask="#.##"
                  :disable="onlyView"
                  suffix="[Metros]"
                  ref="heightRef"
                  :rules="[
                    (val) => !!val || 'Por favor indicar a altura',
                    (val) =>
                      (Number(val) > 0 && Number(val) < Number(4)) ||
                      'A altura indicado não é vádlido',
                  ]"
                  @update:model-value="getImcValue()"
                />
                <q-input
                  outlined
                  class="col q-ml-md"
                  dense
                  v-model="vitalSignsScreening.weight"
                  type="number"
                  label="Peso *"
                  :rules="[
                    (val) => !!val || 'Por favor indicar o peso',
                    (val) =>
                      (Number(val) > 0 && Number(val) < Number(500)) ||
                      'O peso indicado não é vádlido',
                  ]"
                  suffix="[Kg]"
                  :disable="onlyView"
                  ref="weightRef"
                  @update:model-value="getImcValue()"
                />
              </div>
              <div class="row q-mt-md">
                <q-input
                  outlined
                  class="col"
                  dense
                  type="number"
                  v-model="vitalSignsScreening.imc"
                  label="IMC *"
                  filled
                  disable
                  ref="imcRef"
                />
                <TextInput
                  dense
                  v-model="imcDescription"
                  class="col q-ml-md"
                  filled
                  label="IMC-Descricao"
                  disable
                />
              </div>
              <div class="row q-mt-md">
                <q-input
                  outlined
                  class="col"
                  dense
                  v-model="vitalSignsScreening.systole"
                  mask="###"
                  label="Sistole *"
                  :disable="onlyView"
                  suffix="[mmHg]"
                  ref="systoleRef"
                  :rules="[
                    (val) => !!val || 'Por favor indicar a systole',
                    (val) =>
                      Number(val) > 0 ||
                      'O valor da sístole indicado não é vádlido',
                  ]"
                />
                <q-input
                  outlined
                  class="col q-ml-md"
                  dense
                  v-model="vitalSignsScreening.distort"
                  mask="###"
                  label="Diastole *"
                  suffix="[mmHg]"
                  :disable="onlyView"
                  ref="distortRef"
                  :rules="[
                    (val) => !!val || 'Por favor indicar a diástole',
                    (val) =>
                      Number(val) > 0 ||
                      'O valor da diástole indicado não é vádlido',
                  ]"
                />
              </div>
            </q-step>

            <q-step
              :name="2"
              title="Rastreio de Tuberculose"
              icon="show_chart"
              :done="screeningStep > 2"
            >
              <tbTable />
            </q-step>

            <q-step
              :name="3"
              title="Rastreio de Gravidez"
              v-if="patient.gender === 'Feminino'"
              icon="show_chart"
              :done="screeningStep > 3"
            >
              <pregnancyTable />
            </q-step>

            <q-step
              :name="4"
              title="Monitoria e Reforço à Adesão"
              icon="show_chart"
              :done="screeningStep > 4"
            >
              <adherenceTable />
            </q-step>

            <q-step :name="5" title="Reações Adversas" icon="show_chart">
              <ramTable :isNewRender="true" />
            </q-step>
          </q-stepper>
        </div>
      </q-scroll-area>
      <q-card-actions align="right" class="q-my-md">
        <q-stepper-navigation>
          <q-btn label="Cancelar" color="red" @click="closeButtonActions()" />
          <q-btn
            v-if="screeningStep > 1"
            color="primary"
            @click="$refs.stepper.previous()"
            label="Voltar"
            class="q-ml-sm"
          />
          <q-btn
            @click="goToNextStep"
            color="primary"
            :loading="submitLoading"
            :label="screeningStep === 5 ? 'Submeter' : 'Proximo'"
            class="q-ml-sm"
          />
        </q-stepper-navigation>
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
// import { SessionStorage } from 'quasar';
import PatientVisit from '../../../stores/models/patientVisit/PatientVisit';
import { computed, inject, onMounted, provide, reactive, ref } from 'vue';
import VitalSignsScreening from '../../../stores/models/screening/VitalSignsScreening';
import TBScreening from '../../../stores/models/screening/TBScreening';
import PregnancyScreening from '../../../stores/models/screening/PregnancyScreening';
import AdherenceScreening from '../../../stores/models/screening/AdherenceScreening';
import RAMScreening from '../../../stores/models/screening/RAMScreening';
import TextInput from 'components/Shared/Input/TextField.vue';
import tbTable from 'components/Patient/PharmaceuticalAtention/TbQuestionsTable.vue';
import pregnancyTable from 'components/Patient/PharmaceuticalAtention/PregnancyQuestionsTable.vue';
import adherenceTable from 'components/Patient/PharmaceuticalAtention/MonitoringReinforcementAdherinTable.vue';
import ramTable from 'components/Patient/PharmaceuticalAtention/AdverseReactionQuestiosTable.vue';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { usePatient } from 'src/composables/patient/patientMethods';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';

const { alertSucess, alertError, alertInfo } = useSwal();
const { age, fullName, hasIdentifiers, getOldestIdentifier, isMale } =
  usePatient();
const { getDDMMYYYFromJSDate, getJSDateFromDDMMYYY } = useDateUtils();
const patientVisit = ref(new PatientVisit());
const vitalSignsScreening = reactive(ref(new VitalSignsScreening()));
const tBScreening = reactive(ref(new TBScreening()));
const pregnancyScreening = reactive(ref(new PregnancyScreening()));
const adherenceScreening = reactive(ref(new AdherenceScreening()));
const rAMScreening = reactive(ref(new RAMScreening()));
const screeningStep = ref(ref(1));
const visitDate = ref('');
const stepper = ref();
const heightRef = ref('');
const weightRef = ref('');
const systoleRef = ref('');
const distortRef = ref('');
const submitLoading = ref(false);
const hasVisitSameDay = ref(false);
const contentStyle = ref({
  backgroundColor: '#ffffff',
  color: '#555',
});

const contentActiveStyle = ref({
  backgroundColor: '#eee',
  color: 'black',
});

const thumbStyle = ref({
  right: '2px',
  borderRadius: '5px',
  backgroundColor: '#0ba58b',
  width: '5px',
  opacity: 0.75,
});

// Inject
const editPatientVisit = inject('showPatientVisit');
const editMode = inject('editMode');
const patient = inject('patient');
const closeButtonActions = inject('closeButtonActions');

// Hook
onMounted(() => {
  if (editMode.value) {
    patientVisit.value = editPatientVisit.value;
    visitDate.value = getDDMMYYYFromJSDate(editPatientVisit.value.visitDate);
    vitalSignsScreening.value = editPatientVisit.value.vitalSignsScreenings[0];
    tBScreening.value = editPatientVisit.value.tbScreenings[0];
    pregnancyScreening.value = !isMale(patient.value)
      ? editPatientVisit.value.pregnancyScreenings[0]
      : [];
    adherenceScreening.value = editPatientVisit.value.adherenceScreenings[0];
    rAMScreening.value = editPatientVisit.value.ramScreenings[0];
    vitalSignsScreening.value.visit = null;
    tBScreening.value.visit = null;
    pregnancyScreening.value.visit = null;
    rAMScreening.value.visit = null;
    adherenceScreening.value.visit = null;
    // changeToEditStep();
  } else {
    visitDate.value = getDDMMYYYFromJSDate(moment());
    //   changeToCreateStep();
  }
});
// Computed
const imcDescription = computed(() => {
  let imcDesc = '';
  const imc = vitalSignsScreening.value.imc;

  if (imc === null || imc === undefined || String(imc).length === 0) {
    imcDesc = '';
  } else if (imc <= Number(16.9)) {
    imcDesc = 'Muito abaixo do peso';
  } else if (imc >= Number(17) && imc <= Number(18.4)) {
    imcDesc = 'Abaixo do peso';
  } else if (imc >= Number(18.5) && imc <= Number(24.9)) {
    imcDesc = 'Peso normal';
  } else if (imc >= Number(25) && imc <= Number(29.9)) {
    imcDesc = 'Acima do peso';
  } else if (imc >= Number(30) && imc <= Number(34.9)) {
    imcDesc = 'Obesidade Grau I';
  } else if (imc >= Number(35) && imc <= Number(39.9)) {
    imcDesc = 'Obesidade Grau II';
  } else if (imc >= Number(40)) {
    imcDesc = 'Obesidade Mórbida';
  }
  return imcDesc;
});

//Methods
const optionsNonFutureDate = (date) => {
  return date <= moment().format('YYYY/MM/DD');
};
const desableSubmitting = () => {
  submitLoading.value = false;
};
const goToNextStep = async () => {
  submitLoading.value = true;
  if (screeningStep.value === 1) {
    heightRef.value.validate();
    weightRef.value.validate();
    systoleRef.value.validate();
    distortRef.value.validate();
    //  dataRef.validate()
    if (visitDate.value === '') {
      alertError('Por Favor Preencha data de consulta');
      desableSubmitting();
    } else if (
      getJSDateFromDDMMYYY(visitDate.value).setHours(0, 0, 0, 0) <
      new Date(patient.value.dateOfBirth).setHours(0, 0, 0, 0)
    ) {
      alertError(
        'A data de consulta indicada é maior que a data de nascimento do paciente/utente'
      );
      desableSubmitting();
    } else if (
      hasIdentifiers(patient.value) &&
      new Date(getOldestIdentifier(patient.value).startDate).setHours(
        0,
        0,
        0,
        0
      ) > getJSDateFromDDMMYYY(visitDate.value).setHours(0, 0, 0, 0)
    ) {
      alertError(
        'A data da consulta indicada é maior que a data da admissão ao serviço se saúde [ ' +
          getOldestIdentifier(patient.value).service.code +
          ' ]'
      );
      desableSubmitting();
    } else if (hasVisitSameDay.value && !editMode.value) {
      alertError(
        'Já Existe uma Atenção farmcêutica nessa data .Por Favor use a funcionalidade editar'
      );
      desableSubmitting();
    } else if (vitalSignsScreening.value.height <= 0) {
      alertError('Por favor indique uma altura maior que zero ');
      desableSubmitting();
    } else if (vitalSignsScreening.value.weight <= 0) {
      alertError('Por favor indique um peso maior que zero ');
      desableSubmitting();
    } else if (
      vitalSignsScreening.value.systole <= 0 ||
      vitalSignsScreening.value.distort <= 0
    ) {
      alertError('Por favor indique um sistole ou diastole maior que zero ');
      desableSubmitting();
    } else if (
      !heightRef.value.hasError &&
      !weightRef.value.hasError &&
      !systoleRef.value.hasError &&
      !distortRef.value.hasError
    ) {
      stepper.value.next();
      desableSubmitting();
    } else {
      desableSubmitting();
    }
    desableSubmitting();
  } else if (screeningStep.value === 2) {
    if (
      tBScreening.value.treatmentTB === 'true' &&
      tBScreening.value.startTreatmentDate === ''
    ) {
      alertError(
        'Deve Preencher a Data de inicio de Tratamento uma vez que esta em Tratamento TB.'
      );
    } else if (
      tBScreening.value.startTreatmentDate &&
      new Date(tBScreening.value.startTreatmentDate) > new Date()
    ) {
      alertError(
        'A Data de inicio de Tratamento indicada é maior que a data da corrente.'
      );
    } else if (patient.value.gender === 'Masculino') {
      stepper.value.goTo(4);
      desableSubmitting();
    } else {
      stepper.value.next();
      desableSubmitting();
    }
  } else if (screeningStep.value === 3) {
    if (
      pregnancyScreening.value.pregnant === 'false' &&
      pregnancyScreening.value.lastMenstruation === ''
    ) {
      alertError('Deve Preencher a Data da Ultima Menstruação.');
    } else if (
      pregnancyScreening.value.lastMenstruation &&
      new Date(pregnancyScreening.value.lastMenstruation) > new Date()
    ) {
      alertError(
        'A Data da Ultima Menstruação indicada é maior que a data da corrente.'
      );
    } else {
      stepper.value.next();
      desableSubmitting();
    }
  } else if (screeningStep.value === 4) {
    if (
      (adherenceScreening.value.hasPatientCameCorrectDate === 'false' &&
        adherenceScreening.value.daysWithoutMedicine === '') ||
      (adherenceScreening.value.hasPatientCameCorrectDate === 'false' &&
        adherenceScreening.value.daysWithoutMedicine <= 0)
    ) {
      alertError(
        'Por Favor Indique quantos dias de atraso completou o paciente'
      );
      desableSubmitting();
    } else if (
      (adherenceScreening.value.patientForgotMedicine === 'true' &&
        adherenceScreening.value.lateDays === '') ||
      (adherenceScreening.value.patientForgotMedicine === 'true' &&
        adherenceScreening.value.lateDays <= 0)
    ) {
      alertError(
        'Por Favor Indique quantos dias passou da hora sem tomar os Medicamentos'
      );
      desableSubmitting();
    } else {
      stepper.value.next();
      desableSubmitting();
    }
  } else if (screeningStep.value === 5) {
    if (
      rAMScreening.value.adverseReactionMedicine === 'true' &&
      rAMScreening.value.adverseReaction === ''
    ) {
      alertError('Por Favor Indique as reações adversas');
      desableSubmitting();
    } else {
      if (tBScreening.value.id === null || tBScreening.value.id === undefined) {
        tBScreening.value.id = uuidv4();
      }
      if (
        vitalSignsScreening.value.distort !== null &&
        vitalSignsScreening.value.distort !== undefined &&
        vitalSignsScreening.value.distort !== ''
      )
        patientVisit.value.vitalSignsScreenings.length === 0
          ? patientVisit.value.vitalSignsScreenings.push(
              vitalSignsScreening.value
            )
          : (patientVisit.value.vitalSignsScreenings[0] =
              vitalSignsScreening.value);

      if (
        tBScreening.value.cough !== null &&
        tBScreening.value.cough !== undefined &&
        tBScreening.value.cough !== ''
      )
        patientVisit.value.tbScreenings.length === 0
          ? patientVisit.value.tbScreenings.push(tBScreening.value)
          : (patientVisit.value.tbScreenings[0] = tBScreening.value);

      if (
        pregnancyScreening.value.pregnant !== null &&
        pregnancyScreening.value.pregnant !== undefined &&
        pregnancyScreening.value.pregnant !== ''
      )
        patientVisit.value.pregnancyScreenings.length === 0
          ? patientVisit.value.pregnancyScreenings.push(
              pregnancyScreening.value
            )
          : (patientVisit.value.pregnancyScreenings[0] =
              pregnancyScreening.value);

      if (
        adherenceScreening.value.hasPatientCameCorrectDate !== null &&
        adherenceScreening.value.hasPatientCameCorrectDate !== undefined &&
        adherenceScreening.value.hasPatientCameCorrectDate !== ''
      )
        patientVisit.value.adherenceScreenings.length === 0
          ? patientVisit.value.adherenceScreenings.push(
              adherenceScreening.value
            )
          : (patientVisit.value.adherenceScreenings[0] =
              adherenceScreening.value);

      if (
        rAMScreening.value.adverseReactionMedicine !== null &&
        rAMScreening.value.adverseReactionMedicine !== undefined &&
        rAMScreening.value.adverseReactionMedicine !== ''
      )
        patientVisit.value.ramScreenings.length === 0
          ? patientVisit.value.ramScreenings.push(rAMScreening.value)
          : (patientVisit.value.ramScreenings[0] = rAMScreening.value);

      patientVisit.value.clinic = patient.value.clinic;
      patientVisit.value.clinic_id = patient.value.clinic.id;
      patientVisit.value.patient = patient.value;
      patientVisit.value.visitDate = getJSDateFromDDMMYYY(visitDate.value);

      if (patientVisit.value.vitalSignsScreenings.length > 1)
        patientVisit.value.vitalSignsScreenings.pop();
      if (patientVisit.value.tbScreenings.length > 1)
        patientVisit.value.tbScreenings.pop();
      if (patientVisit.value.pregnancyScreenings.length > 1)
        patientVisit.value.pregnancyScreenings.pop();
      if (patientVisit.value.adherenceScreenings.length > 1)
        patientVisit.value.adherenceScreenings.pop();
      if (patientVisit.value.ramScreenings.length > 1)
        patientVisit.value.ramScreenings.pop();

      saveORUpdatePatientVisit(!editMode.value);
    }
  }
};
const saveORUpdatePatientVisit = (isNew) => {
  if (isNew) {
    patientVisitService
      .post(patientVisit.value)
      .then(() => {
        alertSucess('Atenção Farmaceutica efectuada com sucesso');
        desableSubmitting();
        closeButtonActions();
      })
      .catch(() => {
        alertError('Aconteceu um erro ao gravar a Atenção Farmaceutica');
        desableSubmitting();
      });
  } else {
    patientVisitService
      .patch(patientVisit.value.id, patientVisit.value)
      .then(() => {
        alertSucess('Atenção Farmaceutica actualizada com sucesso');
        desableSubmitting();
        closeButtonActions();
      })
      .catch(() => {
        alertError('Aconteceu um erro ao actualizar a Atenção Farmaceutica');
        desableSubmitting();
      });
  }
};

const getImcValue = () => {
  if (
    vitalSignsScreening.value.height !== 0.0 &&
    vitalSignsScreening.value.weight !== 0
  ) {
    vitalSignsScreening.value.imc = (
      vitalSignsScreening.value.weight /
      (vitalSignsScreening.value.height * vitalSignsScreening.value.height)
    ).toFixed(1);
  }
};

// Computed
const verifyHasSameDay = () => {
  const visits = patientVisitService.getAllWithVitalSignByPatientId(
    patient.value.id
  );

  for (const visit of visits) {
    if (
      new Date(visit.visitDate).getTime() ===
        getJSDateFromDDMMYYY(visitDate).getTime() &&
      visit.vitalSignsScreenings.length > 0
    ) {
      hasVisitSameDay.value = true;
      break;
    } else if (
      new Date(visit.visitDate).getTime() ===
        getJSDateFromDDMMYYY(visitDate).getTime() &&
      visit.vitalSignsScreenings.length === 0
    ) {
      patientVisit.value = visit;
      hasVisitSameDay.value = false;
    } else {
      hasVisitSameDay.value = false;
    }
  }
};

provide('vitalSignsScreening', vitalSignsScreening);
provide('tBScreening', tBScreening);
provide('pregnancyScreening', pregnancyScreening);
provide('adherenceScreening', adherenceScreening);
provide('rAMScreening', rAMScreening);
</script>

<style></style>
