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

<script>
export default {
    props: ['lastName'],
    components: {
        TextInput: require('components/Shared/Input/TextField.vue').default
    }
}
</script>

<style>

</style>
