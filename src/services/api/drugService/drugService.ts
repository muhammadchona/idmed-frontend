import { useRepo } from 'pinia-orm';
import Drug from 'src/stores/models/drug/drug';
import api from '../apiService/apiService';
import { alert } from 'src/components/Shared/Dialog/Dialog';
const drug = useRepo(Drug);

export default {
  post(params: string) {
    return api()
      .post('drug', params)
      .then((resp) => {
        drug.save(resp.data);
        alert(
          'Sucesso!',
          'O Registo foi efectuado com sucesso',
          null,
          null,
          null
        );
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('drug?offset=' + offset + '&limit=100')
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
        alert(
          'Sucesso!',
          'O Registo foi alterado com sucesso',
          null,
          null,
          null
        );
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
