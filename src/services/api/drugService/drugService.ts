import { useRepo } from 'pinia-orm';
import Drug from 'src/stores/models/drug/drug';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();
const drug = useRepo(Drug);

export default {
  post(params: string) {
    return api()
      .post('drug', params)
      .then((resp) => {
        drug.save(resp.data);
        alertSucess('Sucesso!', 'O Registo foi efectuado com sucesso');
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug?offset=' + offset + '&maxt=100')
        .then((resp) => {
          drug.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  patch(id: string, params: string) {
    return api()
      .patch('drug?id=eq.' + id, params)
      .then((resp) => {
        drug.save(JSON.parse(resp.config.data));
        alertSucess('Sucesso!', 'O Registo foi alterado com sucesso');
      });
  },
  delete(id: number) {
    return api()
      .delete('drug/' + id)
      .then(() => {
        drug.destroy(id);
      });
  },
};
