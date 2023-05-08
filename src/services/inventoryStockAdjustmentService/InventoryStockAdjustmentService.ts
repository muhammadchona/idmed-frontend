import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { alert } from '../../components/Shared/Directives/Plugins/Dialog/dialog';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';

const inventoryStockAdjustment = useRepo(InventoryStockAdjustment);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('inventoryStockAdjustment', params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
  },
  
  get(offset: number) {
    if (offset >= 0) {
      return api()
      .get('inventoryStockAdjustment?offset=' + offset)
        .then((resp) => {
          inventoryStockAdjustment.save(resp.data);
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
      .patch('inventoryStockAdjustment/' + id, params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('inventoryStockAdjustment/' + id)
      .then(() => {
        inventoryStockAdjustment.destroy(id);
      });
  },
 
};