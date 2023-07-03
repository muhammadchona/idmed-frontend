import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Inventory from 'src/stores/models/stockinventory/Inventory';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const inventory = useRepo(Inventory);
const { isMobile, isOnline } = useSystemUtils();

export default {
  // Axios API call
  async post(params: string) {
    if (isMobile.value ) {
      return  this.putMobile(params);
      } else {
    return this.postWeb(params);
      }
   
  },
  
  async get(offset: number) {

    if (isMobile.value) {
      return this.getMobile();
    } else {
     return  this.getWeb(offset);
    }
  },

  async patch(id: string, params: string) {
    if (isMobile.value) {
      return this.putMobile(params);
    } else {
     return  this.apiUpdateWeb(id, params);
    }
  },
 async  delete(id: number) {
    if (isMobile.value ) {
      return this.deleteMobile(id);
     } else {
      return this.deleteWeb(id);
     }
  },

 async apiFetchById(id: string) {
    if (isMobile.value ) {
      return this.apiFetchByIdMobile(id);
     } else {
      return this.apiFetchByIdWeb(id);
     }
  },

   

   async apiClose(id: string) {
    if (isMobile.value ) {
    return await api().patch(`/inventory/close/${id}`);
    } 
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
  
  // Pinia
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
  },

  //Mobile
 async  putMobile (params: any) {
  const resp = await  nSQL('inventorys').query('upsert',
   JSON.parse( JSON.stringify(params))
  ).exec()
    inventory.save(params)
    return resp
},

 getMobile () {
   return  nSQL('inventorys').query('select').exec().then(result => {
      console.log(result)
      inventory.save(result)
      //  return result
      })
},

async deleteMobile (id: any) {
 const resp = await nSQL('inventorys').query('delete').where(['id', '=', id]).exec()
 inventory.destroy(id)
 return resp
},

apiFetchByIdMobile(id: any) {
  return nSQL('inventorys').query('select').where(['id', '=', id]).exec().then(result => {
    console.log(result)
    inventory.save(result)
})

},


  // WEB
postWeb(params: string) {
  return api()
      .post('inventory', params)
      .then((resp) => {
        inventory.save(resp.data);
      })
},

getWeb(offset: number) {
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

apiUpdateWeb(id: any, params: any) {
  return api()
  .patch('inventory/' + id, params)
  .then((resp) => {
    inventory.save(resp.data);
  });
},

deleteWeb(id: any) {
  return api()
  .delete('inventory/' + id)
  .then(() => {
    inventory.destroy(id);
  });
},
apiFetchByIdWeb(id: string) {
  return api()
  .get('/inventory/' + id)
  .then((resp) => {
    inventory.save(resp.data);
    if (resp.data.length > 0) {
      setTimeout(this.get, 2);
    }
  });
}



};