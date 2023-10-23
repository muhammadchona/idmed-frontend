<template>
  <q-card style="width: 900px; max-width: 90vw" class="q-pt-lg">
    <q-card-section>
      <div class="text-h6">Medicamento</div>
    </q-card-section>
    <form @submit.prevent="validateDrug">
      <q-card-section class="q-px-md">
        <div class="q-mt-md">
          <div class="row">
            <nameInput
              v-model="drug.name"
              :disable="onlyView"
              ref="nome"
              label="Nome *"
            />
          </div>
          <div class="row q-mt-md">
            <codeInput
              v-model="drug.fnmCode"
              :disable="onlyView"
              label="fnmCode *"
              ref="code"
              lazy-rules
              :rules="[(val) => codeRules(val)]"
            />
          </div>
          <div class="row q-mt-md">
            <numberField
              v-model="drug.packSize"
              label="Tamanho do pacote *"
              :disable="onlyView"
              ref="packSize"
            />
          </div>
          <div class="q-mt-md"></div>
          <div class="row">
            <numberField
              v-model="drug.defaultTimes"
              label="Numero de toma *"
              :disable="onlyView"
              ref="defaultTimes"
            />
            <numberField
              v-model="drug.defaultTreatment"
              class="q-ml-md"
              label="Numero de vezes a tomar *"
              :disable="onlyView"
              ref="tomar"
            />
            <q-select
              class="col q-ml-md"
              ref="periodo"
              dense
              outlined
              v-model="drug.defaultPeriodTreatment"
              :options="periodsTime"
              :disable="onlyView"
              label="Periodo a Tomar *"
              :rules="[
                (val) => val != null || ' Por favor indique o periodo a tomar',
              ]"
            />
          </div>
          <div class="row q-mt-md">
            <q-select
              class="col"
              dense
              outlined
              v-model="drug.form"
              use-input
              ref="forma"
              input-debounce="0"
              :options="forms"
              option-value="id"
              option-label="description"
              label="Forma Farmacêutica *"
              :disable="onlyView"
              :rules="[
                (val) =>
                  val != null || ' Por favor indique a forma farmacêutica',
              ]"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mb-md q-mr-sm">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn
          type="submit"
          :loading="submitting"
          label="Submeter"
          color="primary"
          v-if="!onlyView"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*imports*/
import { ref, inject, onMounted, computed } from 'vue';
import Form from '../../../stores/models/form/Form';

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';
import numberField from 'src/components/Shared/Input/NumberField.vue';

/*Declarations*/
const submitting = ref(false);
const databaseCodes = ref([]);
const periodsTime = ref(['Ano', 'Mes', 'Semana', 'Dia']);

/*injects*/
const drug = inject('selectedDrug');
const viewMode = inject('viewMode');
const forms = inject('forms');
const drugs = inject('drugs');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

onMounted(() => {
  extractDatabaseCodes();
});

/*Methods*/
const extractDatabaseCodes = () => {
  drugs.value.forEach((element) => {
    databaseCodes.value.push(element.fnmCode);
  });
};
</script>

<style></style>
