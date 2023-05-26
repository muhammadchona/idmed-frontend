import { useRepo } from 'pinia-orm';
import { StockDestructionAdjustment } from 'src/stores/models/stockadjustment/StockDestructionAdjustment';
import api from '../apiService/apiService';

const stockDestructionAdjustment = useRepo(StockDestructionAdjustment);

export default {
  apiSave(params: String) {
    return api()
      .post('stockDestructionAdjustment', params)
      .then((resp) => {
        stockDestructionAdjustment.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockDestructionAdjustment?offset=' + offset)
        .then((resp) => {
          stockDestructionAdjustment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
        .catch((error) => {
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
            alert(listErrors, null, null, null);
          } else if (error.request) {
            alert(error.request, null, null, null);
          } else {
            alert(error.message, null, null, null);
          }
        });
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockDestructionAdjustment/' + id, params)
      .then((resp) => {
        stockDestructionAdjustment.save(resp.data);
      });
  },
  apiRemove(id: number) {
    return api()
      .delete('stockDestructionAdjustment/' + id)
      .then(() => {
        stockDestructionAdjustment.destroy(id);
      });
  },
};
