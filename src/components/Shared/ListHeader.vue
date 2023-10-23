<template>
  <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none"
  >
    <span class="text-bold text-subtitle1 vertical-middle q-pl-md">
      <slot> {{ title }}</slot>
    </span>
    <template v-slot:action>
      <q-btn
        dense
        v-if="closeVisible"
        flat
        round
        color="white"
        icon="close"
        class="float-right"
        @click="closeSection"
      />
      <q-btn
        v-if="doneVisible"
        flat
        dense
        round
        color="white"
        icon="done"
        @click="$emit('done')"
      />
      <q-btn
        v-if="editVisible"
        flat
        dense
        round
        color="white"
        icon="edit"
        @click="$emit('initEdition')"
      />
      <q-btn
        dense
        flat
        round
        v-if="expandVisible"
        color="white"
        :icon="expanded ? 'expand_less' : 'expand_more'"
        class="float-right"
        @click="expand"
      />
      <q-btn
        dense
        v-if="addVisible"
        flat
        round
        color="white"
        icon="add"
        class="float-right"
        @click="addButtonActions()"
      />
    </template>
  </q-banner>
</template>
<script setup>
import { inject, ref } from 'vue';
// Declaration
const headerClass = ref('');
const expanded = ref(true);

//props
const props = defineProps([
  'editVisible',
  'closeVisible',
  'expandVisible',
  'addVisible',
  'mainContainer',
  'title',
  'bgColor',
  'addButtonActions',
  'doneVisible',
]);

const $emits = defineEmits(['done', 'initEdition']);

// Methods
const determineHeaderClass = () => {
  if (props.mainContainer.value) {
    headerClass.value = 'list-header';
  } else {
    headerClass.value = '';
  }
};

const expand = () => {
  expanded.value = !expanded.value;
  $emits('expand', expanded.value);
};

const closeSection = () => {
  $emits('closeSection');
};
const created = () => {
  determineHeaderClass();
};
</script>
<style>
.list-header {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
