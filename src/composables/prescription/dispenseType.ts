export function useDispenseType() {
  function isDD(dispenseType: any) {
    return dispenseType.code === 'DD';
  }
  function isDN(dispenseType: any) {
    return dispenseType.code === 'DN';
  }

  function isDS(dispenseType: any) {
    return dispenseType.code === 'DS';
  }

  function isDB(dispenseType: any) {
    return dispenseType.code === 'DB';
  }

  function isDM(dispenseType: any) {
    return dispenseType.code === 'DM' || dispenseType.code === 'FRM';
  }

  function isDT(dispenseType: any) {
    return dispenseType.code === 'DT';
  }

  function isDA(dispenseType: any) {
    return dispenseType.code === 'DA';
  }

  function getRelatedWeeks(dispenseType: any) {
    if (isDD(dispenseType)) {
      return 0;
    } else if (isDN(dispenseType)) {
      return 1;
    } else if (isDM(dispenseType)) {
      return 4;
    } else if (isDB(dispenseType)) {
      return 8;
    } else if (isDT(dispenseType)) {
      return 12;
    } else if (isDS(dispenseType)) {
      return 24;
    } else if (isDA(dispenseType)) {
      return 52;
    }
  }

  return { isDD, isDN, isDS, isDB, isDM, isDT, isDA, getRelatedWeeks };
}
