<template>
  <q-responsive :ratio="16 / 9">
    <div class="q-mt-lg">
      <div class="q-mx-xl">
        <div class="row">
          <q-space />
        </div>
        <div class="row items-center q-my-md">
          <q-icon name="person_outline" size="sm" />
          <span class="q-pl-sm text-subtitle2"
            >Digitalize o código de barras</span
          >
        </div>
        <div class="row">
          <q-input
            ref="barcodeInput"
            outlined
            label="Digitalizar código de barras"
            dense
            class="col"
            v-model="patientIdentifier"
            :loading="loading"
            :disable="isProcessing"
            :rules="[
              (val) => !!val || 'Por favor digitalizar o código de barras',
            ]"
            lazy-rules
            autofocus
          >
            <template v-slot:prepend>
              <q-icon name="qr_code_scanner" color="primary" />
            </template>
            <template
              v-slot:append
              v-if="
                patientIdentifier !== null &&
                patientIdentifier !== undefined &&
                patientIdentifier !== ''
              "
            >
              <q-icon
                name="close"
                @click="patientIdentifier = ''"
                class="cursor-pointer"
              />
            </template>
          </q-input>

          <q-btn
            v-if="canClear"
            @click="search"
            class="q-ml-md q-mb-xs"
            square
            color="primary"
            icon="search"
          >
            <q-tooltip class="bg-green-5">Pesquisar</q-tooltip>
          </q-btn>
          <q-btn
            v-if="canClear"
            @click="clearSearchParams"
            class="q-ml-md q-mb-xs"
            square
            color="amber"
            icon="clear"
          >
            <q-tooltip class="bg-amber-5">Limpar</q-tooltip>
          </q-btn>
        </div>

        <div></div>
      </div>
    </div>
  </q-responsive>
</template>
<script setup>
import {
  ref,
  onMounted,
  computed,
  onUnmounted,
  onBeforeUnmount,
  watch,
  provide,
} from 'vue';
import { useRouter } from 'vue-router';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import patientService from 'src/services/api/patientService/patientService';
import Patient from 'src/stores/models/patient/Patient';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import packService from 'src/services/api/pack/packService';
import { v4 as uuidv4 } from 'uuid';
const { alertError } = useSwal();
const router = useRouter();
const patientIdentifier = ref('');
const barcodeInput = ref(null);
const loading = ref(false);
const statusMessage = ref('');
const statusType = ref(''); // success, warning, error
const scanResult = ref(null);
const currPatient = ref(new Patient({ id: uuidv4() }));
let inputBuffer = '';
let barcodeTimeout = null;
let bufferTimer = null;
let isProcessing = false; // Add this flag
const PROCESSING_DELAY = 500; // Delay after last character
let barcodeBuffer = ''; // Buffer to collect barcode data
const BUFFER_RESET_TIME = 2000; // 2 seconds of inactivity resets the buffer

const isScanScreen = ref(true);

// const showPrescriptionDialog = ref(false);
// Computed properties
const statusClass = computed(() => {
  return (
    {
      success: 'bg-positive text-white',
      warning: 'bg-warning text-white',
      error: 'bg-negative text-white',
    }[statusType.value] || ''
  );
});

const statusIcon = computed(() => {
  return (
    {
      success: 'check_circle',
      warning: 'warning',
      error: 'error',
    }[statusType.value] || 'info'
  );
});

const canProceed = computed(() => scanResult.value !== null);

const handleBarcodeInput = (event) => {
  if (isProcessing) return;

  if (!event || !event.key) {
    console.error('Invalid keyboard event:', event);
    return;
  }
  z;

  if (event.key.length === 1 || event.key === '/' || event.key === '-') {
    if (barcodeTimeout) clearTimeout(barcodeTimeout);

    barcodeBuffer += event.key;

    barcodeTimeout = setTimeout(() => {
      // When timeout expires, process the complete barcode
      if (barcodeBuffer) {
        patientIdentifier.value = barcodeBuffer;
        console.log('Complete barcode:', barcodeBuffer);
        processBarcode(barcodeBuffer);
        barcodeBuffer = '';
      }
    }, PROCESSING_DELAY);
  } else if (event.key === 'Enter' && barcodeBuffer) {
    if (barcodeTimeout) clearTimeout(barcodeTimeout);
    patientIdentifier.value = barcodeBuffer;
    console.log('Complete barcode (Enter):', barcodeBuffer);
    processBarcode(barcodeBuffer);
    barcodeBuffer = ''; // Clear the buffer
    event.preventDefault(); // Prevent form submission
  }
};

