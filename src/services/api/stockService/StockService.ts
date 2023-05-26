import { useRepo } from 'pinia-orm';
import Stock from 'src/stores/models/stock/Stock';
import api from '../apiService/apiService';

const stock = useRepo(Stock);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('stock', params)
      .then((resp) => {
        stock.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stock?offset=' + offset)
        .then((resp) => {
          stock.save(resp.data);
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
  patch(id: number, params: string) {
    return api()
      .patch('stock/' + id, params)
      .then((resp) => {
        stock.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stock/' + id)
      .then(() => {
        stock.destroy(id);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stock.getModel().$newInstance();
  },
  apiGetDrugSummary(clinicId: string, drugId: string) {
    return api()
      .get(
        '/drugStockFile/sumary/?clinicId=' + clinicId + '&drugId=' + drugId + ''
      )
      .then((resp) => {
        stock.save(resp.data);
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
  },

  apiGetDrugBatchSummary(clinicId: string, stockId: string) {
    return api()
      .get(
        '/drugStockFile/batchsumary/?clinicId=' +
          clinicId +
          '&drugId=' +
          stockId +
          ''
      )
      .then((resp) => {
        stock.save(resp.data);
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
  },
};
