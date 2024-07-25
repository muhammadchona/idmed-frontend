import clinicService from 'src/services/api/clinicService/clinicService';
import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';
import { LocalStorage } from 'quasar';

export function useSystemConfig() {
  function isProvincialInstalation() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.value === 'PROVINCIAL';
    } else return false;
  }
  function isProvincialInstalationPharmacysMode() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return (
        instalationType.value === 'PROVINCIAL' && isPharmacyDDDOrAPEOrDCP()
      );
    } else return false;
  }
  function localProvincialInstalationCode() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.description;
    } else return '';
  }

  function isPharmacyDDDOrAPEOrDCP() {
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    return (
      userFacilityTypeCode === 'FP' ||
      userFacilityTypeCode === 'FC' ||
      userFacilityTypeCode === 'APE' ||
      userFacilityTypeCode === 'PROVEDOR'
    );
  }

  function isOnlyPharmacyDDDO() {
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    return userFacilityTypeCode === 'FP' || userFacilityTypeCode === 'FC';
  }
  function isOnlyComunitaryDispense() {
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    return (
      userFacilityTypeCode === 'CLINICA_MOVEL' ||
      userFacilityTypeCode === 'BRIGADA_MOVEL' ||
      userFacilityTypeCode === 'APE' ||
      userFacilityTypeCode === 'PROVEDOR'
    );
  }

  function isMobileClinic() {
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    return (
      userFacilityTypeCode === 'CLINICA_MOVEL' ||
      userFacilityTypeCode === 'BRIGADA_MOVEL'
    );
  }

  function isDCP() {
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    return userFacilityTypeCode === 'PROVEDOR';
  }

  function isUserAPE() {
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    return userFacilityTypeCode && userFacilityTypeCode === 'APE';
  }

  function isProvincialInstalationMobileClinic() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.value === 'PROVINCIAL' && isMobileClinic();
    } else return false;
  }
  return {
    isProvincialInstalation,
    localProvincialInstalationCode,
    isMobileClinic,
    isProvincialInstalationMobileClinic,
    isProvincialInstalationPharmacysMode,
    isUserAPE,
    isPharmacyDDDOrAPEOrDCP,
    isOnlyPharmacyDDDO,
    isOnlyComunitaryDispense,
  };
}
