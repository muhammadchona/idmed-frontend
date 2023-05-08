<template>
  <div class="column items-center" style="margin-top: 250px">
    <q-btn size="50px" round color="primary" icon="send" @click="initMigration"/>
    <div class="q-mt-md text-weight-medium">
      Iniciar a migração
    </div>
   </div>
</template>

<script>
import MigrationStage from 'src/store/models/Migration/MigrationStage'
export default {
  components: {
  },
  data () {
    return {

    }
  },
  methods: {
    initMigration () {
      MigrationStage.initMigration().then(resp => {
        this.$emit('migrationStarted', true)
      })
    }
  }
}
</script>

<style>

</style>
