<template>
    <div>
        <q-btn icon="person_outline" round stack color="purple" class="q-py-md q-px-lg" no-caps>
            <div class="text-center">
            <slot name="label"></slot>
            </div>
        </q-btn>
    </div>
</template>

<script>
export default {
    props: ['icon']
}
</script>

<style>

</style>
