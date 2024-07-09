import api from '../../api/apiService/apiService';
import userClinicSectorsService from 'src/services/api/userClinicSectors/userClinicSectorsService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('userClinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          userClinicSectorsService.addBulkMobile(resp.data);
          console.log('Data synced from backend: UserClinicSectors');
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
