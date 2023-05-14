export function usePrescription() {
  function calculateLeftDuration(prescription: any, weeksSupply: string) {
    if (prescription.leftDuration === 0) {
      prescription.leftDuration = Number(
        (Number(prescription.duration.weeks) - Number(weeksSupply)) / 4
      );
    } else {
      prescription.leftDuration = Number(
        (Number(prescription.leftDuration * 4) - Number(weeksSupply)) / 4
      );
    }
  }

  function remainigDuration(prescription: any) {
    const prescriptionDuration = Number(prescription.duration.weeks);
    let packagedWeeks = 0;
    prescription.patientVisitDetails.forEach((pvd: any) => {
      if (pvd.pack !== null) {
        packagedWeeks = Number(packagedWeeks + pvd.pack.weeksSupply);
      }
    });
    return Number((prescriptionDuration - packagedWeeks) / 4);
  }

  function remainigDurationInWeeks(prescription: any) {
    const prescriptionDuration = Number(prescription.duration.weeks);
    let packagedWeeks = 0;
    prescription.patientVisitDetails.forEach((pvd: any) => {
      if (pvd.pack !== null) {
        packagedWeeks = Number(packagedWeeks + pvd.pack.weeksSupply);
      }
    });
    return Number(prescriptionDuration - packagedWeeks);
  }

  function lastPackOnPrescription(prescription: any) {
    let lastVisit = '';
    prescription.patientVisitDetails.forEach((visit: any) => {
      if (lastVisit === null || lastVisit === '') {
        lastVisit = visit;
      } else if (visit.pack.pickupDate > lastVisit.pack.pickupDate) {
        lastVisit = visit;
      }
    });
    return lastVisit.pack;
  }

  return {
    calculateLeftDuration,
    remainigDuration,
    remainigDurationInWeeks,
    lastPackOnPrescription,
  };
}
