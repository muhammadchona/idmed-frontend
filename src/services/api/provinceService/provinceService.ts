import { useRepo } from 'pinia-orm';
import Province from 'src/stores/models/province/Province';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const province = useRepo(Province);
const provinceDexie = Province.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

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
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
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
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('province?offset=' + offset + '&max=100')
        .then((resp) => {
          province.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
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
    return db[provinceDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        province.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[provinceDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        province.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return db[provinceDexie]
      .toArray()
      .then((rows: any) => {
        province.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[provinceDexie]
      .delete(paramsId)
      .then(() => {
        province.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[provinceDexie]
      .bulkPut(params)
      .then(() => {
        province.save(params);
      })
      .catch((error: any) => {
        console.log(error);
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
    return province.query().with('districts').orderBy('code', 'asc').get();
  },

  getAllProvincesById(provinceId: string) {
    return province
      .withAllRecursive(1)
      .where('id', provinceId)
      .orderBy('code', 'asc')
      .first();
  },
  getAllProvincesByCode(code: string) {
    return province
      .withAllRecursive(1)
      .where('code', code)
      .orderBy('code', 'asc')
      .first();
  },
};
