<template>
    <q-input
        outlined
        class="col"
        ref="ref"
        dense
        :value="phone"
        maxlength="12"
        type="tel"
        @input="(event) => $emit('update:phone', event.target.value)"
        lazy-rules
        >
        <template v-slot:prepend>
          <q-icon name="phone_android" />
        </template>
    </q-input>
</template>

<script>
export default {
    props: ['phone']
}
</script>

<style>

</style>
