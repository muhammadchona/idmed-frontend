import { ref } from 'vue';

const showPrescriptionDialog = ref(false);
const isNewPrescription = ref(true);
import { usePatient } from 'src/composables/patient/patientMethods';
import Patient from 'src/stores/models/patient/Patient';
const { hasEpisodes, hasNoObitOrTransferedForEpisode } = usePatient();
export function usePrescriptionDialog() {
  const openDialog = (isNew: any) => {
    isNewPrescription.value = isNew;
    showPrescriptionDialog.value = true;
  };

  const closeDialog = () => {
    showPrescriptionDialog.value = false;
  };

  const checkIfPatientIsObit = (patient: Patient) => {
    let result = false;
    if (hasEpisodes(patient)) {
      if (hasNoObitOrTransferedForEpisode(patient)) {
        result = false;
      } else {
        result = true;
      }
    }
    return result;
  };

  return {
    showPrescriptionDialog,
    isNewPrescription,
    openDialog,
    closeDialog,
    checkIfPatientIsObit,
  };
}
