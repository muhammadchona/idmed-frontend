<template>
   <q-input dense outlined :value="date" class="col">
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer"  :value="date">
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date :modelValue="date" :value="date" @input="(event) => $emit('update:date', $event.target.value)">
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
</template>
<script>
export default {
    props: ['date']
}
</script>
