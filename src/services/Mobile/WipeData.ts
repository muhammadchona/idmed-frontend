import packService from '../api/pack/packService';
import patientVisitService from '../api/patientVisit/patientVisitService';
import patientVisitDetailsService from '../api/patientVisitDetails/patientVisitDetailsService';
import prescriptionService from '../api/prescription/prescriptionService';
import useNotify from 'src/composables/shared/notify/UseNotify';
const { notifySuccess, notifyInfo } = useNotify();
export function wipeData() {
  async function getPatientsVisitToWipe() {
    notifyInfo('Limpeza de Dados Iniciada');
    const patientVisits =
      await patientVisitService.getLocalDbPatientVisitsSyncedAndWithSyncStatusNull();

    const groupedPatientVisits = patientVisits.reduce((acc, visit) => {
      const patientId = visit.patientId || visit.patient_id;

      if (!acc[patientId]) {
        acc[patientId] = [];
      }
      acc[patientId].push(visit);

      return acc;
    }, {});
    for (const patientId in groupedPatientVisits) {
      groupedPatientVisits[patientId].sort(
        (a, b) => new Date(a.visitDate) - new Date(b.visitDate)
      );
    }

    const patientsWithVisits = Object.entries(groupedPatientVisits).map(
      ([patientId, visits]) => {
        // Sort visits for the current patient by visitDate in descending order
        visits.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

        // Separate top 3 visits and the rest
        const top3Visits = visits.slice(0, 3);
        const remainingVisits = visits.slice(3);

        return {
          patientId,
          top3Visits,
          remainingVisits,
        };
      }
    );
    patientsWithVisits.forEach((pv) => {
      pv.remainingVisits.forEach(async (visit: any) => {
        if (visit.syncStatus === 'S' || visit.syncStatus === undefined) {
          visit.patientVisitDetails.forEach(async (visitDetails: any) => {
            const patientVisitDetails =
              await patientVisitDetailsService.getAllMobileByDetailsId(
                visitDetails.id
              );
            const prescription =
              await prescriptionService.getPrescriptionMobileById(
                visitDetails.prescription.id
              );
            const pack = await packService.getPackMobileById(
              visitDetails.pack.id
            );
            patientVisitDetailsService.delete(patientVisitDetails.id);
            prescriptionService.delete(prescription.id);
            packService.delete(pack.id);
            patientVisitService.delete(visit.id);
          });
        }
      });
    });
    notifySuccess('Limpeza de Dados Terminada');
  }

  return { getPatientsVisitToWipe };
}
