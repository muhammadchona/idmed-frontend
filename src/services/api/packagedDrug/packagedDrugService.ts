import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrug from 'src/stores/models/packagedDrug/PackagedDrug';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { nSQL } from 'nano-sql';

const packagedDrug = useRepo(PackagedDrug);

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
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
  putMobile(params: string) {
    return nSQL(PackagedDrug.entity)
      .query('upsert', params)
      .exec()
      .then((resp) => {
        packagedDrug.save(resp[0].affectedRows);
      });
  },
  getMobile() {
    return nSQL(PackagedDrug.entity)
      .query('select')
      .exec()
      .then((rows: any) => {
        packagedDrug.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getAllByPackIdMobile(packId: any) {
    return nSQL(PackagedDrug.entity)
      .query('select')
      .where(['pack_id', '=', packId])
      .exec()
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
    return nSQL(PackagedDrug.entity)
      .query('delete')
      .where(['id', '=', paramsId])
      .exec()
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
};
