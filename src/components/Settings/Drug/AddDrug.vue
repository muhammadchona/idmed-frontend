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
              @filter="filterForm"
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
import Drug from '../../../stores/models/drug/Drug';
import { ref, inject, onMounted, computed, reactive } from 'vue';
import Form from '../../../stores/models/form/Form';

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';
import numberField from 'src/components/Shared/Input/NumberField.vue';

/*Declarations*/
const stringOptions = ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'];
const submitting = ref(false);
const databaseCodes = ref([]);
const periodsTime = ref(['Ano', 'Mes', 'Semana', 'Dia']);

/*injects*/
const drug = inject('selectedDrug');
const viewMode = inject('viewMode');
const editMode = inject('editMode');
const currClinic = inject('currClinic');
const isEditStep = inject('isEditStep');
const isCreateStep = inject('isCreateStep');
const forms = inject('forms');
const drugs = inject('drugs');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const formOptions = computed(() => {
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
// validateDrug () {
//               this.$refs.nome.$refs.ref.validate()
//               this.$refs.code.$refs.ref.validate()
//               this.$refs.packSize.$refs.ref.validate()
//               this.$refs.defaultTimes.$refs.ref.validate()
//               this.$refs.tomar.$refs.ref.validate()
//               this.$refs.periodo.validate()
//               this.$refs.forma.validate()
//               if (this.drug.packSize <= 0) {
//                  this.displayAlert('error', 'Por favor indique um tamanho de pacote maior que zero ')
//               } else if (this.drug.defaultTimes <= 0) {
//                     this.displayAlert('error', 'Por favor indique um numero de toma maior que zero ')
//               } else if (this.drug.defaultTreatment <= 0) {
//                     this.displayAlert('error', 'Por favor indique um numero de vezes a tomar maior que zero ')
//               } else if (!this.$refs.nome.$refs.ref.hasError && !this.$refs.code.$refs.ref.hasError &&
//         !this.$refs.packSize.$refs.ref.hasError && !this.$refs.defaultTimes.$refs.ref.hasError &&
//         !this.$refs.tomar.$refs.ref.hasError && !this.$refs.periodo.hasError &&
//              !this.$refs.forma.hasError) {
//                 this.submitDrug()
//             }
//         },
//         submitDrug () {
//             this.submitting = true
//            this.drug.active = true
//            Drug.apiSave(this.drug).then(resp => {
//                this.submitting = false
//                 console.log(resp.response.data)
//                  Drug.apiFetchById(resp.response.data.id)
//                 this.displayAlert('info', this.drug.id === null ? 'Medicamento adicionado com sucesso.' : 'Medicamento actualizado com sucesso.')
//             }).catch(error => {
//                 this.submitting = false
//                 this.displayAlert('error', error)
//             })
//         },
//         displayAlert (type, msg) {
//           this.alert.type = type
//           this.alert.msg = msg
//           this.alert.visible = true
//         },
//         closeDialog () {
//           if (this.alert.type === 'info') {
//             this.$emit('close')
//           }
//         },

//     codeRules (val) {
//        if (!this.drug.id && this.selectedDrug.id === this.drug.id) {
//       return !this.databaseCodes.includes(val) || 'o Código indicado ja existe'
//          }
//     }
</script>

<style></style>
