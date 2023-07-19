import { useRepo } from 'pinia-orm';
import Stock from 'src/stores/models/stock/Stock';
import api from '../apiService/apiService';
import moment from 'moment';
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useLoading } from 'src/composables/shared/loading/loading';

const { closeLoading, showloading } = useLoading();




const { isMobile, isOnline } = useSystemUtils();

const stock = useRepo(Stock);

export default {
  // Axios API call
  post(params: any) {
    if (!isOnline.value) {
     return this.putMobile(params);
    } else {
     return this.postWeb(params);
    }
  },
  get(offset: number) {

    if (!isOnline.value) {
     return this.getMobile();
    } else {
      return this.getWeb(offset);
    }
   },
  patch(id: string, params: any) {
    if (!isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.apiUpdateWeb(id, params);
    }
     },

  async delete(id: string) {
    if (!isOnline.value ) {
      return this.deleteMobile(id);
    } else {
     return  this.deleteWeb(id);
    }
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stock.getModel().$newInstance();
  },  
   async apiSave (stock: any) {
    return  api().post('/stock', stock)
  },

   async apiRemove (id: any) {
    return  api().delete(`/stock/${id}`)
  },

   async apiUpdate (stock: any) {
    return api().patch('/stock/' + stock.id, stock)
  },

   async apiGetAll (offset: number, max: number) {
    return  api().get('/stock?offset=' + offset + '&max=' + max)
  },

  // PINIA
  getStockByDrug(drugId: string) {
    return stock.where('drug_id', drugId).
    orderBy('expireDate', 'desc').
    orderBy('stockMoviment', 'desc').get();
  },

  getValidStockByDrug(drug: any) {
    return stock
      .where('drug_id', drug.id)
      .where((stock) => {
        return  moment(stock.expireDate , 'YYYY-MM-DD').isAfter( moment().format('YYYY-MM-DD')) && stock.stockMoviment > 0 ;
      })
      .orderBy('expireDate', 'desc')
      .get();
  },


  getValidStockByDrugAndPickUpDate(drugId: string, pickupDate: string) {
    return stock
      .where('drug_id', drugId)
      .where((stock) => {
        return stock.expireDate > pickupDate && stock.stockMoviment > 0;
      })
      .orderBy('expireDate', 'asc')
      .get();
  },

  getStockList(id: string ) {
   return stock.query()
                .with('clinic')
                .with('entrance')
                .with('packagedDrugStocks')
                .with('adjustments')
                .with('drug')
                .where('id',id)
                .first()
  },

  getStockById(id: string) {
   return stock.query()
              //Stock.query()
              .with('drug')
              .with('clinic')
              .with('entrance')
              .with('center')
                      .where('id', id)
                      .first();
  },
  // Web
  postWeb(params: string) {
    return api()
    .post('stock', params)
    .then((resp) => {
      stock.save(resp.data);
      return resp.data
    })
  },
  
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stock?offset=' + offset + '&max=100')
        .then((resp) => {
          stock.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading()
          }
        })
    }
  },
  
  apiUpdateWeb(id: any, params: any) {
    return api()
      .patch('stock/' + id, params)
      .then((resp) => {
        stock.save(resp.data);
      })
  },
  
  deleteWeb(id: any) {
    return api()
        .delete('stock/' + id)
        .then(() => {
          stock.destroy(id);
        })
  },

  //Mobile
async putMobile (params: any) {
     const resp = await nSQL('stocks').query('upsert',
     JSON.parse( JSON.stringify(params))
    ).exec()
    stock.save(params);
    return resp
  },

   getMobile () {
   return nSQL().onConnected(() => {
     nSQL('stocks').query('select').exec().then(result => {
      console.log(result)
      stock.save(result)
       return result
      })
    })
  },

   getBystockMobile (stock: any) {
   return nSQL().onConnected(() => {
    nSQL('stocks').query('select').where(['stocks[id]', '=', stock.id]).exec().then(result => {
      console.log(result)
      stock.save(result)
    })
  })
},

async deleteMobile (id: any) {
   const resp = await  nSQL('stocks').query('delete').where(['id', '=', id]).exec()
  stock.destroy(id)
  return resp
},

 localDbGetAll () {
  return nSQL('stocks').query('select').exec().then(result => {
    return result 
    })
},

  localDbGetUsedStock (reportParams: any) {
  return nSQL('stocks').query('select').where(['drug.clinicalService.id', '=', reportParams.clinicalService]).exec().then(result => {
     console.log(result)
     return result
   })
},

  localDbGetById (stock: any) {
 return nSQL('stocks').query('select').where(['id', '=', stock.id]).exec().then(result => {
    console.log(result)
    // Stock.insert({ data: result })
    return result[0]
  })
},

 localDbGetByStockEntranceId (stockEntrance: any) {
return nSQL('stocks').query('select').where(['stocks[entrance_id]', '=', stockEntrance.id]).exec().then(result => {
  return result
})
},

 localDbGetByDrug (drug: any) {
return nSQL('stocks').query('select').where(['drug_id', '=', drug.id]).exec().then(result => {
 return result
})
}




};
