import clinicService from 'src/services/api/clinicService/clinicService';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';

export function useSystemConfig() {
  function isProvincialInstalation() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.value === 'PROVINCIAL' && !isPharmacyDDD();
    } else return false;
  }
  function localProvincialInstalationCode() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.description;
    } else return '';
  }

  function isPharmacyDDD() {
    /*
    console.log(clinicService.currClinic());
    const mode = clinicService.isPrivatePharmacy(clinicService.currClinic());
    if (mode === null) {
      return false;
    }
    return mode;
    */
    return false;
  }

  function isProvincialInstalationDDD() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.value === 'PROVINCIAL' && isPharmacyDDD();
    } else return false;
  }
  return {
    isProvincialInstalation,
    localProvincialInstalationCode,
    isPharmacyDDD,
    isProvincialInstalationDDD,
  };
}
