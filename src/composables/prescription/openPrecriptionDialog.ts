import { ref } from 'vue';

const showPrescriptionDialog = ref(false);
const isNewPrescription = ref(true);
import { usePatient } from 'src/composables/patient/patientMethods';
import Patient from 'src/stores/models/patient/Patient';
const { hasEpisodes, hasNoObitOrTransferedForEpisode } = usePatient();
export function usePrescriptionDialog() {
  const openDialog = (isNew = true) => {
    isNewPrescription.value = isNew;
    showPrescriptionDialog.value = true;
  };

  const closeDialog = () => {
    showPrescriptionDialog.value = false;
  };

  const checkIfPatientIsObit = (patient: Patient) => {
    if (hasEpisodes(patient)) {
      if (hasNoObitOrTransferedForEpisode(patient)) {
        return true;
      } else {
        return false;
      }
    }
  };

  return {
    showPrescriptionDialog,
    isNewPrescription,
    openDialog,
    closeDialog,
    checkIfPatientIsObit,
  };
}
