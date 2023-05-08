<template>
   <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none">
        <span class="text-bold text-subtitle1 vertical-middle q-pl-md"><slot></slot></span>
        <template v-slot:action>
          <q-btn v-if="doneVisible" flat dense round color="green-8" icon="done" @click="$emit('done')"/>
          <q-btn dense v-if="addVisible" flat round color="green-8" :icon="expanded ? 'expand_less' : 'expand_more'" class="float-right" @click="expand"/>
          <q-btn dense v-if="addVisible" flat round color="green-8" icon="add" class="float-right">
          <q-menu
              anchor="center middle"
              self="center middle"
            >
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup>
                  <q-item-section @click="createAdjustment('POSETIVE')">Ajuste Positivo</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section @click="createAdjustment('NEGATIVE')">Ajuste Negativo</q-item-section>
                </q-item>
                <q-item clickable v-close-popup>
                  <q-item-section @click="createAdjustment('LOSS')">Perdas</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn dense v-if="!addVisible" flat round color="red-8" icon="close" class="float-right" @click="$emit('cancel')"/>
        </template>
    </q-banner>
</template>

<script>
import { ref } from 'vue'
export default {
    props: ['addVisible', 'bgColor', 'mainContainer', 'doneVisible'],
    setup () {
      return {
        headerClass: '',
        expanded: ref(false),
        adjustmentType: ''
      }
    },
    methods: {
      determineHeaderClass () {
        if (this.mainContainer) {
          this.headerClass = 'list-header'
        } else {
          this.headerClass = ''
        }
      },
      expand () {
        this.expanded = !this.expanded
        this.$emit('expandLess', this.expanded)
      },
      createAdjustment (adjustmentType) {
        this.$emit('addNewAdjustment', adjustmentType)
      }
    },
    created () {
      this.determineHeaderClass()
    }
}
</script>

<style>
    .list-header {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
</style>
