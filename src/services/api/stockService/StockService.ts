import { useRepo } from 'pinia-orm';
import Stock from 'src/stores/models/stock/Stock';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';

const stock = useRepo(Stock);
const { alertSucess, alertError } = useSwal();

export default {
  // Axios API call
  post(params: any) {
    return api()
      .post('stock', params)
      .then((resp) => {
        stock.save(resp.data);
      })
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stock?offset=' + offset + '&max=100')
        .then((resp) => {
          stock.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
      }
  },
  patch(id: string, params: any) {
    return api()
      .patch('stock/' + id, params)
      .then((resp) => {
        stock.save(resp.data);
      })
  },
  delete(id: string) {
    return api()
      .delete('stock/' + id)
      .then(() => {
        stock.destroy(id);
      })
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
  }
,
   async apiGetAll (offset: number, max: number) {
    return  api().get('/stock?offset=' + offset + '&max=' + max)
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
  }
  

};