<template>
  <q-card style="width: 800px">
    <q-card-section class="bg-teal text-white">
      <q-input
        outlined
        v-model="urlBackend"
        placeholder="URL do Servidor"
        label-color="black"
        :suffix="'/api'"
        clearable
      >
        <template v-slot:append> </template>
      </q-input>
    </q-card-section>
    <q-card-actions horizontal align="right">
      <q-btn push flat class="shadow-5" @click="saveURLBackend" color="primary"
        >Gravar</q-btn
      >
    </q-card-actions>
  </q-card>
</template>
<script setup>
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { ref, onMounted } from 'vue';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
const { isMobile, isOnline } = useSystemUtils();
const { alertError } = useSwal();
const urlBackend = ref('http://');

onMounted(() => {
  if (localStorage.getItem('backend_url') !== null && isMobile.value) {
    urlBackend.value = localStorage.getItem('backend_url');
  } else if (sessionStorage.getItem('backend_url') !== null && isMobile.value) {
    urlBackend.value = sessionStorage.getItem('backend_url');
  }
});

const saveURLBackend = () => {
  urlBackend.value = urlBackend.value.concat('/api');

  if (urlBackend.value && isValidUrl(urlBackend.value)) {
    localStorage.setItem('backend_url', urlBackend.value);
    sessionStorage.setItem('backend_url', urlBackend.value);
    location.reload();
  } else {
    alertError('Por Favor Preencha uma URL válida');
  }
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
</script>
