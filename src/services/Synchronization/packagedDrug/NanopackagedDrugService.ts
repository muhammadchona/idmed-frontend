import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('packagedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(PackagedDrug.entity).query('upsert', resp.data).exec();
          console.log('Data synced from backend: PackagedDrug');
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
};
