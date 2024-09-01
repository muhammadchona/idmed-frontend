<template>
  <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none"
  >
    <span class="text-bold text-subtitle1 vertical-middle q-pl-md"
      ><slot></slot
    ></span>
    <template v-slot:action>
      <q-btn
        v-if="doneVisible"
        :loading="loadingSave"
        flat
        dense
        round
        color="green-8"
        icon="done"
        @click="saveAjustment"
      />
      <q-btn
        dense
        v-if="showAddButton"
        flat
        round
        color="green-8"
        :icon="expanded ? 'expand_less' : 'expand_more'"
        class="float-right"
        @click="expand"
      />
      <q-btn
        dense
        v-if="addVisible"
        flat
        round
        color="green-8"
        icon="add"
        class="float-right"
      >
        <q-menu anchor="center middle" self="center middle">
          <q-list style="min-width: 150px">
            <q-item clickable v-close-popup>
              <q-item-section @click="createAdjustment('POSETIVE')"
                >Ajuste Positivo</q-item-section
              >
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section @click="createAdjustment('NEGATIVE')"
                >Ajuste Negativo</q-item-section
              >
            </q-item>
            <!-- <q-item clickable v-close-popup>
              <q-item-section @click="createAdjustment('LOSS')"
                >Perdas</q-item-section
              >
            </q-item> -->
          </q-list>
        </q-menu>
      </q-btn>
      <q-btn
        dense
        v-if="showCancel"
        flat
        round
        color="red-8"
        icon="clear"
        class="float-right"
        @click="cancelAdjustment"
      />
      <!-- <q-btn
        dense
        v-if="!addVisible"
        flat
        round
        color="red-8"
        icon="close"
        class="float-right"
        @click="$emit('cancel')"
      /> -->
    </template>
  </q-banner>
</template>

<script setup>
import { ref, inject, provide, onMounted } from 'vue';

const addVisible = inject('addVisible');
const bgColor = inject('bgColor');
const mainContainer = inject('mainContainer');
const doneVisible = inject('doneVisible');
const createAdjustment = inject('addNewAdjustment');
const expandLess = inject('expandLess');
const saveAjustment = inject('saveAjustment');
const showAddButton = inject('showAddButton');
const cancelAdjustment = inject('cancelAdjustment');
const showCancel = inject('showCancel');
const loadingSave = inject('loadingSave');

const headerClass = ref('');
const expanded = ref(false);

const determineHeaderClass = () => {
  if (mainContainer) {
    headerClass.value = 'list-header';
  } else {
    headerClass.value = '';
  }
};

const expand = () => {
  expanded.value = !expanded.value;
  expandLess(expanded.value);
};

onMounted(() => {
  determineHeaderClass();
});
</script>

<style>
.list-header {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}
</style>
