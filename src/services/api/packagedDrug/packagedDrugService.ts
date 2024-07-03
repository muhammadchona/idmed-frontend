import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const packagedDrug = useRepo(PackagedDrug);
const packagedDrugDexie = PackagedDrug.entity;

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
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
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
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
      .post('packagedDrug', params)
      .then((resp) => {
        packagedDrug.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          packagedDrug.save(resp.data);
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
      .patch('packagedDrug/' + uuid, params)
      .then((resp) => {
        packagedDrug.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('packagedDrug/' + uuid)
      .then(() => {
        packagedDrug.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[packagedDrugDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        packagedDrug.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[packagedDrugDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        packagedDrug.save(JSON.parse(JSON.stringify(params)));
      });
  },
  getMobile() {
    return db[packagedDrugDexie]
      .toArray()
      .then((rows: any) => {
        packagedDrug.save(rows);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[packagedDrugDexie]
      .bulkAdd(params)
      .then(() => {
        packagedDrug.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getAllByPackIdMobile(packId: any) {
    return db[packagedDrugDexie]
      .where('pack_id')
      .equalsIgnoreCase(packId)
      .then((rows: any) => {
        return rows;
        //console.log(rows);
        // packagedDrug.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  deleteMobile(paramsId: string) {
    return db[packagedDrugDexie]
      .delete(paramsId)
      .then(() => {
        packagedDrug.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  async apiGetAllByPackId(packId: string) {
    return await api()
      .get('/packagedDrug/pack/' + packId)
      .then((resp) => {
        packagedDrug.save(resp.data);
      });
  },

  async apiGetAll() {
    return await api()
      .get('/packagedDrug?offset=' + 0 + '&max=' + 200)
      .then((resp) => {
        packagedDrug.save(resp.data);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrug.getModel().$newInstance();
  },
  getAllFromStorage() {
    return packagedDrug.all();
  },
  deleteAllFromStorage() {
    packagedDrug.flush();
  },
};
