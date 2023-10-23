export function usePack() {
  function getDrugsString(pack: any) {
    let drugsString = '';
    Object.keys(pack.packagedDrugs).forEach(
      function (k: any) {
        const presDrug = pack.packagedDrugs[k];
        drugsString = drugsString + presDrug.drug.name;
      }.bind(pack)
    );
    return drugsString;
  }

  return { getDrugsString };
}
