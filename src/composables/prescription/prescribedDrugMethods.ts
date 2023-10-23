export function usePrescribedDrug() {
  function gettakeInstructions(prescribedDrug: any) {
    return `${prescribedDrug.amtPerTime} ${prescribedDrug.form} ${prescribedDrug.timesPerDay}`;
  }

  function getQtyPrescribed(prescribedDrug: any, weeks: any) {
    if (weeks === null || weeks === '') return 0;
    let lostDays = parseInt(String((weeks / 4) * 2));
    if (weeks <= 1) lostDays = 0;
    const days = parseInt(String(weeks * 7 + lostDays));

    let qty = 0;
    if (prescribedDrug.form.toLowerCase() === 'dia') {
      qty = Math.round(
        Number(
          (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * days) /
            prescribedDrug.drug.packSize
        )
      );
    } else if (prescribedDrug.form.toLowerCase() === 'semana') {
      qty = Math.round(
        Number(
          (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * weeks) /
            prescribedDrug.drug.packSize
        )
      );
    } else if (prescribedDrug.form.toLowerCase() === 'mes') {
      if (weeks < 4) {
        qty = -1;
      } else {
        qty = Math.round(
          Number(
            (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * weeks) /
              prescribedDrug.drug.packSize
          )
        );
      }
    } else if (prescribedDrug.form.toLowerCase() === 'ano') {
      if (weeks < 52) {
        qty = -1;
      } else {
        qty = Math.round(
          Number(
            (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * weeks) /
              prescribedDrug.drug.packSize
          )
        );
      }
    }

    // prescribedDrug.qtyPrescribed = qty;
    return qty;
  }

  return { gettakeInstructions, getQtyPrescribed };
}
