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
          <nameInput
            v-model="clinicSector.description"
            label="Nome do Sector Clínico *"
            ref="nome"
            :disable="onlyView"
          />
        </div>
        <div class="row q-mt-md">
          <codeInput
            ref="code"
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
            ref="clinic"
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
import Clinic from '../../../stores/models/clinic/Clinic';
import { ref, inject, onMounted, computed, reactive } from 'vue';
import ClinicSector from '../../../stores/models/clinicSector/ClinicSector';
import ClinicSectorType from '../../../stores/models/clinicSectorType/ClinicSectorType';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService.ts';
import { v4 as uuidv4 } from 'uuid';

/*components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';

/*Declarations*/
const databaseCodes = ref([]);
const submitting = ref(false);

/*injects*/
const selectedClinicSector = inject('selectedClinicSector');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const showClinicSectorRegistrationScreen = inject(
  'showClinicSectorRegistrationScreen'
);

/*Hooks*/
const clinicSector = computed(() => {
  return selectedClinicSector.value;
});

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
  // this.$refs.nome.$refs.ref.validate();
  // this.$refs.code.$refs.ref.validate();
  // this.$refs.clinicSectorRef.validate();
  // this.$refs.clinic.validate();
  // if (
  //   !this.$refs.nome.$refs.ref.hasError &&
  //   !this.$refs.code.$refs.ref.hasError &&
  //   !this.$refs.clinic.hasError &&
  //   !this.$refs.clinicSectorRef.hasError
  // ) {
  submitClinicSector();
  // }
};

const submitClinicSector = () => {
  clinicSector.value.active = true;
  if (clinicSector.value.uuid === null) clinicSector.value.uuid = uuidv4();
  // if (mobile) {
  //   console.log('Mobile');
  //   clinicSector.clinic_id = currClinic.id;
  //   clinicSector.clinic_sector_type_id =
  //     clinicSector.clinicSectorType.id;
  //   if (!isEditStep) {
  //     console.log('Create Step');
  //     clinicSector.syncStatus = 'R';
  //     console.log(clinicSector);
  //     ClinicSector.localDbAdd(
  //       JSON.parse(JSON.stringify(clinicSector))
  //     ).then((item) => {
  //       ClinicSector.insert({ data: clinicSector });
  //     });
  //   } else {
  //     console.log('Edit Step');
  //     if (clinicSector.syncStatus !== 'R')
  //       clinicSector.syncStatus = 'U';
  //     const clinicSecUpdate = new ClinicSector(
  //       JSON.parse(JSON.stringify(clinicSector))
  //     );
  //     ClinicSector.localDbUpdate(clinicSecUpdate).then((groupRes) => {
  //       ClinicSector.update({ data: clinicSecUpdate });
  //     });
  //   }
  //   this.displayAlert(
  //     'info',
  //     !this.isEditStep
  //       ? 'Sector Clínico adicionado com sucesso.'
  //       : 'Sector Clínico actualizado com sucesso.'
  //   );
  // } else {
  if (isCreateStep.value) {
    console.log('Create Step_Online_Mode');
    if (clinicSector.value.clinic !== null) {
      clinicSector.value.clinic_id = clinicSector.value.clinic.id;
    }
    clinicSectorService
      .post(clinicSector.value)
      .then((resp) => {
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      })
      .catch((error) => {
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      });
  }
  if (isEditStep.value) {
    console.log('Edit Step_Online_Mode');
    if (clinicSector.value.clinic !== null) {
      clinicSector.value.clinic_id = clinicSector.value.clinic.id;
    }

    clinicSectorService
      .patch(clinicSector.value.id, clinicSector.value)
      .then((resp) => {
        submitting.value = false;
        showClinicSectorRegistrationScreen.value = false;
      })
      .catch((error) => {
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
    (databaseCodes.value.includes(val) &&
      selectedClinicSector.value.id === clinicSector.value.id &&
      !isEditStep.value) ||
    (databaseCodes.value.includes(val) &&
      clinicSectors.value.filter((x) => x.code === val)[0].id !==
        clinicSector.value.id &&
      isEditStep.value)
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
