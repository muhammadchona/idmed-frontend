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
      <q-dialog v-model="alert.visible" persistent>
        <Dialog :type="alert.type" @closeDialog="closeDialog">
          <template v-slot:title> Informação</template>
          <template v-slot:msg> {{ alert.msg }} </template>
        </Dialog>
      </q-dialog>
    </form>
  </q-card>
</template>

<script setup>
/*imports*/
import Clinic from '../../../stores/models/clinic/Clinic';
import { ref, inject, onMounted, computed } from 'vue';
import ClinicSector from '../../../stores/models/clinicSector/ClinicSector';
import ClinicSectorType from '../../../stores/models/clinicSectorType/ClinicSectorType';
import clinicSectorService from 'src/services/api/clinicSectorService/clinicSectorService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';
import clinicSectorTypeService from 'src/services/api/clinicSectorTypeService/clinicSectorTypeService.ts';
import { v4 as uuidv4 } from 'uuid';

/*components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';
import Dialog from 'src/components/Shared/Dialog/Dialog.vue';

/*Declarations*/
const databaseCodes = [];
const submitting = ref(false);
const alert = ref({
  type: '',
  visible: false,
  msg: '',
});

/*injects*/
const clinicSector = inject('selectedClinicSector');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');

/*Hooks*/
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
  // this.setStep(this.stepp);
  extractDatabaseCodes();
  clinicSector.value.clinic = currClinic.value;
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
  console.log(clinicSector);
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
  // if (this.isCreateStep) {
  console.log('Create Step_Online_Mode');
  console.log(clinicSector.value);
  if (clinicSector.value.clinic !== null)
    clinicSector.value.clinic_id = clinicSector.value.clinic.id;
  console.log(clinicSector.value.clinic_id);
  console.log(clinicSector.value.clinic);
  console.log(clinicSector.value);
  clinicSectorService
    .post(clinicSector.value)
    .then((resp) => {
      console.log('Salvo com sucesso');

      // this.submitting = false;
      // this.displayAlert(
      //   'info',
      //   !this.isEditStep
      //     ? 'Sector Clínico adicionado com sucesso.'
      //     : 'Sector Clínico actualizado com sucesso.'
      // );
    })
    .catch((error) => {
      // this.displayAlert('error', error);
      // this.submitting = false;
      console.log('Nao salvo');
    });
  // } else {
  //   console.log('Edit Step_Online_Mode');
  //   ClinicSector.apiUpdate(this.clinicSector)
  //     .then((resp) => {
  //       console.log(resp.response.data);
  //       this.displayAlert(
  //         'info',
  //         !this.isEditStep
  //           ? 'Sector Clínico adicionado com sucesso.'
  //           : 'Sector Clínico actualizado com sucesso.'
  //       );
  //     })
  //     .catch((error) => {
  //       this.displayAlert('error', error);
  //     });
  // }
  // }
};
// displayAlert(type, msg) {
//   this.alert.type = type;
//   this.alert.msg = msg;
//   this.alert.visible = true;
// },
// closeDialog() {
//   if (this.alert.type === 'info') {
//     this.$emit('close');
//   }
// },

//     codeRules(val) {
//       if (this.clinicSector.code === '') {
//         return 'o Código é obrigatorio';
//       } else if (
//         (this.databaseCodes.includes(val) &&
//           this.selectedClinicSector.id === this.clinicSector.id &&
//           !this.isEditStep) ||
//         (this.databaseCodes.includes(val) &&
//           this.clinicSectors.filter((x) => x.code === val)[0].id !==
//             this.clinicSector.id &&
//           this.isEditStep)
//       ) {
//         return (
//           !this.databaseCodes.includes(val) || 'o Código indicado já existe'
//         );
//       }
//     },
</script>

<style>
.fild-radius {
  border-radius: 5px;
}
</style>
