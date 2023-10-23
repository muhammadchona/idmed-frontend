<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="local_pharmacy" size="sm" />
          <span class="q-pl-sm text-subtitle2">Sector Clínico</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form @submit.prevent="validateClinicSector">
      <q-card-section class="q-px-md">
        <div class="row q-mt-md">
          <!-- <q-input
            ref="nomeRef"
            v-model="clinicSector.description"
            label="Nome do Sector Clínico *"
            :disable="onlyView"
          /> -->
          <q-input
            outlined
            label="Nome do Sector Clínico *"
            dense
            ref="nomeRef"
            :disable="onlyView"
            class="col"
            v-model="clinicSector.description"
            @input="(event) => $emit('update:name', event.target.value)"
            :rules="[(val) => !!val || 'Por favor indicar o nome']"
            lazy-rules
          />
        </div>
        <div class="row q-mt-md">
          <q-input
            outlined
            dense
            class="col"
            ref="codeRef"
            v-model="clinicSector.code"
            :rules="[(val) => codeRules(val)]"
            lazy-rules
            :disable="onlyView"
            label="Código *"
          />
        </div>
        <div class="row q-mb-md">
          <q-select
            dense
            outlined
            class="col"
            :disable="onlyView"
            v-model="clinicSector.clinicSectorType"
            :options="clinicSectorTypes"
            transition-show="flip-up"
            transition-hide="flip-down"
            ref="clinicSectorRef"
            option-value="id"
            option-label="description"
            :rules="[
              (val) => val != null || ' Por favor indique o tipo de Sector',
            ]"
            lazy-rules
            label="Tipo de Sector Clinico"
          />
        </div>
        <div class="row q-mb-md">
          <q-select
            dense
            outlined
            class="col"
            v-model="clinicSector.clinic"
            :options="clinics"
            disable
            transition-show="flip-up"
            transition-hide="flip-down"
            ref="clinicRef"
            option-value="id"
            option-label="clinicName"
            :rules="[(val) => val != null || ' Por favor indique a clinica']"
            lazy-rules
            label="Clinica"
          />
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mb-md">
        <q-btn label="Cancelar" color="red" @click.once="$emit('close')" />
        <q-btn
          type="submit"
          :loading="submitting"
          @click.once="submitting = true"
          label="GRAVAR"
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
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService.ts';
import { v4 as uuidv4 } from 'uuid';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const { alertSucess, alertError } = useSwal();
const { closeLoading, showloading } = useLoading();

/*Declarations*/
const databaseCodes = ref([]);
const submitting = ref(false);
const nomeRef = ref(null);
const codeRef = ref(null);
const clinicSectorRef = ref(null);
const clinicRef = ref(null);

/*injects*/
const clinicSector = inject('selectedClinicSector');
const viewMode = inject('viewMode');
const currClinic = inject('currClinic');
const isNewClinicSector = inject('isNewClinicSector');
const showClinicSectorRegistrationScreen = inject(
  'showClinicSectorRegistrationScreen'
);

/*Hooks*/
// const clinicSector = computed(() => {
//   return selectedClinicSector.value;
// });

const onlyView = computed(() => {
  return viewMode.value;
});

const clinics = computed(() => {
  return clinicService.getAllClinics();
});

const clinicSectors = computed(() => {
  return clinicSectorService.getClinicSectorsByClinicId(currClinic.value.id);
});

const clinicSectorTypes = computed(() => {
  return clinicSectorTypeService.getAllClinicSectorTypes();
});

onMounted(() => {
  extractDatabaseCodes();
});

/*Methods*/
const extractDatabaseCodes = () => {
  clinicSectors.value.forEach((element) => {
    databaseCodes.value.push(element.code);
  });
};

const validateClinicSector = () => {
  nomeRef.value.validate();
  codeRef.value.validate();
  clinicSectorRef.value.validate();
  clinicRef.value.validate();
  if (
    !nomeRef.value.hasError &&
    !codeRef.value.hasError &&
    !clinicRef.value.hasError &&
    !clinicSectorRef.value.hasError
  ) {
    submitClinicSector();
  } else {
    submitting.value = false;
  }
};

const submitClinicSector = () => {
  if (isNewClinicSector.value) {
    clinicSector.value.active = true;
    clinicSector.value.uuid = uuidv4();
    clinicSector.value.syncStatus = 'P';
    if (clinicSector.value.clinic !== null) {
      clinicSector.value.clinic_id = clinicSector.value.clinic.id;
    }
    clinicSectorService
      .post(clinicSector.value)
      .then(() => {
        alertSucess('Sector Clínico registado com sucesso.');
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      })
      .catch((error) => {
        console.log(error);
        alertError(
          'Aconteceu um erro inesperado ao registar o Sector Clínico.'
        );
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      });
  } else {
    if (clinicSector.value.clinic !== null) {
      clinicSector.value.clinic_id = clinicSector.value.clinic.id;
    }
    clinicSectorService
      .patch(clinicSector.value.id, clinicSector.value)
      .then(() => {
        alertSucess('Sector Clínico actualizado com sucesso.');
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      })
      .catch((error) => {
        console.log(error);
        alertError(
          'Aconteceu um erro inesperado ao actualizar o Sector Clínico.'
        );
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      });
  }
  // }
};

const codeRules = (val) => {
  if (clinicSector.value.code === '') {
    return 'o Código é obrigatorio';
  } else if (
    (databaseCodes.value.includes(val) && isNewClinicSector.value) ||
    (databaseCodes.value.includes(val) &&
      clinicSectors.value.filter((x) => x.code === val)[0].id !==
        clinicSector.value.id &&
      !isNewClinicSector.value)
  ) {
    return !databaseCodes.value.includes(val) || 'o Código indicado já existe';
  }
};
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
