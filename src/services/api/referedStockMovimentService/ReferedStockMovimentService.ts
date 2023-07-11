import { useRepo } from 'pinia-orm';
import ReferedStockMoviment from 'src/stores/models/stockrefered/ReferedStockMoviment';
import api from '../apiService/apiService';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const { isMobile, isOnline } = useSystemUtils();

const referedStockMoviment = useRepo(ReferedStockMoviment);

export default {
  // Axios API call
  post(params: any) {
    if (isOnline.value) {
     return this.putMobile(params);
    } else {
     return this.postWeb(params);
    }
  },
  get(offset: number) {

    if (isOnline.value) {
     return this.getMobile();
    } else {
      return this.getWeb(offset);
    }
   },
  patch(id: string, params: any) {
    if (isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(id, params);
    }
     },

  async delete(id: string) {
    if (isOnline.value ) {
      return this.deleteMobile(id);
    } else {
     return  this.deleteWeb(id);
    }
  },

   async apiSave(referedStockMoviment: any) {
    return  api().post('/referedStockMoviment', referedStockMoviment);
  },

   async apiRemove(id: string) {
    return   api().delete(`/referedStockMoviment/${id}`);
  },
   async apiUpdate(referedStockMoviment: any) {
    return  api().patch(
      '/referedStockMoviment',
      referedStockMoviment
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return referedStockMoviment.getModel().$newInstance();
  },

  // WEB




  postWeb(params: any) {
    return api()
      .post('referedStockMoviment', params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      })
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('referedStockMoviment?offset=' + offset)
        .then((resp) => {
          referedStockMoviment.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  patchWeb(id: any, params: string) {
    return api()
      .patch('referedStockMoviment/' + id, params)
      .then((resp) => {
        referedStockMoviment.save(resp.data);
      });
  },
  deleteWeb(id: any) {
    return api()
      .delete('referedStockMoviment/' + id)
      .then(() => {
        referedStockMoviment.destroy(id);
      });
  },
   async apiGetAll(offset: number, max:number) {
    return  api().get(
      '/referedStockMoviment?offset=' + offset + '&max=' + max
    );
  },

  // MOBILE

  async putMobile (params: any) {
    const resp = await nSQL('referedStockMoviments').query('upsert',
    JSON.parse( JSON.stringify(params))
   ).exec()
   referedStockMoviment.save(params);
   return resp
 },

  getMobile () {
  return nSQL().onConnected(() => {
    nSQL('referedStockMoviments').query('select').exec().then(result => {
     console.log(result)
     referedStockMoviment.save(result)
      return result
     })
   })
 },

  getBystockMobile (stock: any) {
  return nSQL().onConnected(() => {
   nSQL('referedStockMoviments').query('select').where(['stocks[id]', '=', stock.id]).exec().then(result => {
     console.log(result)
     referedStockMoviment.save(result)
   })
 })
},

async deleteMobile (id: any) {
  const resp = await  nSQL('referedStockMoviments').query('delete').where(['id', '=', id]).exec()
  referedStockMoviment.destroy(id)
 return resp
},
async localDbGetAll () {
  return nSQL('referedStockMoviments').query('select').exec().then(result => {
    console.log(result)
    return result
    })
}


  

};