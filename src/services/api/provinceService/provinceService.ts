import { useRepo } from 'pinia-orm';
import Province from 'src/stores/models/province/Province';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const province = useRepo(Province);
const provinceDexie = db[Province.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let provinceMobileCache: any[] = [];

const setProvinceMobileCache = (rows: any[]) => {
  provinceMobileCache = rows.map((row) => clone(row));
};

const getProvinceMobileCache = () => provinceMobileCache.map((row) => clone(row));

const refreshProvinceMobileCache = async () => {
  const rows = await provinceDexie.toArray();
  setProvinceMobileCache(rows);
  return getProvinceMobileCache();
};

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      return this.getMobile();
    } else {
      return this.getWeb(offset);
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
      const resp = await api().post('province', params);
      province.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('province?offset=' + offset + '&max=100')
        .then((resp) => {
          province.save(resp.data);
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
      const resp = await api().patch('province/' + uuid, params);
      province.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('province/' + uuid);
      province.destroy(uuid);
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
    return provinceDexie
      .put(payload)
      .then(async () => {
        await refreshProvinceMobileCache();
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
    return provinceDexie
      .put(payload)
      .then(async () => {
        await refreshProvinceMobileCache();
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
    return refreshProvinceMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return provinceDexie
      .delete(paramsId)
      .then(async () => {
        provinceMobileCache = provinceMobileCache.filter(
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
    return provinceDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshProvinceMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiFetchById(id: string) {
    return await api().get(`/province/${id}`);
  },

  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  // Pinia LocalBase
  apiGetAllWithDistricts() {
    // return province.query().with('districts').has('code').get();
    return province.query().with('districts').get();
  },

  getAllProvinces() {
    if (isMobile.value && !isOnline.value) {
      return getProvinceMobileCache().sort((a, b) =>
        String(a.code || '').localeCompare(String(b.code || ''))
      );
    }
    return province.withAllRecursive(1).orderBy('code', 'asc').get();
  },

  getAllProvincesById(provinceId: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getProvinceMobileCache().find((entry) => entry.id === provinceId) ?? null
      );
    }
    return province
      .withAllRecursive(1)
      .where('id', provinceId)
      .orderBy('code', 'asc')
      .first();
  },
  getAllProvincesByCode(code: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getProvinceMobileCache().find((entry) => entry.code === code) ?? null
      );
    }
    return province
      .withAllRecursive(1)
      .where('code', code)
      .orderBy('code', 'asc')
      .first();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshProvinceMobileCache();
  },
};
