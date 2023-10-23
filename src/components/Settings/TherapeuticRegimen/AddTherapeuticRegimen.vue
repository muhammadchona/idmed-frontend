<template>
  <q-card style="width: 900px; max-width: 90vw" class="q-pt-lg">
    <q-card-section>
      <div class="text-h6">Regime Terapêutico</div>
    </q-card-section>
    <form @submit.prevent="">
      <q-card-section class="q-px-md">
        <div class="q-mt-md">
          <div class="row">
            <div class="col">
              <codeInput
                v-model="therapeuticRegimen.code"
                :disable="onlyView"
                ref="code"
                :rules="[(val) => codeRules(val)]"
                lazy-rules
              />
            </div>
            <div class="col q-ml-md">
              <nameInput
                v-model="therapeuticRegimen.regimenScheme"
                :disable="onlyView"
                label="Esquema do Regime*"
                ref="esquema"
              />
            </div>
          </div>
          <div class="row">
            <q-input
              outlined
              label="Descrição*"
              dense
              class="col"
              v-model="therapeuticRegimen.description"
              :disable="onlyView"
              ref="nome"
            />
          </div>
          <div class="row q-mt-md">
            <q-table
              style="height: 500px"
              class="col"
              title="Medicamentos"
              :rows="drugs"
              :columns="columnsDrug"
              :filter="filter"
              row-key="fnmCode"
              selection="multiple"
              v-model:selected="therapeuticRegimen.drugs"
              v-if="!onlyView"
            >
              <template v-slot:top-right>
                <q-input
                  outlined
                  dense
                  debounce="300"
                  v-model="filter"
                  placeholder="Procurar"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
            </q-table>
            <q-table
              class="col"
              title="Medicamentos"
              :rows="drugs"
              :columns="columnsDrug"
              row-key="fnmCode"
              v-if="onlyView"
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
/*Imports*/
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen';
import { ref, inject, onMounted, computed } from 'vue';
import Drug from '../../../stores/models/drug/Drug';
import drugService from 'src/services/api/drugService/drugService.ts';
// import TherapeuticRegimensDrug from '../../../stores/models/therapeuticRegimen/TherapeuticRegimensDrug'

/*Components import*/
import nameInput from 'src/components/Shared/NameInput.vue';
import codeInput from 'src/components/Shared/CodeInput.vue';

/*Declarations*/
const columnsDrug = [
  {
    name: 'fnmCode',
    required: true,
    label: 'Código FNM',
    align: 'left',
    field: (row) => row.fnmCode,
    format: (val) => `${val}`,
    sortable: true,
  },
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: (row) => row.name,
    format: (val) => `${val}`,
    sortable: true,
  },
];
const stringOptions = ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'];
const submitting = ref(false);
const databaseCodes = ref([]);
const periodsTime = ref(['Ano', 'Mes', 'Semana', 'Dia']);

/*injects*/
const viewMode = inject('viewMode');
const forms = inject('forms');
const therapeuticRegimen = inject('selectedTherapeuticRegimen');
const therapeuticRegimens = inject('therapeuticRegimens');

/*Hooks*/
const onlyView = computed(() => {
  return viewMode.value;
});

const drugs = computed(() => {
  if (onlyView.value) {
    return therapeuticRegimen.value.drugs;
  } else {
    return drugService.getAllDrugs();
  }
});

const formOptions = computed(() => {
  return forms.value;
});

onMounted(() => {
  extractDatabaseCodes();
});

/*Methods*/
const extractDatabaseCodes = () => {
  therapeuticRegimens.value.forEach((element) => {
    databaseCodes.value.push(element.fnmCode);
  });
};

/*methods*/
//       validateTherapeuticRegimen () {
//           this.$refs.esquema.$refs.ref.validate()
//         this.$refs.nome.$refs.ref.validate()
//          // this.$refs.code.$refs.ref.validate()
//         if (!this.$refs.esquema.$refs.ref.hasError && !this.$refs.nome.$refs.ref.hasError) {
//             this.submitTherapeuticRegimen()
//         }
//     },
//  async   submitTherapeuticRegimen () {
//    this.submitting = true
//     this.therapeuticRegimen.active = true
//         console.log(this.therapeuticRegimen)
//    await TherapeuticRegimen.apiSave(this.therapeuticRegimen).then(resp => {
//      this.submitting = false
//             console.log(resp.response.data.id)
//           TherapeuticRegimen.apiFetchById(resp.response.data.id)
//             this.displayAlert('info', 'Regime Terapêutico gravado com sucesso.')
//         }).catch(error => {
//           this.submitting = false
//             this.displayAlert('error', error)
//         })
//     },
//     displayAlert (type, msg) {
//       this.alert.type = type
//       this.alert.msg = msg
//       this.alert.visible = true
//     },
//     closeDialog () {
//       if (this.alert.type === 'info') {
//         this.$emit('close')
//       }
//     },
//       extractDatabaseCodes () {
//     this.therapeuticRegimens.forEach(element => {
//         this.databaseCodes.push(element.code)
// })
// },
//     codeRules (val) {
//    if (!this.therapeuticRegimen.id && this.selectedTherapeuticRegimen.id === this.therapeuticRegimen.id) {
//   return !this.databaseCodes.includes(val) || 'o Código indicado ja existe'
//      }
// };
</script>

<style></style>
