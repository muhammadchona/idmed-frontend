<template>
  <q-card style="width: 900px; max-width: 90vw">
    <q-card-section class="q-pa-none bg-green-2">
      <div class="q-pa-md">
        <div class="row items-center">
          <q-icon name="pin" size="sm" />
          <span class="q-pl-sm text-subtitle2">Tipo de Identificador</span>
        </div>
      </div>
      <q-separator color="grey-13" size="1px" />
    </q-card-section>
    <form @submit.prevent="validateClinicSector">
      <q-card-section class="q-px-md">
        <div class="row q-mt-md">
          <q-input
            v-model="identifierType.description"
            label="Descrição *"
            :disable="isDisplayStep"
            ref="nomeRef"
            outlined
            dense
            class="col"
            :rules="[(val) => !!val || 'Por favor indicar o nome']"
            lazy-rules
          />
        </div>
        <div class="row q-mt-md">
          <q-input
            ref="codeRef"
            v-model="identifierType.code"
            :disable="isDisplayStep"
            :rules="[(val) => codeRules(val)]"
            lazy-rules
            label="Código *"
            outlined
            dense
            class="col"
          />
        </div>
        <div class="row q-mb-md">
          <q-input
            v-model="identifierType.pattern"
            label="Padrão do identificador"
            ref="patternRef"
            :disable="isDisplayStep"
            :rules="[
              (val) => !!val || 'Por favor indicar o padrão do identificador',
            ]"
            dense
            hint="Exemplo: ###/####/#"
            class="col"
            outlined
            lazy-rules
          >
            <template
              v-slot:append
              v-if="
                identifierType.pattern !== null &&
                identifierType.pattern !== undefined &&
                identifierType.pattern !== ''
              "
            >
              <q-icon
                name="close"
                @click="identifierType.pattern = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-mb-md">
        <q-btn label="Cancelar" color="red" @click="$emit('close')" />
        <q-btn
          type="submit"
          :loading="submitting"
          label="Gravar"
          color="primary"
          v-if="!onlyView"
        />
      </q-card-actions>
    </form>
  </q-card>
</template>

<script setup>
/*Imports*/
// import IdentifierType from '../../../stores/models/identifierType/IdentifierType';
import { ref, inject, onMounted, computed, reactive, provide } from 'vue';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService.ts';
import clinicService from 'src/services/api/clinicService/clinicService.ts';

/*Components import*/

/*Declarations*/
const databaseCodes = ref([]);
const submitting = ref(false);
const nomeRef = ref(null);
const codeRef = ref(null);
const patternRef = ref(null);

/*injects*/
const identifierType = inject('selectedIdentifierType');
const stepp = inject('stepp');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const identifierTypes = inject('identifierTypes');
const showAddEditIdentifierType = inject('showAddEditIdentifierType');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const isDisplayStep = computed(() => {
  return viewMode.value;
});

const clinics = computed(() => {
  return clinicService.getAllClinics();
});

onMounted(() => {
  extractDatabaseCodes();
});

/*Methods*/
const extractDatabaseCodes = () => {
  identifierTypes.value.forEach((element) => {
    databaseCodes.value.push(element.code);
  });
};

const validateClinicSector = () => {
  nomeRef.value.validate();
  codeRef.value.validate();
  patternRef.value.validate();
  if (
    !nomeRef.value.hasError &&
    !codeRef.value.hasError &&
    !patternRef.value.hasError
  ) {
    doSave();
  }
};

const doSave = () => {
  // if (this.mobile) {
  //   if (!this.isEditStep) {
  //     this.identifierType.syncStatus = 'R'
  //     IdentifierType.localDbAdd(JSON.parse(JSON.stringify(this.identifierType)))
  //     IdentifierType.insert({ data: this.identifierType })
  //     this.displayAlert('info', !this.isEditStep ? 'Identificador adicionado com sucesso.' : 'Identificador actualizado com sucesso.')
  //   } else {
  //       if (this.identifierType.syncStatus !== 'R') this.identifierType.syncStatus = 'U'
  //       const identifierTypeUpdate = new IdentifierType(JSON.parse(JSON.stringify((this.identifierType))))
  //       IdentifierType.localDbUpdate(identifierTypeUpdate)
  //       this.displayAlert('info', !this.isEditStep ? 'Identificador adicionado com sucesso.' : 'Identificador actualizado com sucesso.')
  //   }
  // } else {
  if (isCreateStep.value) {
    identifierTypeService
      .post(identifierType.value)
      .then((resp) => {
        showAddEditIdentifierType.value = false;
      })
      .catch((error) => {
        showAddEditIdentifierType.value = false;
      });
  } else {
    identifierTypeService
      .patch(identifierType.value.id, identifierType.value)
      .then((resp) => {
        showAddEditIdentifierType.value = false;
      })
      .catch((error) => {
        showAddEditIdentifierType.value = false;
      });
  }
  // }
};

const codeRules = (val) => {
  if (identifierType.value.code === '') {
    return 'o Código é obrigatorio';
  } else if (
    (databaseCodes.value.includes(val) &&
      identifierType.value.id === identifierType.value.id &&
      !isEditStep.value) ||
    (databaseCodes.value.includes(val) &&
      identifierTypes.value.filter((x) => x.code === val)[0].id !==
        identifierType.value.id &&
      isEditStep.value)
  ) {
    return !databaseCodes.value.includes(val) || 'o Código indicado já existe';
  }
};
</script>

<style></style>
