<template>
<div ref="filterTransferedTo">
  <ListHeader
    :addVisible="false"
    :mainContainer="true"
    :closeVisible="true"
    @closeSection="closeSection"
    bgColor="bg-orange-5">Serviço {{selectedService !== null ? selectedService.code : ''}}: Lista de Pacientes transferidos PARA
  </ListHeader>
  <div class="param-container">
    <q-item>
        <q-item-section >
          Lista de Pacientes transferidos PARA
        </q-item-section>

        <q-item-section top side>
            <div class="text-grey-8 q-gutter-xs">
            <q-btn class="gt-xs" size="12px" flat dense round  >Excel</q-btn> |
            <q-btn class="gt-xs" size="12px" flat dense round >Pdf</q-btn>

            </div>
        </q-item-section>
    </q-item>
  </div>
  </div>
</template>

<script>
  export default {
    props: ['selectedService'],
    name: 'TransferedFrom',
    mounted () {
      console.log(this.selectedService)
    },
    components: {
      ListHeader: require('components/Shared/ListHeader.vue').default
    },
    methods: {
      closeSection () {
        this.$refs.filterTransferedTo.remove()
      }

    }
  }
</script>

<style lang="scss" scoped>
  .param-container {
    border-bottom: 1px dashed $grey-13;
    border-left: 1px dashed $grey-13;
    border-right: 1px dashed $grey-13;
    border-radius: 0px 0px 5px 5px;
  }
</style>
