import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { InventoryStockAdjustment } from 'src/stores/models/stockadjustment/InventoryStockAdjustment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';


const { isMobile, isOnline } = useSystemUtils();
const inventoryStockAdjustment = useRepo(InventoryStockAdjustment);

export default {
  // Axios API call
  async post(params: string) {
    if (!isOnline.value ) {
      return  this.putMobile(params);
      } else {
    return this.postWeb(params);
      }
    },

  get(offset: number) {
    if (!isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }

  },
  async patch(id: string, params: string) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
     return  this.apiUpdateWeb(id, params);
    }
  },

  async delete(id: any) {
    if (!isOnline.value ) {
     return this.deleteMobile(id);
    } else {
     return this.deleteWeb(id);
    }
  },
  async apiFetchById(id: string) {
    if (!isOnline.value ) {
      return this.apiFetchByIdMobile(id);
      } else {
      return this.apiFetchByIdWeb(id);
      }
  },

    async apiGetAll(offset: number, max: number) {
      if (!isOnline.value ) {
        return this.apiGetAllMobile();
        } else {
        return this.apiGetAllWeb(offset,max);
        }
  },

    async apiSave(adjustment: any) {
    return await api().post('/inventoryStockAdjustment', adjustment);
  },

    async apiRemove(id: string) {
    return await api().delete(`/inventoryStockAdjustment/${id}`);
  },
  async apiUpdate(adjustment: any) {
    return await api().patch(
      '/inventoryStockAdjustment/' + adjustment.id,
      adjustment
    );
  },
  

  // Web


postWeb(params: string) {
  return api()
  .post('inventoryStockAdjustment', params)
  .then((resp) => {
    inventoryStockAdjustment.save(resp.data);
  });
},

getWeb(offset: number) {
  if (offset >= 0) {
    return api()
    .get('/inventoryStockAdjustment?offset=' + offset + '&max=100')
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
        offset = offset + 100;
        if (resp.data.length > 0) {
          this.get(offset);
        }
      })
  }
},

apiUpdateWeb(id: any, params: any) {
  return api()
      .patch('/inventoryStockAdjustment/' + id, params)
      .then((resp) => {
        inventoryStockAdjustment.save(resp.data);
      });
},

deleteWeb(id: any) {
  return api()
      .delete('/inventoryStockAdjustment/' + id)
      .then(() => {
        inventoryStockAdjustment.destroy(id);
      });
},
async apiFetchByIdWeb(id: string) {
  return await api().get(`/inventoryStockAdjustment/${id}`);
},
async apiGetAllWeb(offset: number, max: number) {
  return await  api().get(
    '/inventoryStockAdjustment?offset=' + offset + '&max=' + max
  )
},

  //Mobile

  async  putMobile (params: any) {
    const resp = await  nSQL('inventoryStockAdjustments').query('upsert',
     JSON.parse( JSON.stringify(params))
    ).exec()
      inventoryStockAdjustment.save(params)
      return resp
  },

   getMobile () {
     return  nSQL('inventoryStockAdjustments').query('select').exec().then(result => {
        console.log(result)
        inventoryStockAdjustment.save(result)
        //  return result
        })
  },

async deleteMobile (id: any) {
   const resp = await nSQL('inventoryStockAdjustments').query('delete').where(['id', '=', id]).exec()
   inventoryStockAdjustment.destroy(id)
   return resp
},

async apiFetchByIdMobile(id: any) {
    let resp = null
     await  nSQL('inventoryStockAdjustments').query('select').where(['id', '=', id]).exec().then(result => {
      resp = result
      inventoryStockAdjustment.save(result)
      
  })
  return resp
},

async apiGetAdjustmentsByInventoryIdMobile(id: any) {
   const resp = await nSQL('inventoryStockAdjustments').query('select').where(['inventory_id', '=', id]).exec()
   if (resp.length>0) {
    inventoryStockAdjustment.save( resp )
  }
    return resp
  
},
async apiGetAllMobile() {
  const resp = await  nSQL('inventoryStockAdjustments').query('select').exec()
 /* if (resp.length>0) {
    inventoryStockAdjustment.save( resp )
  }*/
    return resp
}

};