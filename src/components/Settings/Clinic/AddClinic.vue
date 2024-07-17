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
            <q-input
              outlined
              dense
              class="col"
              v-model="clinic.clinicName"
              label="Nome da Farmácia *"
              :disable="onlyView"
              ref="nomeRef"
              :rules="[(val) => !!val || 'Por favor indicar o nome']"
              lazy-rules
            />
          </div>
          <div class="row q-mt-md">
            <q-input
              outlined
              dense
              ref="codeRef"
              class="col"
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
              ref="facilityTypeRef"
              option-value="id"
              option-label="description"
              :rules="[
                (val) => val != null || ' Por favor indique o tipo de farmacia',
              ]"
              lazy-rules
              label="Tipo de Farmácia *"
            />
          </div>
          <div class="row q-mt-md">
            <q-select
              dense
              outlined
              class="col"
              v-model="clinic.province"
              :disable="onlyView"
              :options="provinces"
              transition-show="flip-up"
              transition-hide="flip-down"
              ref="provinceRef"
              option-value="id"
              option-label="description"
              :rules="[
                (val) => val != null || ' Por favor indique a província',
              ]"
              lazy-rules
              label="Província *"
            />
            <q-select
              class="q-ml-md col"
              dense
              outlined
              transition-show="flip-up"
              transition-hide="flip-down"
              :disable="onlyView"
              v-model="clinic.district"
              :options="districts"
              ref="districtRef"
              option-value="id"
              option-label="description"
              :rules="[(val) => val != null || ' Por favor indique o Distrito']"
              lazy-rules
              label="Distrito"
            />
          </div>
          <div class="row">
            <PhoneField
              v-model="clinic.telephone"
              dense
              label="Número de Telefone"
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
import { v4 as uuidv4 } from 'uuid';

/*Components import*/
import PhoneField from 'src/components/Shared/Input/PhoneField.vue';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';

/*Declarations*/
const { alertSucess, alertError } = useSwal();
const { isProvincialInstalation } = useSystemConfig();
const databaseCodes = ref([]);
const submitting = ref(false);
const createMode = inject('createMode');
const clinic = inject('clinic');
const selectedClinic = inject('clinic');
const showClinicRegistrationScreen = inject('showClinicRegistrationScreen');

/**
 Refs
 */

const nomeRef = ref(null);
const codeRef = ref(null);
const facilityTypeRef = ref(null);
const provinceRef = ref(null);
const districtRef = ref(null);

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
  if (isProvincialInstalation()) {
    return facilityTypeService.getFacilityTypeClinics();
  } else {
    return facilityTypeService.getAllFacilityTypes();
  }
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
  } else if (createMode.value) {
    return !databaseCodes.value.includes(val) || 'o Código indicado ja existe';
  } else {
    if (selectedClinic.value.code !== clinic.value.code) {
      return databaseCodes.value.includes(val) || 'o Código indicado ja existe';
    }
  }
};

const validateClinic = () => {
  submitting.value = true;
  nomeRef.value.validate();
  codeRef.value.validate();
  facilityTypeRef.value.validate();
  provinceRef.value.validate();
  districtRef.value.validate();
  if (
    !nomeRef.value.hasError &&
    !codeRef.value.hasError &&
    !facilityTypeRef.value.hasError &&
    !provinceRef.value.hasError &&
    !districtRef.value.hasError
  ) {
    submitClinic();
  } else {
    submitting.value = false;
  }
};

const submitClinic = () => {
  if (createMode.value) {
    clinic.value.active = true;
    clinic.value.uuid = uuidv4();
    clinic.value.syncStatus = 'P';

    clinicService
      .post(clinic.value)
      .then(() => {
        alertSucess('Farmácia registada com sucesso.');
        submitting.value = false;
        showClinicRegistrationScreen.value = false;
      })
      .catch((error) => {
        console.log(error);
        alertError('Aconteceu um erro inesperado ao registar a Farmácia.');
        submitting.value = false;
        showClinicRegistrationScreen.value = false;
      });
  } else {
    clinicService
      .patch(clinic.value.id, clinic.value)
      .then(() => {
        alertSucess('Farmácia actualizada com sucesso.');
        submitting.value = false;
        showClinicRegistrationScreen.value = false;
      })
      .catch((error) => {
        console.log(error);
        alertError('Aconteceu um erro inesperado ao actualizar a Farmácia.');
        submitting.value = false;
        showClinicRegistrationScreen.value = false;
      });
  }
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
