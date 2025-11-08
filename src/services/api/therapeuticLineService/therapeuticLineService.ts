import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import TherapeuticLine from 'src/stores/models/therapeuticLine/TherapeuticLine';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const therapeuticLine = useRepo(TherapeuticLine);
const therapeuticLineDexie = db[TherapeuticLine.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let therapeuticLineMobileCache: any[] = [];

const setTherapeuticLineMobileCache = (rows: any[]) => {
  therapeuticLineMobileCache = rows.map((row) => clone(row));
};

const getTherapeuticLineMobileCache = () =>
  therapeuticLineMobileCache.map((row) => clone(row));

const refreshTherapeuticLineMobileCache = async () => {
  const rows = await therapeuticLineDexie.toArray();
  setTherapeuticLineMobileCache(rows);
  return getTherapeuticLineMobileCache();
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
      const resp = await api().post('therapeuticLine', params);
      therapeuticLine.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticLine?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticLine.save(resp.data);
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
      const resp = await api().patch('therapeuticLine/' + uuid, params);
      therapeuticLine.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('therapeuticLine/' + uuid);
      therapeuticLine.destroy(uuid);
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
    return therapeuticLineDexie
      .put(payload)
      .then(async () => {
        await refreshTherapeuticLineMobileCache();
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
    return therapeuticLineDexie
      .put(payload)
      .then(async () => {
        await refreshTherapeuticLineMobileCache();
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
    return refreshTherapeuticLineMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return therapeuticLineDexie
      .delete(paramsId)
      .then(async () => {
        therapeuticLineMobileCache = therapeuticLineMobileCache.filter(
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
    return therapeuticLineDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshTherapeuticLineMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticLineMobileCache().find((entry) => entry.id === id);
    }
    return therapeuticLine
      .query()
      .where((therapeuticRegimen) => {
        return therapeuticRegimen.id === id;
      })
      .first();
  },

  //PINIA
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticLineMobileCache();
    }
    return therapeuticLine.all();
  },

  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await therapeuticLineDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshTherapeuticLineMobileCache();
  },
};
