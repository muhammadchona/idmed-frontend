import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';

export function useSystemConfig() {
  function isProvincialInstalation() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.value === 'PROVINCIAL';
    } else return false;
  }
  function localProvincialInstalationCode() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.description;
    } else return '';
  }

  return { isProvincialInstalation, localProvincialInstalationCode };
}
