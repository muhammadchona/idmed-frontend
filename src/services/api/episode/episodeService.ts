import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Episode from 'src/stores/models/episode/Episode';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicSectorService from '../clinicSectorService/clinicSectorService';
import patientServiceIdentifierService from '../patientServiceIdentifier/patientServiceIdentifierService';
import { nSQL } from 'nano-sql';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import prescriptionService from '../prescription/prescriptionService';
import patientVisitService from '../patientVisit/patientVisitService';
import packService from '../pack/packService';

const episode = useRepo(Episode);
const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('episode', params)
      .then((resp) => {
        episode.save(resp.data);
      });
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
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('episode/' + uuid, params)
      .then((resp) => {
        episode.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('episode/' + uuid)
      .then(() => {
        episode.destroy(uuid);
      });
  },
  // Mobile
  async putMobile(params: string) {
    try {
      await nSQL(Episode.entity).query('upsert', params).exec();
      episode.save(JSON.parse(params));
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getMobile() {
    try {
      const rows = await nSQL(Episode.entity).query('select').exec();
      if (rows.length === 0) {
        api()
          .get('episode?offset=0&max=700')
          .then((resp) => {
            this.putMobile(resp.data);
          });
      } else {
        episode.save(rows);
      }
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await nSQL(Episode.entity)
        .query('delete')
        .where(['id', '=', paramsId])
        .exec();
      episode.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
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

  async apiGetLastByClinicSectorId(clinicSectorId: string) {
    return await api().get('/episode/clinicSector/' + clinicSectorId);
  },

  async syncEpisode(episode: any) {
    if (episode.syncStatus === 'R') await this.apiSave(episode, true);
    if (episode.syncStatus === 'U') await this.apiUpdate(episode);
  },

  async getLocalDbEpisodesToSync() {
    return nSQL(Episode.entity)
      .query('select')
      .where([['syncStatus', '=', 'R'], 'OR', ['syncStatus', '=', 'U']])
      .exec()
      .then((result) => {
        return result;
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
    if (episodes.length > 1) {
      episodes[0].isLast = true;
      episodes[1].isLast = false;
    } else if (episodes.length > 0) {
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
      .first();
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
  lastEpisode(identifierId: string) {
    return episode
      .with('startStopReason')
      .with('episodeType')
      .with('patientServiceIdentifier')
      .with('clinicSector')
      .where('patientServiceIdentifier_id', identifierId)
      .orderBy('episodeDate', 'desc')
      .first();
  },

  async doEpisodesBySectorGet() {
    console.log('user_sector' + localStorage.getItem('clinic_sector_users'));
    const clinicSectorUser = clinicSectorService.getClinicSectorSlimByCode(
      localStorage.getItem('clinic_sector_users')
    );
    this.apiGetLastByClinicSectorId(clinicSectorUser.id).then(async (resp) => {
      if (resp.data.length > 0) {
        console.log('epsiodioSecotr' + resp.data);
        resp.data.forEach(async (item: any) => {
          this.putMobile(item);
          console.log(item);
          patientServiceIdentifierService.putMobile(
            item.patientServiceIdentifier
          );
          // const i = 0;

          const respDetails =
            await patientVisitDetailsService.apiGetLastByEpisodeId(item.id);

          if (respDetails.data) {
            const pv = respDetails.data.patientVisit;
            respDetails.data.patientVisit = {};
            pv.patientVisitDetails[0] = respDetails.data;
            console.log(pv);

            const respPre = await prescriptionService.apiFetchById(
              respDetails.data.prescription.id
            );
            pv.patientVisitDetails[0].prescription = respPre.data;
            // patientVisitService.putMobile(pv);

            if (respDetails.data.pack !== null) {
              const respPack = await packService.apiFetchById(
                respDetails.data.pack.id
              );
              pv.patientVisitDetails[0].pack = respPack.data;
              patientVisitService.putMobile(pv);
            }
          }
          closeLoading();
        });
        // offset = offset + max
        // setTimeout(this.doEpisodesGet(clinicId, offset, max), 2)
      }
    });
  },
};
