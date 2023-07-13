<template>
  <div ref="filterArvDailyRegisterSection">
    <ListHeader
      :addVisible="false"
      :mainContainer="true"
      :closeVisible="true"
      @closeSection="closeSection"
      bgColor="bg-orange-5"
      >Serviço {{ selectedService !== null ? selectedService.code : '' }}: Lista
      de Dispensas Não Sicronizadas
    </ListHeader>
    <div class="param-container">
      <q-item>
        <q-item-section class="col">
          <FiltersInput
            :id="id"
            :typeService="selectedService"
            :progress="progress"
            :clinicalService="selectedService"
            :applicablePeriods="periodType"
            @generateReport="generateReport"
            @initReportProcessing="initReportProcessing"
          />
        </q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script setup>
import Report from 'src/services/api/report/ReportService';
import ArvDailyRegisterReport from 'src/services/reports/monitoring/ArvDailyRegisterReport.ts';
import TherapeuticRegimen from '../../../stores/models/therapeuticRegimen/TherapeuticRegimen';
import DispenseType from '../../../stores/models/dispenseType/DispenseType';
import Prescription from 'src/stores/models/prescription/Prescription';
import TherapeuticLine from '../../../stores/models/therapeuticLine/TherapeuticLine';
import ClinicalService from '../../../stores/models/ClinicalService/ClinicalService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import Patient from '../../../stores/models/patient/Patient';
import PatientVisitDetails from '../../../stores/models/patientVisitDetails/PatientVisitDetails';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';
import reportDatesParams from 'src/services/reports/ReportDatesParams';
import { v4 as uuidv4 } from 'uuid';
import { LocalStorage } from 'quasar';
import { ref, onMounted } from 'vue';
import Pack from 'src/stores/models/packaging/Pack';
import Drug from 'src/stores/models/drug/Drug';
import StartStopReason from 'src/stores/models/startStopReason/StartStopReason';

//compontes
import ListHeader from 'components/Shared/ListHeader.vue';
import FiltersInput from 'components/Reports/shared/FiltersInput.vue';

import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useSwal } from 'src/composables/shared/dialog/dialog';
// import { Script } from 'vm';

const { website, isDeskTop, isMobile } = useSystemUtils();
const { alertSucess, alertError, alertWarningAction } = useSwal();
const filterArvDailyRegisterSection = ref('');

const name = 'NotSynchronizedPack';
const props = defineProps(['selectedService', 'menuSelected', 'id']);
const totalRecords = ref(0);
const qtyProcessed = ref(0);
const progress = ref(0);
</script>
