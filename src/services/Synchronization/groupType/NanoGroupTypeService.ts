import api from '../../api/apiService/apiService';
import GroupType from 'src/stores/models/groupType/GroupType';
import groupTypeService from 'src/services/api/groupType/groupTypeService';
import SynchronizationService from '../SynchronizationService';
import db from 'src/stores/dexie';

const groupTypeDexie = db[GroupType.entity];

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('groupType?offset=' + offset + '&max=100')
        .then((resp) => {
          groupTypeDexie.bulkPut(resp.data);
          console.log('Data synced from backend: GroupType');
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
    console.log('Data synced from backend To Piania GroupType');
    (await SynchronizationService.hasData(groupTypeDexie))
      ? await groupTypeService.getWeb(offset)
      : '';
  },

  async getFromDexieToPinia() {
    console.log('Data synced from Dexie To Pinia GroupType');
    groupTypeService.getMobile();
  },
};
