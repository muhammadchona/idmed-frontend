import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Inventory from 'src/stores/models/stockinventory/Inventory';


const inventory = useRepo(Inventory);

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('inventory', params)
      .then((resp) => {
        inventory.save(resp.data);
      })
  },
  
  get(offset: number) {
    if (offset >= 0) {
      return api()
      .get('inventory?offset=' + offset + '&max=100')
        .then((resp) => {
          inventory.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  patch(id: string, params: string) {
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

  apiFetchById(id: string) {
    return api().get(
      '/inventory/' + id ) .then((resp) => {
      inventory.save(resp.data);
      if (resp.data.length > 0) {
        setTimeout(this.get, 2);
      }
    });
  },

    async apiSave(inventory: any) {
    return await api().post('/inventory', inventory);
  },

   async apiUpdate(id: string, inventory: any) {
    return await api().patch('/inventory/' + id, inventory);
  },

   async apiClose(id: string) {
    return await api().patch(`/inventory/close/${id}`);
  },

   async apiRemove(id: string) {
    return await api().delete(`/inventory/${id}`);
  },

   async apiGetAllByClinicId(clinicId: string, offset: number, max:number ) {
    return await api().get(
      '/inventory/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

   async apiGetAll(offset: number, max: number) {
    return await api().get('/inventory?offset=' + offset + '&max=' + max);
  },
  
  // Local Storage Pinia
  newInstanceEntity() {
    return inventory.getModel().$newInstance();
  },
  
  getInventories() {
    return inventory.withAllRecursive(2)
    .orderBy('open', 'desc')
    .orderBy('startDate', 'desc')
    .get()
  },

  getOpenInventory() {
    return inventory.query().where('open', true).first()
  },
  getLastInventory() {
    return inventory.query().orderBy('endDate', 'desc').first();
  },
  getInvnetoryById(id: string) {
    return  inventory.query().withAllRecursive(2).where('id', id).first()
  }

};