import api from '../apiService/apiService';
import { useRepo } from 'pinia-orm';
import destroyedStock from 'src/stores/models/stockdestruction/DestroyedStock';

import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();


const { isMobile, isOnline } = useSystemUtils();
const destroyedStockRepo = useRepo(destroyedStock)


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
  patch( params: any) {
    if (isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb( params);
    }
     },

  async delete(id: string) {
    if (isOnline.value ) {
      return this.deleteMobile(id);
    } else {
     return  this.deleteWeb(id);
    }
  },


  postWeb(params: string) {
    return api()
      .post('destroyedStock', params)
      .then((resp) => {
        destroyedStockRepo.save(resp.data);
      })
  },

  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
      .get('destroyedStock?offset=' + offset)
        .then((resp) => {
          destroyedStockRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading()
          }
        })
    }
  },
  deleteWeb(id: any) {
    return api()
      .delete('destroyedStock/' + id)
      .then(() => {
        destroyedStockRepo.destroy(id);
      });
  },
  async apiUpdateWeb(destroyedStock: any) {
    return await  api().patch('/destroyedStock', destroyedStock);
  },
// Mobile


async putMobile (params: any) {
  const resp = await nSQL('destroyedStocks').query('upsert',
  JSON.parse( JSON.stringify(params))
 ).exec()
 destroyedStockRepo.save(params);
 return resp
},

getMobile () {
return nSQL().onConnected(() => {
  nSQL('destroyedStocks').query('select').exec().then(result => {
   console.log(result)
   destroyedStockRepo.save(result)
    return result
   })
 })
},

getBystockMobile (stock: any) {
return nSQL().onConnected(() => {
 nSQL('destroyedStocks').query('select').where(['stocks[id]', '=', stock.id]).exec().then(result => {
   console.log(result)
   destroyedStockRepo.save(result)
 })
})
},

async deleteMobile (id: any) {
const resp = await  nSQL('destroyedStocks').query('delete').where(['id', '=', id]).exec()
destroyedStockRepo.destroy(id)
return resp
},

async localDbGetAll () {
  return nSQL(this.entity).query('select').exec().then(result => {
    console.log(result)
   // DestroyedStock.insertOrUpdate({ data: result })
    return result
    })
}

 
  

};