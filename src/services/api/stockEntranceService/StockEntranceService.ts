import { useRepo } from 'pinia-orm';
import StockEntrance from 'src/stores/models/stockentrance/StockEntrance';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const stockEntrance = useRepo(StockEntrance);

const { isMobile, isOnline } = useSystemUtils();


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
  async apiUpdate(id: string, params: string) {
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

  apiFetchById(id: string) {
    if (!isOnline ) {
     return this.apiFetchByIdMobile(id);
    } else {
      return this.apiFetchByIdWeb(id);
    }
  },
   async apiGetAllByClinicId (clinicId: string, offset: number, max: number) {
    if (!isOnline) {
      this.apiGetAllByClinicIdMobile(clinicId);
    } else {
      this.apiGetAllByClinicIdWeb(clinicId, offset,max);
    }

  },

  // WEB
postWeb(params: string) {
  return api()
  .post('stockEntrance', params)
  .then((resp) => {
    stockEntrance.save(resp.data);
    return resp.data
  })
},

getWeb(offset: number) {
  if (offset >= 0) {
    return api()
      .get('stockEntrance?offset=' + offset + '&max=100')
      .then((resp) => {
        stockEntrance.save(resp.data);
        offset = offset + 100;
        if (resp.data.length > 0) {
          this.get(offset);
        }
      })
  }
},

apiUpdateWeb(id: any, params: any) {
  return api()
    .patch('stockEntrance/' + id, params)
    .then((resp) => {
      stockEntrance.save(resp.data);
    })
},

deleteWeb(id: any) {
  return api()
      .delete('stockEntrance/' + id)
      .then(() => {
        stockEntrance.destroy(id);
      })
},
apiFetchByIdWeb(id: string) {
  return api()
  .get('/inventory/' + id)
  .then((resp) => {
    stockEntrance.save(resp.data);
    if (resp.data.length > 0) {
      setTimeout(this.get, 2);
    }
  });
},

async apiGetAllByClinicIdWeb (clinicId: string, offset: number, max: number) {
  return await api().get('/stockEntrance/clinic/' + clinicId + '?offset=' + offset + '&max=' + max)

},

  //Mobile


 async  putMobile (params: any) {
    const resp = await  nSQL('stockEntrances').query('upsert',
     JSON.parse( JSON.stringify(params))
    ).exec()
      stockEntrance.save(params)
      return resp
  },

   getMobile () {
     return  nSQL('stockEntrances').query('select').exec().then(result => {
        console.log(result)
        stockEntrance.save(result)
        //  return result
        })
  },

   getByStockEntranceMobile (stockEntrance: any) {
    return nSQL('stockEntrances').query('select').where(['stockEntrances[id]', '=', stockEntrance.id]).exec().then(result => {
      console.log(result)
      stockEntrance.save(result)
    })
},

async deleteMobile (id: any) {
   const resp = await nSQL('stockEntrances').query('delete').where(['id', '=', id]).exec()
   stockEntrance.destroy(id)
   return resp
},

apiFetchByIdMobile(id: any) {
    return nSQL('stockEntrances').query('select').where(['id', '=', id]).exec().then(result => {
      console.log(result)
      stockEntrance.save(result)
  })

},

apiGetAllByClinicIdMobile(id: any){
  return nSQL().onConnected(() => {
    nSQL('stockEntrance').query('select').where(['stockEntrance[clinic_id]', '=', id]).exec().then(result => {
      console.log(result)
      stockEntrance.save(result)
    })
  })
},
  
  // Local Storage Pinia
  newInstanceEntity() {
    return stockEntrance.getModel().$newInstance();
  },
// ****** PNIA 
  getStockEntranceById (id: string) {
    return stockEntrance.query()
    .with('stocks')
    .with('clinic')
    .where('id', id)
    .first()
  },

  getStockEntrances() {
      return stockEntrance.query()
                                .with('clinic')
                                .with('stocks')
                                .orderBy('dateReceived', 'desc')
                                .get()
  }



};
