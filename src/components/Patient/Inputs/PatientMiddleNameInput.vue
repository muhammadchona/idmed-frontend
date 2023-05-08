<template>
    <TextInput
        label="Sobre Nome *"
        dense
        ref="midleName"
        class="col"
        :value="sobreNome"
        :rules="[ val => !!val || 'Por favor indicar o sobre nome']"
        />
</template>

<script>
export default {
    props: ['sobreNome'],
    components: {
        TextInput: require('components/Shared/Input/TextField.vue').default
    }
}
</script>

<style>

</style>
