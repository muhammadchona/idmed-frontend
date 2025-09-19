import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import UiSection from 'src/stores/models/userLogin/UiSection';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const uiSection = useRepo(UiSection);
const uiSectionDexie = db[UiSection.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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

  async postWeb(params: string) {
    try {
      const resp = await api().post('uiSection', params);
      uiSection.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('uiSection?offset=' + offset + '&max=100')
        .then((resp) => {
          uiSection.save(resp.data);
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
      const resp = await api().patch('uiSection/' + uuid, params);
      uiSection.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('uiSection/' + uuid);
      uiSection.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return uiSectionDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        uiSection.save(JSON.parse(JSON.stringify(params)));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return uiSectionDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        uiSection.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return uiSectionDexie
      .toArray()
      .then((rows: any) => {
        uiSection.save(rows);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return uiSectionDexie
      .delete(paramsId)
      .then(() => {
        uiSection.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return uiSectionDexie
      .bulkPut(params)
      .then(() => {
        uiSection.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll() {
    return await api().get('/uiSection');
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return uiSection.getModel().$newInstance();
  },
  getAllFromStorage() {
    return uiSection.all();
  },
  getAll() {
    return uiSection.query().withAll().get();
  },
  getAllByMenu(menuId: string) {
    return uiSection.query().withAll().where('menu_id', menuId).get();
  },
};
