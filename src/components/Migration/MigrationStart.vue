<template>
  <div class="column items-center" style="margin-top: 250px">
    <q-btn
      size="50px"
      round
      color="primary"
      icon="send"
      @click="initMigration"
    />
    <div class="q-mt-md text-weight-medium">Iniciar a migração</div>
  </div>
</template>

<script setup>
// import MigrationStage from 'src/store/models/Migration/MigrationStage';
import migrationService from 'src/services/api/migrationService/migrationService';
import { ref, provide, onMounted, computed, inject } from 'vue';

const migrationStarted = inject('migrationStarted');

const initMigration = () => {
  migrationService.initMigration().then((resp) => {
    //  this.$emit('migrationStarted', true);
    // migrationStarted.value = true;
    migrationStarted(true);
  });
};
</script>

<style></style>
