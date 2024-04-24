import { useRepo } from 'pinia-orm';
import Drug from 'src/stores/models/drug/Drug';

const drug = useRepo(Drug);

export function useDrug() {
  function getDrugFirstLevelById(drugId: string) {
    return drug.query().withAllRecursive(1).where('id', drugId).first();
  }

  return {
    getDrugFirstLevelById,
  };
}
