import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { alert } from '../../components/Shared/Directives/Plugins/Dialog/dialog';
import Inventory from 'src/stores/models/stockinventory/Inventory';

const inventory = useRepo(Inventory);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('inventory', params)
      .then((resp) => {
        inventory.save(resp.data);
      });
  },

  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('inventory?offset=' + offset)
        .then((resp) => {
          inventory.save(resp.data);
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
      .patch('inventory/' + id, params)
      .then((resp) => {
        inventory.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('inventory/' + id)
      .then(() => {
        inventory.destroy(id);
      });
  },
  apiClose(id: string, params: string) {
    return api()
      .patch('/inventory/close/' + id, params)
      .then((resp) => {
        inventory.save(resp.data);
      });
  },

  apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return api()
      .get(
        '/inventory/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
      )
      .then((resp) => {
        inventory.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },

  apiFetchById(id: string) {
    return api()
      .get('/inventory/' + id)
      .then((resp) => {
        inventory.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return inventory.getModel().$newInstance();
  },
};
