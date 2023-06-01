<template>
  <div class="row">
    <q-banner inline-actions class="text-white bg-orange-1 col">
      <span class="text-subtitle1 text-orange-10"
        ><slot>
          {{ title }}
        </slot></span
      >
    </q-banner>
  </div>
</template>

<script setup>
import { inject } from 'vue';

const title = inject('titleEmptyList');
</script>

<style></style>
