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
        @update:model-value="
          determineNextPickUpDate(pickupDate, drugsDuration.weeks)
        "
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
                @update:model-value="
                  determineNextPickUpDate(pickupDate, drugsDuration.weeks)
                "
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
        @update:model-value="
          (value) => determineNextPickUpDate(pickupDate, value.weeks)
        "
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
        @update:model-value="setNextPickupDate()"
      >
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="nextPDate"
                mask="DD-MM-YYYY"
                @update:model-value="setNextPickupDate()"
              >
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
import { useDispenseType } from 'src/composables/prescription/dispenseType';
import durationService from 'src/services/api/duration/durationService';
// props
const props = defineProps(['addVisible', 'mainContainer', 'bgColor']);

// Declaration
const {
  extractHyphenDateFromDMYConvertYMD,
  getDateFromHyphenDDMMYYYY,
  getDateFormatDDMMYYYYFromYYYYMMDD,
  getJSDateFromDDMMYYY,
} = useDateUtils();
const { alertSucess, alertError, alertInfo } = useSwal();
const { getRelatedWeeks } = useDispenseType();
const headerClass = ref('');
const expanded = ref(false);
const curVisitDetails = ref('');
const nextPDate = ref('');
const pickupDate = ref('');
const drugsDuration = ref();

//Inject
const curPrescriptionDetail = inject('curPrescriptionDetail');
const curPatientVisit = inject('curPatientVisit');
const curPrescription = inject('curPrescription');
const curPack = inject('curPack');
const isNewPrescription = inject('isNewPrescription');
const durations = inject('durations');
const showAddEditDrug = inject('showAddEditDrug');
const validateDispense = inject('validateDispense');
const lastPack = inject('lastPack');

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
const expand = () => {
  expanded.value = !expanded.value;
  $emit('expandLess', expanded);
};
const showAdd = () => {
  if (!date.isValid(extractHyphenDateFromDMYConvertYMD(pickupDate.value))) {
    alertError('A data de levantamento é inválida');
  } else if (
    !date.isValid(extractHyphenDateFromDMYConvertYMD(nextPDate.value))
  ) {
    alertError('A data do próximo levantamento é inválida');
  } else if (drugsDuration.value === '') {
    alertError('Por favor indicar a duração da medicação a dispensar.');
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
  } else {
    showAddEditDrug.value = true;
  }
};
const determineNextPickUpDate = (pickupDate, weeks) => {
  if (date.isValid(extractHyphenDateFromDMYConvertYMD(pickupDate))) {
    const newDate = getDateFromHyphenDDMMYYYY(pickupDate);
    let lostDays = parseInt((weeks / 4) * 2);
    if (weeks <= 1) {
      lostDays = 0;
    }
    const daysToAdd = parseInt(weeks * 7 + lostDays);
    nextPDate.value = getDDMMYYYFromJSDate(
      date.addToDate(newDate, { days: daysToAdd })
    );

    curPack.value.packDate = extractHyphenDateFromDMYConvertYMD(pickupDate);
    curPack.value.pickupDate = extractHyphenDateFromDMYConvertYMD(pickupDate);
    curPack.value.nextPickUpDate = extractHyphenDateFromDMYConvertYMD(
      nextPDate.value
    );
    curPack.value.weeksSupply = weeks;
  }
};
const setNextPickupDate = () => {
  curPack.value.nextPickUpDate = extractHyphenDateFromDMYConvertYMD(
    nextPDate.value
  );
};

const formatDate = (dateString) => {
  return date.formatDate(dateString, 'YYYY-MM-DD');
};
const init = () => {
  if (isNewPrescription.value) {
    pickupDate.value = getDDMMYYYFromJSDate(
      curPrescription.value.prescriptionDate
    );
    if (
      curPrescriptionDetail.value.dispenseType !== null &&
      curPrescriptionDetail.value.dispenseType !== undefined
    ) {
      drugsDuration.value = durationService.getDurationByWeeks(
        getRelatedWeeks(curPrescriptionDetail.value.dispenseType)
      );
    } else {
      drugsDuration.value = curPrescription.value.duration;
    }
  } else {
    pickupDate.value = getYYYYMMDDFromJSDate(moment());
    if (
      lastPack.value.nextPickUpDate !== null &&
      lastPack.value.nextPickUpDate !== undefined
    ) {
      curPack.value.pickupDate = getYYYYMMDDFromJSDate(moment());
      curPack.value.weeksSupply = lastPack.value.weeksSupply;
      drugsDuration.value = durationService.getDurationByWeeks(
        curPack.value.weeksSupply
      );
    } else {
      curPack.value.pickupDate = getYYYYMMDDFromJSDate(moment());
      curPack.value.weeksSupply = curPrescription.value.duration.weeks;
      drugsDuration.value = curPrescription.value.duration;
    }
    pickupDate.value = getDDMMYYYFromJSDate(curPack.value.pickupDate);
  }

  determineNextPickUpDate(pickupDate.value, drugsDuration.value.weeks);
};

const getDDMMYYYFromJSDate = (jsDate) => {
  return moment(jsDate).local().format('DD-MM-YYYY');
};

const getYYYYMMDDFromJSDate = (jsDate) => {
  return moment(jsDate).local().format('YYYY-MM-DD');
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