// Methods
const processCompleteBarcode = async () => {
  if (isProcessing || !patientIdentifier.value) {
    if (!patientIdentifier.value) {
      showStatus('Por favor digitalizar o código de barras', 'warning');
    }
    return;
  }
  isProcessing = true;
  loading.value = true;
  statusMessage.value = '';
  const completeBarcode = patientIdentifier.value.trim();
  console.log('Processing barcode:', completeBarcode);

  try {
    console.log(patientIdentifier.value);
    currPatient.value.identifiers[0] = new PatientServiceIdentifier();
    currPatient.value.identifiers[0].value = completeBarcode;
    console.log(currPatient.value);
    const patient = await patientService.apiSearch(currPatient.value);
    console.log(patient.data);

    // await patientService.deleteAllExceptIdFromStorage(patient.data[0].id);
    currPatient.value = patient.data[0];
    localStorage.setItem('patientuuid', currPatient.value.id);
    localStorage.setItem('isScanScreen', isScanScreen.value);
    await patientService.getPatientByID(currPatient.value.id);
    // Rest Calls
    await patientServiceIdentifierService.apiGetAllByPatientId(
      currPatient.value.id
    );
    await patientVisitService.apiGetAllByPatientId(currPatient.value.id);
    await patientVisitDetailsService.apiGetPatientVisitDetailsByPatientId(
      currPatient.value.id
    );
    await prescriptionService.apiGetByPatientId(currPatient.value.id);
    await packService.apiGetByPatientId(currPatient.value.id);
    router.push('/patientpanel/');
  } catch (error) {
    console.error('Error processing barcode:', error);
    alertError('Erro ao processar o código de barras. Tente novamente.');
  } finally {
    isProcessing = false;
    loading.value = false;
    patientIdentifier.value = '';
  }
};

const clearInput = () => {
  patientIdentifier.value = '';
  scanResult.value = null;
  statusMessage.value = '';
  barcodeInput.value?.focus();
};

const showStatus = (message, type) => {
  statusMessage.value = message;
  statusType.value = type;
};

const goToNextScreen = () => {
  if (scanResult.value) {
    router.push({
      name: 'PatientDetails',
      params: { id: scanResult.value.id },
    });
  }
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  if (event.key === 'F2') clearInput();
  if (event.key === 'F3') processBarcode();
  if (event.key === 'F4' && canProceed.value) goToNextScreen();
};

const focusInput = () => {
  if (barcodeInput.value) {
    barcodeInput.value.focus();
  }
};

onMounted(() => {
  focusInput();

  // Direct DOM event listener for keydown events
  // document.addEventListener('keydown', handleBarcodeInput);

  document.addEventListener('click', () => {
    if (!isProcessing) {
      // focusInput();
    }
  });

  // Add a keydown listener to detect Enter key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && inputBuffer.length > 0) {
      processCompleteBarcode(inputBuffer);
      event.preventDefault(); // Prevent form submission
    }
  });
});

onBeforeUnmount(() => {
  // Clean up event listener
  document.removeEventListener('keydown', handleBarcodeInput);
});

const handleInputChange = (value) => {
  if (isProcessing) return;

  // If this is the start of new input (empty buffer), store the current value
  if (inputBuffer === '') {
    inputBuffer = value;
  }
  // If we already have something in the buffer, this is continued input
  else if (value && value.length > inputBuffer.length) {
    // Only update if new value is longer (scanner is adding characters)
    inputBuffer = value;
  }

  // Reset the buffer timer
  if (bufferTimer) clearTimeout(bufferTimer);

  // Set a timer to process the barcode after input stops
  bufferTimer = setTimeout(() => {
    if (inputBuffer.length > 0) {
      processCompleteBarcode(inputBuffer);
    }
  }, BUFFER_RESET_TIME);
};

watch(patientIdentifier, (newValue, oldValue) => {
  handleInputChange(newValue);
});
</script>
