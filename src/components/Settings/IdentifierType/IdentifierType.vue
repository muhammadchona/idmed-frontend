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
          <nameInput
            v-model="identifierType.description"
            label="Descrição *"
            :disable="isDisplayStep"
            ref="nome"
          />
        </div>
        <div class="row q-mt-md">
          <codeInput
            ref="code"
            v-model="identifierType.code"
            :disable="isDisplayStep"
            :rules="[(val) => codeRules(val)]"
            lazy-rules
            label="Código *"
          />
        </div>
        <div class="row q-mb-md">
          <TextInput
            v-model="identifierType.pattern"
            label="Padrão do identificador"
            ref="pattern"
            :disable="isDisplayStep"
            :rules="[
              (val) => !!val || 'Por favor indicar o padrão do identificador',
            ]"
            dense
            hint="Exemplo: ###/####/#"
            class="col"
          />
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
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';
import TextInput from 'src/components/Shared/Input/TextField.vue';

/*Declarations*/
const databaseCodes = ref([]);
const submitting = ref(false);

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

const clinics = computed(() => {
  return clinicService.getAllClinics();
});

onMounted(() => {
  console.log(identifierType);
  extractDatabaseCodes();
});

/*Methods*/
const extractDatabaseCodes = () => {
  identifierTypes.value.forEach((element) => {
    databaseCodes.value.push(element.code);
  });
};

const validateClinicSector = () => {
  console.log(identifierType);
  // this.$refs.nome.$refs.ref.validate()
  //   this.$refs.code.$refs.ref.validate()
  //   this.$refs.pattern.$refs.ref.validate()
  // if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.code.$refs.ref.hasError &&
  //   !this.$refs.pattern.$refs.ref.hasError) {
  doSave();
  // }
};

const doSave = () => {
  // if (this.mobile) {
  //   console.log('Mobile')
  //   if (!this.isEditStep) {
  //      console.log('Create Step')
  //     this.identifierType.syncStatus = 'R'
  //     console.log(this.identifierType)
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
    console.log('Create Step_Online_Mode');
    identifierTypeService
      .post(identifierType)
      .then((resp) => {
        showAddEditIdentifierType.value = false;
      })
      .catch((error) => {
        showAddEditIdentifierType.value = false;
      });
  } else {
    identifierTypeService
      .patch(identifierType.value.id, identifierType)
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
