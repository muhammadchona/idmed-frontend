<template>
      <q-input
        outlined
        label="Nome*"
        dense
        ref="ref"
        class="col"
        :value="nome"
        @input="(event) => $emit('update:name', event.target.value)"
        :rules="[ val => !!val || 'Por favor indicar o nome']"
        lazy-rules/>
</template>

<script>
export default {
    props: ['nome']
}
</script>

<style>

</style>
