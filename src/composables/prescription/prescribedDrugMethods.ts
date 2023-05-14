export function usePrescribedDrug() {
  function gettakeInstructions(prescribedDrug: any) {
    return `${prescribedDrug.amtPerTime} ${prescribedDrug.form} ${prescribedDrug.timesPerDay}`;
  }

  function getQtyPrescribed(prescribedDrug: any, drugsDuration: any) {
    if (drugsDuration === null || drugsDuration === '') return 0;
    let lostDays = parseInt(String((drugsDuration.weeks / 4) * 2));
    if (drugsDuration.weeks <= 1) lostDays = 0;
    const days = parseInt(String(drugsDuration.weeks * 7 + lostDays));

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
          (prescribedDrug.amtPerTime *
            prescribedDrug.timesPerDay *
            drugsDuration.weeks) /
            prescribedDrug.drug.packSize
        )
      );
    } else if (prescribedDrug.form.toLowerCase() === 'mes') {
      if (drugsDuration.weeks < 4) {
        qty = -1;
      } else {
        qty = Math.round(
          Number(
            (prescribedDrug.amtPerTime *
              prescribedDrug.timesPerDay *
              drugsDuration.weeks) /
              prescribedDrug.drug.packSize
          )
        );
      }
    } else if (prescribedDrug.form.toLowerCase() === 'ano') {
      if (drugsDuration.weeks < 52) {
        qty = -1;
      } else {
        qty = Math.round(
          Number(
            (prescribedDrug.amtPerTime *
              prescribedDrug.timesPerDay *
              drugsDuration.weeks) /
              prescribedDrug.drug.packSize
          )
        );
      }
    }

    prescribedDrug.qtyPrescribed = qty;
    return qty;
  }

  return { gettakeInstructions, getQtyPrescribed };
}
