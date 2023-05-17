<template>
  <q-input
    outlined
    label="Nr. Identificador"
    dense
    ref="identifier"
    class="col"
    :value="value"
    @input="(event) => $emit('update:value', event.target.value)"
    :rules="[(val) => !!val || 'Por favor indicar o identificador']"
    lazy-rules
  />
</template>

<script setup>
import { inject } from 'vue';

const value = inject('value');
</script>

<style></style>
