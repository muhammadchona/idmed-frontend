import systemConfigsService from 'src/services/api/systemConfigs/systemConfigsService';

export function useSystemConfig() {
  function isProvincialInstalation() {
    const instalationType = systemConfigsService.getInstallationType();

    if (instalationType !== null && instalationType !== undefined) {
      return instalationType.value === 'PROVINCIAL';
    } else return false;
  }

  return { isProvincialInstalation };
}
