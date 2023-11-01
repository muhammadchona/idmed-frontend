<template>
  <div>
    <q-banner dense inline-actions class="text-white q-pa-none">
      <q-select
        class="q-ma-sm"
        dense
        outlined
        filled
        ref="clinicalService"
        v-model="selectedService"
        :options="clinicalServices"
        @update:model-value="(val) => setSelectedCode(val)"
        option-value="id"
        option-label="code"
        label="Serviço de Saúde"
      />
      <q-separator />
      <div class="q-pa-md" style="max-width: 500px">
        <q-list bordered v-if="selectedService !== null">
          
          <div v-if="codeServicoActual === 'TARV'">
            <tarv @changeTab="changeTab" />
          </div>
          <div v-else-if="codeServicoActual === 'TPT'">
            <tpt @changeTab="changeTab" />
          </div>
          <div v-else-if="codeServicoActual === 'PREP'">
            <prep @changeTab="changeTab" />
          </div>

          <div v-else class="vertical-middle">
            <q-banner rounded class="bg-orange-1 text-left text-orange-10">
              Nenhum Relatório assossiado ao Serviço de Saúde Seleccionado!.
            </q-banner>
          </div>
        </q-list>
        <div v-else class="vertical-middle">
          <q-banner rounded class="bg-orange-1 text-left text-orange-10">
            Nenhum Serviço de Saúde foi Seleccionado!.
          </q-banner>
        </div>
      </div>
    </q-banner>
  </div>
</template>

<script setup>
import clinicalServiceService from 'src/services/api/clinicalServiceService/clinicalServiceService';
import { computed, ref, inject, onMounted, provide } from 'vue'
import tarv from './reportMenuListTypes/tarv.vue';
import tpt from './reportMenuListTypes/tpt.vue';
import prep from './reportMenuListTypes/prep.vue';
const emit = defineEmits(['changeTab'])

const currTab = ref('');
const selectedService = ref(null);

const servicoActual = inject('servicoActual')
const codeServicoActual = inject('codeServicoActual')

const setSelectedCode = (service) => {
  servicoActual.value = service
  codeServicoActual.value = service.code
}

const changeTab = (tabName) => {
  currTab.value = tabName;
  emit('changeTab', tabName, selectedService.value);
};

const clinicalServices = computed(() => {
  return clinicalServiceService.getAllClinicalServices();
});

</script>

<style></style>
