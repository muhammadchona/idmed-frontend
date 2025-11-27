import { useRepo } from 'pinia-orm';
import Drug from 'src/stores/models/drug/Drug';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import drugService from 'src/services/api/drugService/drugService';
const drug = useRepo(Drug);
const { isMobile, isOnline } = useSystemUtils();
export function useDrug() {
  function getDrugFirstLevelById(drugId: string) {
    if (isMobile.value && !isOnline.value) {
      return drugService.getDrugById(drugId);
    } else {
      return drug.query().withAllRecursive(1).where('id', drugId).first();
    }
  }

  return {
    getDrugFirstLevelById,
  };
}
