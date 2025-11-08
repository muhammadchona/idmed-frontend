import { useRepo } from 'pinia-orm';
import District from 'src/stores/models/district/District';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const district = useRepo(District);
const districtDexie = db[District.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const toPlainObject = (payload: any) => {
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      console.log(error);
      return payload;
    }
  }
  return payload;
};

const resolveId = (value: any) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.id ?? value;
      }
      return parsed;
    } catch {
      return value;
    }
  }
  if (typeof value === 'object' && value !== null) {
    return value.id ?? value;
  }
  return value;
};

let districtMobileCache: any[] = [];

const setDistrictMobileCache = (rows: any[]) => {
  districtMobileCache = rows.map((row) => clone(row));
};

const getDistrictMobileCache = () => districtMobileCache.map((row) => clone(row));

const refreshDistrictMobileCache = async () => {
  const rows = await districtDexie.toArray();
  setDistrictMobileCache(rows);
  return getDistrictMobileCache();
};

const findDistrictInCache = (predicate: (entry: any) => boolean) =>
  getDistrictMobileCache().find(predicate) ?? null;

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.postWeb(params);
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
      const resp = await api().post('district', params);
      district.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('district?offset=' + offset + '&max=100')
        .then((resp) => {
          district.save(resp.data);
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
      const resp = await api().patch('district/' + uuid, params);
      district.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('district/' + uuid);
      district.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return districtDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          district.save(JSON.parse(params));
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(toPlainObject(params));
    return districtDexie
      .put(payload)
      .then(async () => {
        await refreshDistrictMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return districtDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          district.save(JSON.parse(params));
          // alertSucess('O Registo foi efectuado com sucesso');
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    const payload = clone(toPlainObject(params));
    return districtDexie
      .put(payload)
      .then(async () => {
        await refreshDistrictMobileCache();
        return payload;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return districtDexie
        .toArray()
        .then((rows: any) => {
          district.save(rows);
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    return districtDexie
      .toArray()
      .then((rows: any) => {
        setDistrictMobileCache(rows);
        return getDistrictMobileCache();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return districtDexie
        .delete(JSON.parse(paramsId))
        .then(() => {
          district.destroy(paramsId);
          alertSucess('O Registo foi removido com sucesso');
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    const key = resolveId(paramsId);
    return districtDexie
      .delete(key)
      .then(() => {
        districtMobileCache = districtMobileCache.filter(
          (entry) => resolveId(entry) !== key
        );
        alertSucess('O Registo foi removido com sucesso');
        return key;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return districtDexie
        .bulkPut(params)
        .then(() => {
          district.save(params);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = toPlainObject(params);
    return districtDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshDistrictMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async apiGetAll(offset: number, max: number) {
    return await api().get('/district?offset=' + offset + '&max=' + max);
  },
  getAllDistrictByProvinceId(provinceid: string) {
    if (isMobile.value) {
      return getDistrictMobileCache().filter(
        (entry) => entry.province_id === provinceid
      );
    }
    return district
      .query()
      .with('province')
      .where('province_id', provinceid)
      .get();
  },
  getAllDistrictByDescription(description: string) {
    if (isMobile.value) {
      return (
        findDistrictInCache((entry) => entry.description === description) ?? null
      );
    }
    return district
      .query()
      .with('province')
      .where('description', description)
      .first();
  },
  getDistrictById(id: string) {
    if (isMobile.value) {
      return findDistrictInCache((entry) => entry.id === id);
    }
    return district.query().with('province').where('id', id).first();
  },
  getAllFromStorage() {
    if (isMobile.value) {
      return getDistrictMobileCache();
    }
    return district.all();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshDistrictMobileCache();
  },
};
