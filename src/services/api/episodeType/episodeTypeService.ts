import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import EpisodeType from 'src/stores/models/episodeType/EpisodeType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const episodeType = useRepo(EpisodeType);
const episodeTypeDexie = db[EpisodeType.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let episodeTypeMobileCache: any[] = [];

const setEpisodeTypeMobileCache = (rows: any[]) => {
  episodeTypeMobileCache = rows.map((row) => clone(row));
};

const getEpisodeTypeMobileCache = () =>
  episodeTypeMobileCache.map((row) => clone(row));

const refreshEpisodeTypeMobileCache = async () => {
  const rows = await episodeTypeDexie.toArray();
  setEpisodeTypeMobileCache(rows);
  return getEpisodeTypeMobileCache();
};

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('episodeType', params);
      episodeType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('episodeType?offset=' + offset + '&max=100')
        .then((resp) => {
          episodeType.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('episodeType/' + uuid, params);
      episodeType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('episodeType/' + uuid);
      episodeType.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return episodeTypeDexie
      .put(payload)
      .then(async () => {
        await refreshEpisodeTypeMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return episodeTypeDexie
      .put(payload)
      .then(async () => {
        await refreshEpisodeTypeMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return Promise.resolve([]);
    }
    return refreshEpisodeTypeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return episodeTypeDexie
      .delete(paramsId)
      .then(async () => {
        episodeTypeMobileCache = episodeTypeMobileCache.filter(
          (item) => item.id !== paramsId
        );
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return episodeTypeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshEpisodeTypeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  async apiFetchById(id: string) {
    return await api().get(`/episodeType/${id}`);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return episodeType.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getEpisodeTypeMobileCache();
    }
    return episodeType.all();
  },
  getEpisodeTypeByCode(code: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getEpisodeTypeMobileCache().find((entry) => entry.code === code) ?? null
      );
    }
    return episodeType.where('code', code).first();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await episodeTypeDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshEpisodeTypeMobileCache();
  },
};
