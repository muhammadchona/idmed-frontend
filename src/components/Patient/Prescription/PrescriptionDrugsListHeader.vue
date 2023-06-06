<template>
  <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none"
  >
    <span class="text-bold text-subtitle1 vertical-middle q-pl-md"
      ><slot></slot
    ></span>
    <template v-slot:action>
      <q-input
        v-if="!curPatientVisit.createPackLater"
        dense
        outlined
        :disable="validateDispense"
        bg-color="white"
        style="margin: 2px; width: 200px"
        v-model="pickupDate"
        @update:model-value="determineNextPickUpDate()"
        ref="pickupDateRef"
        label="Data de Levantamento"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="pickupDate"
                mask="DD-MM-YYYY"
                :disable="validateDispense"
                @update:model-value="determineNextPickUpDate()"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-select
        v-if="!curPatientVisit.createPackLater"
        dense
        :disable="validateDispense"
        style="width: 200px"
        class="q-mx-sm"
        bg-color="white"
        @blur="determineNextPickUpDate()"
        outlined
        v-model="drugsDuration"
        :options="durations"
        option-value="id"
        option-label="description"
        label="Dispensa para"
      />

      <q-input
        v-if="!curPatientVisit.createPackLater"
        outlined
        dense
        :disable="validateDispense"
        v-model="nextPDate"
        label="Proximo Levantamento"
        bg-color="white"
        style="margin: 2px; width: 200px"
        ref="nextPickupDateRef"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date v-model="nextPDate" mask="DD-MM-YYYY">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-btn
        dense
        flat
        round
        color="white"
        :icon="expanded ? 'expand_less' : 'expand_more'"
        class="float-right"
        @click="expand"
      />
      <q-btn
        dense
        v-if="addVisible"
        flat
        round
        :disable="validateDispense"
        color="white"
        icon="add"
        class="float-right q-mx-sm"
        @click="showAdd"
      />
    </template>
  </q-banner>
</template>

<script setup>
import { inject, onMounted, provide, ref } from 'vue';
import moment from 'moment';
import { date } from 'quasar';
import { useDateUtils } from 'src/composables/shared/dateUtils/dateUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
// props
const props = defineProps(['addVisible', 'mainContainer', 'bgColor']);

// Declaration
const {
  extractHyphenDateFromDMYConvertYMD,
  getDateFromHyphenDDMMYYYY,
  getJSDateFromDDMMYYY,
} = useDateUtils();
const { alertSucess, alertError, alertInfo } = useSwal();
const headerClass = ref('');
const expanded = ref(false);
const curVisitDetails = ref('');
const nextPDate = ref('');
const pickupDate = ref('');
const drugsDuration = ref('');

//Inject
const curPatientVisit = inject('curPatientVisit');
const curPrescription = inject('curPrescription');
const curPrescriptionDetail = inject('curPrescriptionDetail');
const curPatientVisitDetail = inject('curPatientVisitDetail');
const curPack = inject('curPack');
const isNewPrescription = inject('isNewPrescription');
const durations = inject('durations');
const showAddEditDrug = inject('showAddEditDrug');
const validateDispense = inject('validateDispense');

// Hook

onMounted(() => {
  init();
  determineHeaderClass();
});

// Methods
const determineHeaderClass = () => {
  if (props.mainContainer) {
    headerClass.value = 'list-header';
  } else {
    headerClass.value = '';
  }
};
const tryToDetermineDefaultTakePeriod = () => {
  if (curPrescription.value.duration !== null) {
    determineNextPickUpDate();
  }
};
const expand = () => {
  expanded.value = !expanded.value;
  $emit('expandLess', expanded);
};
const showAdd = () => {
  // $refs.pickupDate.validate()
  // $refs.nextPickupDate.validate()
  if (curPatientVisit.value.createPackLater) {
    $emit('showAdd', null, null, drugsDuration);
  } else {
    if (!date.isValid(extractHyphenDateFromDMYConvertYMD(pickupDate.value))) {
      alertError('A data de levantamento é inválida');
    } else if (
      !date.isValid(extractHyphenDateFromDMYConvertYMD(nextPDate.value))
    ) {
      alertError('A data do próximo levantamento é inválida');
    } else if (drugsDuration.value === '') {
      alertError('Por favor indicar a duração da medicação a dispensar.');
      // } else if (
      //   extractHyphenDateFromDMYConvertYMD(pickupDate.value) <
      //   curPatientVisitDetail.value.prescription.prescriptionDate
      // ) {
      //   alertError(
      //     'A data de levantamento indicada é menor que a data da prescrição'
      //   );
    } else if (
      extractHyphenDateFromDMYConvertYMD(pickupDate.value) >
      moment().format('YYYY-MM-DD')
    ) {
      alertError(
        'A data de levantamento indicada é maior que a data da corrente'
      );
    } else if (
      extractHyphenDateFromDMYConvertYMD(pickupDate.value) >
      extractHyphenDateFromDMYConvertYMD(nextPDate.value)
    ) {
      alertError(
        'A data do levantamento é maior que a data do próximo levantamento'
      );
      // } else if (
      //   newPickUpDate !== '' &&
      //   extractHyphenDateFromDMYConvertYMD(pickupDate.value) < newPickUpDate.value
      // ) {
      //   alertError(
      //     'A data de levantamento não pode ser anterior a ' +
      //       getDDMMYYYFromJSDate(newPickUpDate.value) +
      //       ', pois na data indicada o paciente ainda possui medicamntos da dispensa anterior.'
      //   );
    } else {
      showAddEditDrug.value = true;
      console.log('Passa');
    }
  }
};
const determineNextPickUpDate = () => {
  if (date.isValid(extractHyphenDateFromDMYConvertYMD(pickupDate.value))) {
    const newDate = getDateFromHyphenDDMMYYYY(pickupDate.value);
    let lostDays = parseInt((curPrescription.value.duration.weeks / 4) * 2);
    if (curPrescription.value.duration.weeks <= 1) lostDays = 0;
    const daysToAdd = parseInt(
      curPrescription.value.duration.weeks * 7 + lostDays
    );
    nextPDate.value = getDDMMYYYFromJSDate(
      date.addToDate(newDate, { days: daysToAdd })
    );

    curPack.value.packDate = extractHyphenDateFromDMYConvertYMD(
      pickupDate.value
    );
    curPack.value.pickupDate = extractHyphenDateFromDMYConvertYMD(
      pickupDate.value
    );
    curPack.value.nextPickUpDate = extractHyphenDateFromDMYConvertYMD(
      nextPDate.value
    );
    curPack.value.weeksSupply = drugsDuration.value.weeks;
  }
};
const formatDate = (dateString) => {
  return date.formatDate(dateString, 'YYYY-MM-DD');
};
const init = () => {
  if (isNewPrescription.value) {
    pickupDate.value = getDDMMYYYFromJSDate(
      curPrescription.value.prescriptionDate
    );
  } else {
    pickupDate.value = getDDMMYYYFromJSDate(new Date());
  }
  drugsDuration.value = curPrescription.value.duration;
  tryToDetermineDefaultTakePeriod();
};

const getDDMMYYYFromJSDate = (jsDate) => {
  return moment(jsDate).format('DD-MM-YYYY');
};

// Provide

provide('drugsDuration', drugsDuration);
</script>

<style scoped>
.list-header {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
.input-color {
  border: 1px solid white;
  border-radius: 5px;
  color: white;
}
</style>
