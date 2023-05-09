import { useRepo } from 'pinia-orm';
import ReferedStockMoviment from 'src/stores/models/stockrefered/ReferedStockMoviment';
import api from '../apiService/apiService';

const referedStockMoviment = useRepo(ReferedStockMoviment);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('referedStockMoviment', params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('referedStockMoviment?offset=' + offset)
        .then((resp) => {
          referedStockMoviment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        }).catch((error) => {
          if (error.request != null) {
            const arrayErrors = JSON.parse(error.request.response);
            const listErrors = [];
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
            alert('Erro no registo', listErrors, null, null, null);
          } else if (error.request) {
            alert('Erro no registo', error.request, null, null, null);
          } else {
            alert('Erro no registo', error.message, null, null, null);
          }
        });
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('referedStockMoviment/' + id, params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stock/' + id)
      .then(() => {
        referedStockMoviment.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return referedStockMoviment.getModel().$newInstance();
  }
  

};