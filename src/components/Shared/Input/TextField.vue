<template>
  <q-input
    outlined
    :ref="refInput"
    :value="valueInput"
    type="text"
    @input="(event) => $emit('update:value', event.target.value)"
    lazy-rules
  >
    <template
      v-slot:append
      v-if="
        valueInput !== null && valueInput !== undefined && valueInput !== ''
      "
    >
      <q-icon name="close" @click="valueInput = ''" class="cursor-pointer" />
    </template>
  </q-input>
</template>

<script setup>
import { inject } from 'vue';
const valueInput = inject('valueInput');
const refInput = inject('refInput');
</script>

<style></style>
