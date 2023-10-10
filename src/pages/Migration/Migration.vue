<template>
  <div q-px-xl>
    <TitleBar>Migração de dados</TitleBar>
    <MigrationStart v-if="!hasStarted" />
    <div class="row q-mt-md" v-if="statusLoaded && hasStarted">
      <div class="col">
        <ParamsProgress v-if="hasStarted" :data="paramsStatus" />
      </div>
      <div class="col">
        <StockProgress :data="stockStatus" v-if="hasStarted" />
      </div>
      <div class="col">
        <PatientProgress :data="patientStatus" v-if="hasStarted" />
      </div>
    </div>
    <div class="column items-center" v-if="statusLoaded && hasStarted">
      <div class="row q-mt-xl">
        <q-btn
          outline
          rounded
          color="blue-9"
          label="Imprimir relatório de erros"
          @click="printReport()"
        />
        <q-btn
          class="q-ml-md"
          outline
          rounded
          color="blue-9"
          label="Ver detalhes do progresso"
          @click="showprogressDetails = true"
        />
      </div>
    </div>
    <q-dialog persistent v-model="showprogressDetails">
      <ProgressDetails :stage="stage" @close="showprogressDetails = false" />
    </q-dialog>
  </div>
</template>

/*
<script setup>
import Report from 'src/stores/models/report/Report';
import ReportService from 'src/services/api/report/ReportService';
import MigrationStage from 'src/stores/models/Migration/MigrationStage';
import migrationReport from 'src/services/reports/Migration/migrationReport.ts';
import migrationService from 'src/services/api/migrationService/migrationService';
import Clinic from 'src/stores/models/clinic/Clinic';
import ParamsProgress from 'src/components/Migration/ParamsProgress.vue';
import StockProgress from 'src/components/Migration/StockProgress.vue';
import MigrationStart from 'src/components/Migration/MigrationStart.vue';
import PatientProgress from 'src/components/Migration/PatientProgress.vue';
import ProgressDetails from 'src/components/Migration/ProgressDetails.vue';
import TitleBar from 'components/Shared/TitleBar.vue';

import { ref, provide, onMounted, computed, watch } from 'vue';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import clinicService from 'src/services/api/clinicService/clinicService';

const { alertSucess, alertInfo, alertError, alertWarningAction } = useSwal();
const { closeLoading, showloading } = useLoading();

const progress = ref([]);
const stage = ref('');
const showprogressDetails = ref(false);
const paramsStatus = ref(null);
const stockStatus = ref(null);
const patientStatus = ref(null);
const currClinic = ref(null);
const t = ref('');

const printReport = () => {
  showloading();
  ReportService.apiGetMigrationLogReport().then((resp) => {
    if (!resp.data[0]) {
      alertInfo('Nao existem Dados para este relatorio');
    } else {
      // Setting parameters
      const provinceName = currClinic.value.province.description;

      const districtName = currClinic.value.district.description;

      const usName = currClinic.value.clinicName;

      migrationReport.downloadExcel(
        provinceName,
        districtName,
        usName,
        resp.data
      );
      closeLoading();
    }
  });
};

const getMigrationPregress = () => {
  ReportService.apiMigrationStatus().then((resp) => {
    progress.value = resp.data;
    loadSpecificStatus();
    checkMigrationIsFinished();
    t.value = null;
    if (!isMigrationFinished.value) t.value = '';
  });
};

const checkMigrationIsFinished = async () => {
  progress.value.forEach(async (progss) => {
    if (progss.migration_stage === 'PATIENT_MIGRATION_STAGE') {
      patientStatus.value = progss;
      console.log(patientStatus.value.stage_progress > 97);
      const migrationStage = migrationService.getFromStorageByCode(
        'PATIENT_MIGRATION_STAGE'
      );

      if (
        patientStatus.value.total_migrated !== 0 &&
        patientStatus.value.stage_progress > 80 &&
        patientStatus.value.stage_progress < 100 &&
        migrationStage.value !== 'COMPLETED'
      ) {
        const isFinished = await ReportService.apiMigrationStatusIsFinished();
        if (isFinished.data === true) {
          alertWarningAction('Deseja Terminar A Migração ?').then((result) => {
            if (result) {
              showloading();
              migrationService.finishMigration().then((resp) => {
                closeLoading();
                alertSucess('Operação efectuada com sucesso.');
              });
            }
          });
        }
      }
    }
  });
};

const loadSpecificStatus = () => {
  progress.value.forEach((progss) => {
    if (progss.migration_stage === 'PATIENT_MIGRATION_STAGE') {
      patientStatus.value = progss;
      if (
        (patientStatus.value.total_migrated !== 0 ||
          patientStatus.value.total_rejcted !== 0) &&
        patientStatus.value.stage_progress < 100
      ) {
        stage.value = 'PATIENT_MIGRATION_STAGE';
      }
    } else if (progss.migration_stage === 'STOCK_MIGRATION_STAGE') {
      stockStatus.value = progss;
      if (
        (stockStatus.value.total_migrated !== 0 ||
          stockStatus.value.total_rejcted !== 0) &&
        stockStatus.value.stage_progress < 100
      ) {
        stage.value = 'STOCK_MIGRATION_STAGE';
      }
    } else if (progss.migration_stage === 'PARAMS_MIGRATION_STAGE') {
      paramsStatus.value = progss;
      if (
        (paramsStatus.value.total_migrated !== 0 ||
          paramsStatus.value.total_rejcted !== 0) &&
        paramsStatus.value.stage_progress < 100
      ) {
        stage.value = 'PARAMS_MIGRATION_STAGE';
      }
    }
  });
  closeLoading();
};

const migrationStarted = (started) => {
  closeLoading();
  migrationService.apiGetAll();
  getMigrationPregress();
};

watch(
  () => t.value,
  (oldt, newt) => {
    if (isMigrationFinished.value) {
      oldt = newt;
      clearInterval(t);
      setInterval(() => {
        getMigrationPregress();
      }, 2 * 10000);
    } else {
      clearInterval(t);
    }
  }
);

const currStatus = computed(() => {
  return progress;
});

const isMigrationFinished = computed(() => {
  const isFinished = progress.value.some((p) => {
    return p.stage_progress < 100;
  });
  return isFinished;
});

const statusLoaded = computed(() => {
  return progress;
});

const migrationStages = computed(() => {
  return migrationService.getAllFromStorage();
});

const hasStarted = computed(() => {
  const started = migrationStages.value.some((stage) => {
    return stage.value !== 'NOT_STARTED';
  });
  return started;
});

onMounted(() => {
  currClinic.value = clinicService.currClinic();
  showloading();
  getMigrationPregress();
  migrationService.apiGetAll();
});

provide('title', '');
provide('migrationStarted', migrationStarted);
</script>

<style></style>
