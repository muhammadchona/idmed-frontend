import { useRepo } from 'pinia-orm';
import StockAlert from 'src/stores/models/stockAlert/StockAlert';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
const { alertSucess, alertError, alertWarning } = useSwal();
import { nSQL } from 'nano-sql';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import drugService from '../drugService/drugService';
import StockService from '../stockService/StockService';
import { v4 as uuidv4 } from 'uuid';
import { useStock } from 'src/composables/stock/StockMethod';

const stockMethod = useStock()
const { isMobile, isOnline } = useSystemUtils();
const stockAlert = useRepo(StockAlert);

export default {
  // Axios API call
  apiSave(params: string) {
    return api()
      .post('stockAlert', params)
      .then((resp) => {
        stockAlert.save(resp.data);
      });
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('stockAlert?offset=' + offset)
        .then((resp) => {
          stockAlert.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        })
    }
  },
  apiUpdate(id: number, params: string) {
    return api()
      .patch('stockAlert/' + id, params)
      .then((resp) => {
        stockAlert.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('stockAlert/' + id)
      .then(() => {
        stockAlert.destroy(id);
      });
  },

  apiFetchById(id: string) {
    return api()
      .get('/stockAlert/' + id)
      .then((resp) => {
        stockAlert.save(resp.data);
        if (resp.data.length > 0) {
          setTimeout(this.get, 2);
        }
      });
  },
  async apiGetStockAlertAll(clinicId: string) {
    if (isMobile.value) {
      const response = await this.localDbGetStockAlertMobile()
      stockAlert.save(response);
      return response

    } else {
      const resp =   await api().get(`/dashBoard/getStockAlertAll/${clinicId}`)
        stockAlert.save(resp.data);
        return resp
    }
    
  },

   apiGetStockAlert(clinicId: string, serviceCode: string) {
    return api().get(
      `/dashBoard/getStockAlert/${clinicId}/${serviceCode}`
    )
  },
  getStockAlertsByClinic() {
    return stockAlert.withAllRecursive(2)
      .get();
  },
  saveStockAlert(param: any) {
    stockAlert.save(param)
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return stockAlert.getModel().$newInstance();
  },


  // Mobile

   async localDbAddOrUpdate (targetCopy: any) {
    return nSQL().onConnected(() => {
      nSQL('stockAlerts').query('upsert',
      targetCopy
    ).exec()
    stockAlert.save( targetCopy)
  })
  },

   async localDbGetAll () {
   return nSQL('stockAlerts').query('select').exec().then(result => {
     stockAlert.save( result )
     return result
     })
 },

   async localDbGetStockAlertMobile () {
   const listStockAlert = []
  const drugList =  drugService.getActiveDrugs()
   for (const drug of drugList) {
    const hasStock = await drugService.hasStock(drug)
    if (hasStock) {
      const stockAlert = new StockAlert()
      const balance = await stockMethod.localDbGetStockBalanceByDrug(drug)
      const drugQuantitySupplied = await stockMethod.localDbGetQuantitySuppliedByDrug(drug)
      stockAlert.id = drug.id
      stockAlert.balance = balance
       stockAlert.drugName = drug.name
       stockAlert.drug = drug
       stockAlert.avgConsuption = drugQuantitySupplied / 3
       if (drugQuantitySupplied === 0) {
         stockAlert.state = 'Sem Consumo'
       } else if (stockAlert.balance > (drugQuantitySupplied / 3)) {
        stockAlert.state = 'Acima do Consumo Máximo'
       } else if (stockAlert.balance > (drugQuantitySupplied / 3)) {
        stockAlert.state = 'Ruptura de Stock'
       }
       listStockAlert.push(stockAlert)
  }
}

  return listStockAlert
 }
};
