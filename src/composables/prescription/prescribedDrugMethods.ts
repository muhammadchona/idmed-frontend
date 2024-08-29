import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';

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
    // const qtyRemainAux = 0;
    if (prescribedDrug.form.toLowerCase() === 'dia') {
      qty = Math.ceil(
        Number(
          (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * days) /
            prescribedDrug.drug.packSize
        )
      );
    } else if (prescribedDrug.form.toLowerCase() === 'semana') {
      qty = Math.ceil(
        Number(
          (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * weeks) /
            prescribedDrug.drug.packSize
        )
      );
    } else if (prescribedDrug.form.toLowerCase() === 'mes') {
      if (weeks < 4) {
        qty = -1;
      } else {
        qty = Math.ceil(
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
        qty = Math.ceil(
          Number(
            (prescribedDrug.amtPerTime * prescribedDrug.timesPerDay * weeks) /
              prescribedDrug.drug.packSize
          )
        );
      }
    }

    //  alert('quantidade: ' + qty);
    // prescribedDrug.quantityRemain = qtyRemainAux;

    return qty;
  }

  function getQtyRemain(packagedDrug: any, weeks: any) {
    if (weeks === null || weeks === '') return 0;
    let lostDays = parseInt(String((weeks / 4) * 2));
    if (weeks <= 1) lostDays = 0;
    const days = parseInt(String(weeks * 7 + lostDays));

    let qty = 0;
    let qtyRemainAux = 0;
    if (packagedDrug.form.toLowerCase() === 'dia') {
      qty = Math.ceil(
        Number(
          (packagedDrug.amtPerTime * packagedDrug.timesPerDay * days) /
            packagedDrug.drug.packSize
        )
      );

      qtyRemainAux =
        qty * packagedDrug.drug.packSize -
        packagedDrug.amtPerTime * packagedDrug.timesPerDay * days;
    } else if (packagedDrug.form.toLowerCase() === 'semana') {
      qty = Math.ceil(
        Number(
          (packagedDrug.amtPerTime * packagedDrug.timesPerDay * weeks) /
            packagedDrug.drug.packSize
        )
      );

      qtyRemainAux =
        qty * packagedDrug.drug.packSize -
        packagedDrug.amtPerTime * packagedDrug.timesPerDay * weeks;
    } else if (packagedDrug.form.toLowerCase() === 'mes') {
      if (weeks < 4) {
        qty = -1;
      } else {
        qty = Math.ceil(
          Number(
            (packagedDrug.amtPerTime * packagedDrug.timesPerDay * weeks) /
              packagedDrug.drug.packSize
          )
        );
        qtyRemainAux =
          qty * packagedDrug.drug.packSize -
          packagedDrug.amtPerTime * packagedDrug.timesPerDay * weeks;
      }
    } else if (packagedDrug.form.toLowerCase() === 'ano') {
      if (weeks < 52) {
        qty = -1;
      } else {
        qty = Math.ceil(
          Number(
            (packagedDrug.amtPerTime * packagedDrug.timesPerDay * weeks) /
              packagedDrug.drug.packSize
          )
        );
        qtyRemainAux =
          packagedDrug.drug.packSize * qty -
          packagedDrug.amtPerTime * packagedDrug.timesPerDay * weeks;
      }
    }

    //  alert('quantidade: ' + qty);
    // packagedDrug.quantityRemain = qtyRemainAux;

    return Number.isInteger(qtyRemainAux)
      ? qtyRemainAux
      : Number(qtyRemainAux).toFixed(1);
  }

  function getDecimalPart(number: any) {
    // Use the modulo operator (%) to get the remainder (decimal part)
    const decimalPart = number % 1;
    return decimalPart;
  }

  return { gettakeInstructions, getQtyPrescribed, getQtyRemain };
}
