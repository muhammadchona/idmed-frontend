<template>
   <q-banner
    dense
    inline-actions
    :class="[bgColor, headerClass]"
    class="text-white q-pa-none">
        <span class="text-bold text-subtitle1 vertical-middle q-pl-md"><slot></slot></span>
        <template v-slot:action>
          <q-btn dense v-if="closeVisible" flat round color="white" icon="close" class="float-right" @click="closeSection"/>
          <q-btn v-if="doneVisible" flat dense round color="white" icon="done" @click="$emit('done')"/>
          <q-btn v-if="editVisible" flat dense round color="white" icon="edit" @click="$emit('initEdition')"/>
          <q-btn dense flat round v-if="expandVisible"  color="white" :icon="expanded ? 'expand_less' : 'expand_more'" class="float-right" @click="expand"/>
          <q-btn dense v-if="addVisible" flat round color="white" icon="add" class="float-right" @click="$emit('showAdd')"/>
        </template>
    </q-banner>
</template>

<script>
import { ref } from 'vue'
export default {
    props: ['addVisible', 'bgColor', 'mainContainer', 'doneVisible', 'closeVisible', 'editVisible', 'expandVisible'],
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
      },
      closeSection () {
      this.$emit('closeSection')
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
