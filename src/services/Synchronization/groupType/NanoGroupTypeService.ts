import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import GroupType from 'src/stores/models/groupType/GroupType';
import { useRepo } from 'pinia-orm';
import groupTypeService from 'src/services/api/groupType/groupTypeService';

const groupType = useRepo(GroupType);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('groupType?offset=' + offset + '&max=100')
        .then((resp) => {
          groupType.save(resp.data);
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
};
