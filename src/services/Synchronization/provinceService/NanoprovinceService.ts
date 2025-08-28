import api from '../../api/apiService/apiService';
import provinceService from 'src/services/api/provinceService/provinceService';
import Province from 'src/stores/models/province/Province';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const provinceDexie = db[Province.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('province?offset=' + offset + '&max=100')
        .then((resp) => {
          provinceDexie.bulkPut(resp.data);
          console.log('Data synced from backend: Province');
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromBackEnd(offset);
          }
        })
        .catch((error) => {
          console.error('Error syncing data from backend:', error);
          console.log(error);
        });
    }
  },

  async getFromBackEndToPinia(offset: number) {
    console.log('Data synced from backend To Piania Province');
    (await SynchronizationService.hasData(provinceDexie))
      ? await provinceService.getWeb(offset)
      : '';
  },

  async getFromPiniaToDexie() {
    console.log('Data synced from Pinia To Dexie Province');
    const getAllProvince = provinceService.getAllProvinces();
    await provinceDexie.bulkPut(getAllProvince);
  },
};
