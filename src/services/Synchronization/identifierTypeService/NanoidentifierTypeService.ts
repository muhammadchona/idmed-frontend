import api from '../../api/apiService/apiService';
// import db from '../../../stores/dexie';
import identifierTypeService from 'src/services/api/identifierTypeService/identifierTypeService';

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('identifierType?offset=' + offset + '&max=100')
        .then((resp) => {
          identifierTypeService.addBulkMobile(resp.data);
          console.log('Data synced from backend: IdentifierType');
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
