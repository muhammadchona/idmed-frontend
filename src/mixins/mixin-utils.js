import { LocalStorage, SessionStorage, useQuasar } from 'quasar';
import Clinic from 'src/store/models/clinic/Clinic';
import Patient from 'src/store/models/patient/Patient';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export default {
  data() {
    return {
      alert: ref({
        type: '',
        visible: false,
        msg: '',
      }),
      step: '',
      initialized: false,
      $q: useQuasar(),
      clinicAux: new Clinic(),
      loading: true,
    };
  },
  methods: {
    // For Off-line

    setStep(value) {
      this.step = value;
    },
    changeToEditStep() {
      this.step = 'edit';
    },
    changeToCreateStep() {
      this.step = 'create';
    },
    changeToCloseStep() {
      this.step = 'close';
    },
    changeToRemotionStep() {
      this.step = 'delete';
    },
    changeToDisplayStep() {
      this.step = 'display';
    },
    changeToReOpenStep() {
      this.step = 'reOpen';
    },
    setAsInitialized() {
      this.initialized = true;
    },
    setAsInitializing() {
      this.initialized = false;
    },
    // For On-line
  },
  computed: {
    isInitialized() {
      return this.initialized;
    },
    isAppSyncDone() {
      return LocalStorage.getItem('system-sync-status') === 'done';
    },
    selectedPatient() {
      return new Patient(SessionStorage.getItem('selectedPatient'));
    },

    getUUID() {
      return uuidv4();
    },
    isEditStep() {
      return this.step === 'edit';
    },
    isCreateStep() {
      return this.step === 'create';
    },
    isCloseStep() {
      return this.step === 'close';
    },
    isRemotionStep() {
      return this.step === 'delete';
    },
    isDisplayStep() {
      return this.step === 'display';
    },
    isReOpenStep() {
      return this.step === 'reOpen';
    },
    inEdition() {
      return this.isEditStep || this.isCreateStep;
    },
  },
  beforeMount() {
    console.log();
    if (
      SessionStorage.getItem('currClinic') === null ||
      SessionStorage.getItem('currClinic').id === null
    ) {
      this.getClinicAux();
    } else {
      this.loading = false;
    }
  },
  mounted() {
    if (SessionStorage.getItem('currClinic') !== null) {
      this.loading = false;
    }
  },
  components: {
    Dialog: require('components/Shared/Dialog/Dialog.vue').default,
  },
};
