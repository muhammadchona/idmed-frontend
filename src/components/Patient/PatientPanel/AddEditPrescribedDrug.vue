<template>
  <q-card style="width: 800px; max-width: 90vw">
    <form @submit.prevent="submitForm">
      <q-card-section class="q-pa-none">
        <div class="q-pt-md q-mb-sm bg-green-2">
          <div class="row items-center q-mb-sm q-pa-sm">
            <q-icon name="medication" size="md" color="green-10" />
            <span class="text-subtitle2 q-ml-sm"
              >Adição de Medicamentos para
              {{ curIdentifier.service.description }}</span
            >
          </div>
          <q-separator color="grey-13" size="1px" class="q-mb-sm" />
        </div>
        <div class="q-px-md">
          <q-toggle
            v-model="showOnlyOfRegimen"
            v-if="hasTherapeuticalRegimen"
            label="Visualizar apenas os medicamentos do regime selecionado"
          />
          <q-select
            class="col q-my-md"
            dense
            outlined
            use-input
            fill-input
            input-debounce="0"
            @filter="filterFnDrugs"
            ref="drugRef"
            :rules="[(val) => !!val || 'Por favor indicar o medicamento.']"
            v-model="prescribedDrug.drug"
            :options="optionsDrugs"
            option-value="id"
            option-label="name"
            label="Medicamento"
            @update:model-value="loadDefaultParameters"
          />
          <div class="row">
            <q-select
              class="col"
              dense
              outlined
              ref="amtPerTimeRef"
              :rules="[
                (val) =>
                  !!val ||
                  'Por favor indicar a quantidade a tomar de cada vez.',
              ]"
              v-model="prescribedDrug.amtPerTime"
              :options="amtPerTimes"
              label="Toma"
            />
            <q-input
              v-if="prescribedDrug.drug"
              outlined
              type="text"
              :disable="true"
              v-model="prescribedDrug.drug.form.description"
              label="Forma Farmacêutica"
              dense
              class="col q-ml-md"
            />
            <q-input
              outlined
              type="text"
              v-model="prescribedDrug.timesPerDay"
              label="Número de vezes a tomar"
              ref="formRef"
              :rules="[
                (val) => !!val || 'Por favor indicar o numero de vezes a tomar',
              ]"
              suffix="Vez(es)"
              dense
              class="col q-ml-md"
            />
            <q-select
              prefix="Por "
              class="col q-ml-md"
              dense
              outlined
              ref="timesRef"
              :rules="[
                (val) => !!val || 'Por favor indicar a periodicidade da toma',
              ]"
              v-model="prescribedDrug.form"
              :options="timesPerDay"
              label="Período"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-my-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="showAddEditDrug = false" />
        <q-btn type="submit" label="Adicionar" color="primary" />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
import drugService from 'src/services/api/drugService/drugService';
import PrescribedDrug from 'src/stores/models/prescriptionDrug/PrescribedDrug';
import { computed, inject, onMounted, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

//Declatarion
const prescribedDrug = ref(new PrescribedDrug({ id: uuidv4() }));
const showOnlyOfRegimen = ref(false);
const amtPerTimes = ref(['1', '2', '3', '4']);
const timesPerDay = ref(['Dia', 'Semana', 'Mês', 'Ano']);
const optionsDrugs = ref([]);

// Ref's
const amtPerTimeRef = ref(null);
const formRef = ref(null);
const timesRef = ref(null);
const drugRef = ref(null);

//Injection
const visitDetails = inject('curPatientVisitDetail');
const hasTherapeuticalRegimen = inject('hasTherapeuticalRegimen');
const curPrescriptionDetail = inject('curPrescriptionDetail');
const curIdentifier = inject('curIdentifier');
const addPrescribedDrug = inject('addPrescribedDrug');
const curPack = inject('curPack');
const showAddEditDrug = inject('showAddEditDrug');
// Hook

onMounted(() => {
  console.log(curIdentifier.value);
  // showOnlyOfRegimen.value = hasTherapeuticalRegimen.value;
  showOnlyOfRegimen.value = true;
});

//Methods

const submitForm = () => {
  drugRef.value.validate();
  amtPerTimeRef.value.validate();
  formRef.value.validate();
  timesRef.value.validate();
  if (
    !drugRef.value.hasError &&
    !amtPerTimeRef.value.hasError &&
    !formRef.value.hasError &&
    !timesRef.value.hasError
  ) {
    addPrescribedDrug(prescribedDrug.value);
  }
};

const getDrugs = computed(() => {
  let validDrugs = [];
  if (showOnlyOfRegimen.value) {
    validDrugs = drugService.getActiveDrugsByRegimen(
      curPrescriptionDetail.value.therapeuticRegimen.id
    );
  } else {
    validDrugs = drugs.value;
  }
  validDrugs = validDrugs.filter((drug) => {
    return (
      drug.clinicalService !== null &&
      drug.clinicalService.code === curIdentifier.service.code &&
      drug.active === true
      // && hasStock(drug)
    );
  });

  return validDrugs;
});

const loadDefaultParameters = () => {
  if (prescribedDrug.value.drug !== null) {
    prescribedDrug.value.amtPerTime =
      prescribedDrug.value.drug.defaultTreatment;
    prescribedDrug.value.timesPerDay = prescribedDrug.value.drug.defaultTimes;
    prescribedDrug.value.form =
      prescribedDrug.value.drug.defaultPeriodTreatment;
  }
};
// Computed
const drugs = computed(() => {
  return drugService.getAllDrugs();
});

// Method
const filterFnDrugs = (val, update, abort) => {
  const stringOptions = getDrugs.value;
  if (val === '') {
    update(() => {
      optionsDrugs.value = stringOptions.map((drug) => drug);
    });
  } else if (stringOptions.length === 0) {
    update(() => {
      optionsDrugs.value = [];
    });
  } else {
    update(() => {
      optionsDrugs.value = stringOptions
        .map((drug) => drug)
        .filter((drug) => {
          return (
            drug && drug.name.toLowerCase().indexOf(val.toLowerCase()) !== -1
          );
        });
    });
  }
};
</script>

<style></style>
