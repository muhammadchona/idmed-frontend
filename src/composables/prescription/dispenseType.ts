export function useDispenseType() {
  function isDS(dispenseType: any) {
    return dispenseType.code === 'DS';
  }

  function isDM(dispenseType: any) {
    return dispenseType.code === 'DM';
  }

  function isDT(dispenseType: any) {
    return dispenseType.code === 'DT';
  }

  function isDA(dispenseType: any) {
    return dispenseType.code === 'DA';
  }

  function getRelatedWeeks(dispenseType: any) {
    if (dispenseType.isDM()) {
      return 4;
    } else if (dispenseType.isDT()) {
      return 12;
    } else if (dispenseType.isDS()) {
      return 24;
    } else if (dispenseType.isDA()) {
      return 52;
    }
  }

  return { isDS, isDM, isDT, isDA, getRelatedWeeks };
}
