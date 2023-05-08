<template>
      <TextInput
        label="Nome *"
        dense
        ref="nome"
        class="col"
        :value="firstNames"
        @input="(event) => $emit('update:firstNames', event.target.value)"
        :rules="[ val => !!val || 'Por favor indicar o nome']"
        />
</template>

<script>
export default {
    props: ['firstNames'],
    components: {
        TextInput: require('components/Shared/Input/TextField.vue').default
    }
}
</script>

<style>

</style>
