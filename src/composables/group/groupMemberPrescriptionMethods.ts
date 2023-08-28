export function useGroupMemberPrescription() {
  function lastGroupMemberPrescription(groupMemberPrescriptions: any) {
    let lastPrescription = null;
    groupMemberPrescriptions.forEach((groupMemberPrescription: any) => {
      if (lastPrescription === null || lastPrescription === '') {
        lastPrescription = groupMemberPrescription;
      } else if (
        groupMemberPrescription.prescription.prescriptionDate >
        lastPrescription.prescription.prescriptionDate
      ) {
        lastPrescription = groupMemberPrescription;
      }
    });
    return lastPrescription;
  }

  return { lastGroupMemberPrescription };
}
