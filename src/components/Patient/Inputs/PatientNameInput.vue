<template>
  <TextInput
    label="Nome *"
    dense
    ref="nome"
    class="col"
    :value="firstNames"
    @input="(event) => $emit('update:firstNames', event.target.value)"
    :rules="[(val) => !!val || 'Por favor indicar o nome']"
  />
</template>

<script setup>
import TextInput from 'components/Shared/Input/TextField.vue';
import { inject } from 'vue';

const firstNames = inject('firstNames');
</script>

<style></style>
