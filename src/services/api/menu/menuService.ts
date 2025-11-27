import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Menu from 'src/stores/models/userLogin/Menu';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const menu = useRepo(Menu);
const menuDexie = db[Menu.entity];

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

let menuMobileCache: any[] = [];

const setMenuMobileCache = (rows: any[]) => {
  menuMobileCache = rows.map((row) => clone(row));
};

const getMenuMobileCache = () => menuMobileCache.map((row) => clone(row));

const refreshMenuMobileCache = async () => {
  const rows = await menuDexie.toArray();
  setMenuMobileCache(rows);
  return getMenuMobileCache();
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
      return this.getMobile();
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
      const resp = await api().post('menu', params);
      menu.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('menu?offset=' + offset + '&max=100')
        .then((resp) => {
          menu.save(resp.data);
          if (isMobile.value && !isOnline.value) {
            this.addBulkMobile(resp.data);
          }
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
      const resp = await api().patch('menu/' + uuid, params);
      menu.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('menu/' + uuid);
      menu.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return menuDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          menu.save(JSON.parse(JSON.stringify(params)));
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(toPlainObject(params));
    return menuDexie
      .put(payload)
      .then(async () => {
        await refreshMenuMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return menuDexie
        .put(JSON.parse(JSON.stringify(params)))
        .then(() => {
          menu.save(JSON.parse(params));
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    const payload = clone(toPlainObject(params));
    return menuDexie
      .put(payload)
      .then(async () => {
        await refreshMenuMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return menuDexie
        .toArray()
        .then((rows: any) => {
          menu.save(rows);
        })
        .catch((error: any) => {
          console.log(error);
        });
    }
    return menuDexie
      .toArray()
      .then((rows: any) => {
        setMenuMobileCache(rows);
        return getMenuMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return menuDexie
        .delete(paramsId)
        .then(() => {
          menu.destroy(paramsId);
          alertSucess('O Registo foi removido com sucesso');
        })
        .catch((error: any) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
    return menuDexie
      .delete(paramsId)
      .then(() => {
        menuMobileCache = menuMobileCache.filter(
          (entry) => entry.id !== paramsId
        );
        alertSucess('O Registo foi removido com sucesso');
        return paramsId;
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    const payload = toPlainObject(params);
    return menuDexie
      .bulkPut(payload)
      .then(async () => {
        if (isMobile.value && !isOnline.value) {
          await refreshMenuMobileCache();
        } else {
          menu.save(payload);
        }
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiGetAll() {
    return await api().get('/menu');
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return menu.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getMenuMobileCache();
    }
    return menu.all();
  },
  getAll() {
    if (isMobile.value && !isOnline.value) {
      return getMenuMobileCache();
    }
    return menu.query().withAll().get();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshMenuMobileCache();
  },
};
