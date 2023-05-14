export function useStartStopReason() {
  function isTranferReason(startStopReason: any) {
    return startStopReason.code === 'TRANSFERIDO_PARA';
  }
  return { isTranferReason };
}
