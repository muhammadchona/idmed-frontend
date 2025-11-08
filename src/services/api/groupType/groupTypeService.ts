import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import GroupType from 'src/stores/models/groupType/GroupType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const { isMobile, isOnline } = useSystemUtils();
const { closeLoading, showloading } = useLoading();
const groupType = useRepo(GroupType);

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

const normalizePayload = (payload: any) => {
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

let groupTypeMobileCache: any[] = [];

const setGroupTypeMobileCache = (rows: any[]) => {
  groupTypeMobileCache = rows.map((row) => clone(row));
};

const getGroupTypeMobileCache = () =>
  groupTypeMobileCache.map((row) => clone(row));

const refreshGroupTypeMobileCache = async () => {
  const rows = await nSQL(GroupType.entity).query('select').exec();
  setGroupTypeMobileCache(rows);
  return getGroupTypeMobileCache();
};

const findGroupTypeInCache = (predicate: (entry: any) => boolean) =>
  getGroupTypeMobileCache().find(predicate) ?? null;

export default {
  // Axios API call
  post(params: string) {
    return api()
      .post('groupType', params)
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  patch(id: number, params: string) {
    return api()
      .patch('groupType/' + id, params)
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('groupType/' + id)
      .then(() => {
        groupType.destroy(id);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('groupType?offset=' + offset + '&max=100')
        .then((resp) => {
          groupType.save(resp.data);
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
  async apiGetAllWeb() {
    return await api()
      .get('/groupType')
      .then((resp) => {
        groupType.save(resp.data);
      });
  },
  // Mobile
  putMobile(params: string) {
    const payload = normalizePayload(params);
    return nSQL(GroupType.entity)
      .query('upsert', payload)
      .exec()
      .then(async () => {
        if (isMobile.value) {
          await refreshGroupTypeMobileCache();
        } else {
          groupType.save(payload);
        }
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
      return nSQL(GroupType.entity)
        .query('select')
        .exec()
        .then((rows: any) => {
          groupType.save(rows);
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    return nSQL(GroupType.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        setGroupTypeMobileCache(rows);
        return getGroupTypeMobileCache();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  get() {
    if (!isOnline.value) {
      return this.getMobile();
    } else {
      this.apiGetAllWeb();
    }
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return groupType.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value) {
      return getGroupTypeMobileCache();
    }
    return groupType.all();
  },
  getByCode(code: string) {
    if (isMobile.value) {
      return findGroupTypeInCache((entry) => entry.code === code);
    }
    return groupType.query().where('code', code).first();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshGroupTypeMobileCache();
  },
};
