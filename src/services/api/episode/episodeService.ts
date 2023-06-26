import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Episode from 'src/stores/models/episode/Episode';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const episode = useRepo(Episode);
const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('episode', params);
      episode.save(resp.data);
      alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('episode?offset=' + offset + '&max=100')
        .then((resp) => {
          episode.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          alertError('Aconteceu um erro inexperado nesta operação.');
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('episode/' + uuid, params);
      episode.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('episode/' + uuid);
      episode.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      alertError('Aconteceu um erro inexperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  putMobile(params: string) {
    return nSQL(episode.use?.entity)
      .query('upsert', params)
      .exec()
      .then(() => {
        episode.save(JSON.parse(params));
        alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return nSQL(episode.use?.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        episode.save(rows);
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return nSQL(episode.use?.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
      .then(() => {
        episode.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        alertError('Aconteceu um erro inexperado nesta operação.');
        console.log(error);
      });
  },
  async apiSave(episodeParams: any, isNew: boolean) {
    if (isNew) {
      return await this.post(episodeParams);
    } else {
      return await this.patch(episodeParams.id, episodeParams);
    }
  },

  async apiUpdate(episodeParams: any) {
    return await api().patch('/episode/' + episodeParams.id, episodeParams);
  },

  async apiRemove(episodeParams: any) {
    return await api().delete(`/episode/${episodeParams.id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/episode/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },

  async apiFetchById(id: string) {
    return await api().get(`/episode/${id}`);
  },

  async apiGetAllByIdentifierId(
    identifierId: string,
    offset: number,
    max: number
  ) {
    return await api()
      .get(
        '/episode/identifier/' +
          identifierId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        episode.save(resp.data);
        return resp;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return episode.getModel().$newInstance();
  },
  getAllFromStorage() {
    return episode.all();
  },
  getEntity() {
    return episode.getModel();
  },
  lastEpisodeByIdentifier(identifierId: string) {
    return episode
      .withAllRecursive(2)
      .where('patientServiceIdentifier_id', identifierId)
      .orderBy('episodeDate', 'desc')
      .first();
  },
  getlast3EpisodesByIdentifier(identifierId: string) {
    const episodes = episode
      .withAllRecursive(2)
      .where('patientServiceIdentifier_id', identifierId)
      .orderBy('episodeDate', 'desc')
      .limit(3)
      .get();
    if (episodes.length > 0) {
      episodes[0].isLast = true;
    }
    return episodes;
  },
  getEpisodeById(id: string) {
    return episode
      .withAllRecursive(2)
      .where('id', id)
      .orderBy('episodeDate', 'desc')
      .first();
  },

  /*
  lastEpisode() {
    return Episode.query()
    .with('startStopReason')
    .with('episodeType')
    .with('patientServiceIdentifier')
    .with('clinicSector.*')
    .where('patientServiceIdentifier_id', identifier.id)
    .orderBy('episodeDate', 'desc')
    .first()
  }
  */

  getStartEpisodeByIdentifierId(identifierId: string) {
    return episode
      .query()
      .with('startStopReason')
      .with('clinicSector')
      .with('patientServiceIdentifier')
      .with('patientVisitDetails', (query) => {
        query.withAllRecursive(2);
      })
      .has('patientVisitDetails')
      .whereHas('episodeType', (query) => {
        query.where('code', 'INICIO');
      })
      .where('patientServiceIdentifier_id', identifierId)
      .orderBy('creationDate', 'desc')
      .get();
  },

  getLastStartEpisodeWithPrescription(patientIdentifierid: string) {
    return episode
      .withAllRecursive(2)
      .whereHas('episodeType', (query) => {
        query.where('code', 'INICIO');
      })
      .has('patientVisitDetails')
      .where('patientServiceIdentifier_id', patientIdentifierid)
      .orderBy('episodeDate', 'desc')
      .first();
  },
  getLastStopEpisodeByIdentifier(identifierId: string) {
    return episode
      .with('startStopReason')
      .whereHas('episodeType', (query) => {
        query.where('code', 'FIM');
      })
      .where('patientServiceIdentifier_id', identifierId)
      .orderBy('episodeDate', 'desc')
      .first();
  },
  getLastStartEpisodeByIdentifier(identifierId: string) {
    return episode
      .withAllRecursive(1)
      .where('patientServiceIdentifier_id', identifierId)
      .whereHas('episodeType', (query) => {
        query.where('code', 'INICIO');
      })
      .orderBy('episodeDate', 'desc')
      .first();
  },
};
