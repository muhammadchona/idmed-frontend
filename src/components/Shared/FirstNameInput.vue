<template>
      <q-input
        outlined
        label="Nome *"
        dense
        ref="ref"
        class="col"
        :value="firstNames"
        @input="(event) => $emit('update:firstNames', event.target.value)"
        :rules="[ val => !!val || 'Por favor indicar o nome']"
        lazy-rules/>
</template>

<script>
export default {
    props: ['firstNames']
}
</script>

<style>

</style>
