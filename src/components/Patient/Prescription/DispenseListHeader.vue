<template>
   <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none">
        <span class="text-bold text-subtitle1 vertical-middle q-pl-md"><slot></slot></span>
        <template v-slot:action>
        <q-btn
            @click="$emit('removePack')"
            dense unelevated
            color="red"
            label="Remover"
            class="float-right q-mr-md q-pa-none q-px-sm" />
        <q-btn
            @click="$emit('editPack')"
            dense unelevated
            color="orange-5"
            label="Refazer"
            class="float-right q-mr-md q-pa-none q-px-sm" />
          <q-btn dense flat round color="white" :icon="expanded ? 'expand_less' : 'expand_more'" class="float-right" @click="expand"/>
          <q-btn dense v-if="addVisible" flat round color="white" icon="add" class="float-right" @click="$emit('showAdd')"/>
        </template>
    </q-banner>
</template>

<script>
import { ref } from 'vue'
export default {
    props: ['addVisible', 'bgColor', 'mainContainer', 'canEdit', 'currPack', 'isClosed'],
    setup () {
      return {
        headerClass: '',
        expanded: ref(false)
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
