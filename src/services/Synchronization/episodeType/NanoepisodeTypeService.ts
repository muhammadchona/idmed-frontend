import api from '../../api/apiService/apiService';
import { nSQL } from 'nano-sql';
import EpisodeType from 'src/stores/models/episodeType/EpisodeType';
import { useRepo } from 'pinia-orm';

const episodeType = useRepo(EpisodeType);

export default {
  async getFromBackEnd(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('episodeType?offset=' + offset + '&max=100')
        .then((resp) => {
          nSQL(EpisodeType.entity).query('upsert', resp.data).exec();
          episodeType.save(resp.data);
          console.log('Data synced from backend: EpisodeType');
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
