<template>
  <TextInput
    label="Sobre Nome *"
    dense
    ref="midleName"
    class="col"
    :value="sobreNome"
    :rules="[(val) => !!val || 'Por favor indicar o sobre nome']"
  />
</template>

<script setup>
import TextInput from 'components/Shared/Input/TextField.vue';
import { inject } from 'vue';

const sobreNome = inject('sobreNome');
</script>

<style></style>
