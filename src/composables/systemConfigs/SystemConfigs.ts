import clinicService from 'src/services/api/clinicService/clinicService';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import { LocalStorage } from 'quasar';

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
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    if (
      userFacilityTypeCode === null ||
      userFacilityTypeCode !== 'FP' ||
      userFacilityTypeCode !== 'FC'
    ) {
      return false;
    } else return true;
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
