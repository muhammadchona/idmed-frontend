<template>
  <div class="text-center">
    <div class="q-my-md text-subtitle1 text-grey-14">
      <slot>
        {{ title }}
      </slot>
    </div>
    <q-separator color="grey-13" size="1px" />
  </div>
</template>

<script setup>
import { inject } from 'vue';
const title = inject('title');
</script>

<style></style>
