<template>
    <q-input
        outlined
        class="col"
        ref="ref"
        dense
        :value="numbers"
        type="number"
        @input="(event) => $emit('update:numbers', event.target.value)"
        lazy-rules
        />
</template>

<script>
export default {
    props: ['numbers']
}
</script>

<style>

</style>
