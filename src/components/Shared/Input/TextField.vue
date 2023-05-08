<template>
    <q-input
        outlined
        ref="ref"
        :value="value"
        type="text"
        @input="(event) => $emit('update:value', event.target.value)"
        lazy-rules
        />
</template>

<script>
export default {
    props: ['value', 'ref']
}
</script>

<style>

</style>
