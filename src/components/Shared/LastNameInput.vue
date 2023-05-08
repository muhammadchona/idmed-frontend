<template>
         <q-input
        outlined
        label="Apelido *"
        dense
        ref="ref"
        class="col"
       :value="lastName"
        @input="(event) => $emit('update:lastname', event.target.value)"
      :rules="[ val => !!val || 'Por favor indicar o nome']"
        lazy-rules/>
</template>

<script>
export default {
    props: ['lastName']
}
</script>

<style>

</style>
