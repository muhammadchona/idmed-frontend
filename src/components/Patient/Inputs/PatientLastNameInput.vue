<template>
    <TextInput
        label="Apelido *"
        dense
        ref="lastName"
        class="col"
        :value="lastName"
        :rules="[ val => !!val || 'Por favor indicar o apelido']"
        />
</template>

<script setup>
import TextInput from 'components/Shared/Input/TextField.vue'
import { inject } from 'vue'

const lastName = inject('lastName')

</script>

<style>

</style>
