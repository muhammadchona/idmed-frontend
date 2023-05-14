export function usePatientVisitDetail(patientVisitDetail: any) {
  function lastPack() {
    return patientVisitDetail.pack;
  }

  return { lastPack };
}
