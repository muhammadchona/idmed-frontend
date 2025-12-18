import { useMediaQuery } from '@vueuse/core';
import { Platform } from 'quasar';
import { computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
//import mixinplatform from '../mixins/mixin-system-platform'
const { isPharmacyDDD } = useSystemConfig();
export function useSystemUtils() {
  const isWebScreen = useMediaQuery('(min-width: 1024px)');
  const website = computed(() => (Platform.is.mobile ? false : true));
  const isDeskTop = computed(() => (Platform.is.desktop ? true : false));
  const isMobile = computed(() => (Platform.is.mobile ? true : false));
  const isElectron = computed(() => (Platform.is.electron ? true : false));

  const isOnline = computed(() => {
    if (website.value) return true;

    const clinicUsers = LocalStorage.getItem('clinicUsers');
    const userFacilityTypeCode = LocalStorage.getItem('userFacilityTypeCode');

    const userFacilityTypeCodes = [
      'FP',
      'FC',
      'PROVEDOR',
      'APE',
      'CLINICA_MOVEL',
      'BRIGADA_MOVEL',
      'PARAGEM_UNICA',
    ];

    return (
      !clinicUsers ||
      clinicUsers.includes('NORMAL') ||
      userFacilityTypeCodes.every(
        (code) => userFacilityTypeCode && userFacilityTypeCode.includes(code)
      )
    );
  });
  // const isOnline = computed(() => (isPharmacyDDD() ? false : true));
  //(LocalStorage.getItem('clinic_sectors') !== null && LocalStorage.getItem('clinic_sectors').includes('NORMAL'))
  return { website, isDeskTop, isMobile, isElectron, isOnline };
}
