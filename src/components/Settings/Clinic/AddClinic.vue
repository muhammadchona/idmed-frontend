<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="local_hospital" size="sm" />
          <span class="q-pl-sm text-subtitle2">Farmácia</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form @submit.prevent="validateClinic">
      <q-scroll-area style="height: 600px">
        <q-card-section class="q-px-md">
          <div class="row q-mt-md">
            <nameInput
              v-model="clinic.clinicName"
              label="Nome da Farmácia *"
              :disable="onlyView"
              ref="nome"
            />
          </div>
          <div class="row q-mt-md">
            <codeInput
              ref="code"
              v-model="clinic.code"
              :rules="[(val) => codeRules(val)]"
              :disable="onlyView"
              lazy-rules
              label="Código *"
            />
            <q-select
              dense
              outlined
              class="q-ml-md col"
              v-model="clinic.facilityType"
              :disable="onlyView"
              :options="facilityTypes"
              transition-show="flip-up"
              transition-hide="flip-down"
              ref="facilityType"
              option-value="id"
              option-label="description"
              :rules="[
                (val) => val != null || ' Por favor indique o tipo de farmacia',
              ]"
              lazy-rules
              label="Tipo de Farmácia *"
            />
          </div>
          <div class="row q-mb-md">
            <q-select
              dense
              outlined
              class="col"
              v-model="clinic.province"
              :disable="onlyView"
              :options="provinces"
              transition-show="flip-up"
              transition-hide="flip-down"
              ref="province"
              option-value="id"
              option-label="description"
              :rules="[
                (val) => val != null || ' Por favor indique a província',
              ]"
              lazy-rules
              label="Província *"
            />
          </div>
          <div class="row q-mb-md">
            <q-select
              class="col"
              dense
              outlined
              transition-show="flip-up"
              transition-hide="flip-down"
              :disable="onlyView"
              v-model="clinic.district"
              :options="districts"
              ref="district"
              option-value="id"
              option-label="description"
              :rules="[(val) => val != null || ' Por favor indique o Distrito']"
              lazy-rules
              label="Distrito"
            />
          </div>
          <div class="row q-mt-md">
            <PhoneField
              v-model="clinic.telephone"
              dense
              label="Numero de Telefone"
              :disable="onlyView"
            />
          </div>
          <div class="row q-mt-md">
            <q-input
              outlined
              class="col"
              v-model="clinic.notes"
              type="textarea"
              label="Notas"
              dense
              :disable="onlyView"
            />
          </div>
        </q-card-section>
        <q-scroll-observer />
      </q-scroll-area>
      <q-card-actions align="right" class="q-mb-md">
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
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import provinceService from 'src/services/api/provinceService/provinceService.ts';
import facilityTypeService from 'src/services/api/facilityTypeService/facilityTypeService.ts';
import districtService from 'src/services/api/districtService/districtService.ts';

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';
import PhoneField from 'src/components/Shared/Input/PhoneField.vue';

/*Declarations*/
const databaseCodes = ref([]);
const submitting = ref(false);
const clinic = inject('clinic');
const selectedClinic = inject('clinic');

/*injects*/
const viewMode = inject('viewMode');

/*Hooks*/
onMounted(() => {
  extractDatabaseCodes();
});

const onlyView = computed(() => {
  return viewMode.value;
});

const clinics = computed(() => {
  return clinicService.getAllClinics();
});

const provinces = computed(() => {
  return provinceService.getAllProvinces();
});

const facilityTypes = computed(() => {
  return facilityTypeService.getAllFacilityTypes();
});

const districts = computed(() => {
  if (clinic.value.province !== null) {
    return districtService.getAllDistrictByProvinceId(clinic.value.province.id);
  } else {
    return null;
  }
});

/*Methods*/
const extractDatabaseCodes = () => {
  clinics.value.forEach((element) => {
    databaseCodes.value.push(element.code);
  });
};

const codeRules = (val) => {
  if (clinic.value.code === '') {
    return 'o Código e obrigatorio';
  } else if (clinic.value.id && selectedClinic.value.id === clinic.value.id) {
    return databaseCodes.value.includes(val) || 'o Código indicado ja existe';
  }
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
