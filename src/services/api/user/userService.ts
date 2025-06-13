import SecUser from 'src/stores/models/userLogin/User';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const secUserRepo = useRepo(SecUser);
const secUserDexie = db[SecUser.entity];

const { closeLoading, showloading } = useLoading();
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
      this.getWeb(offset);
    }
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('secUser', params)
      .then((resp) => {
        secUserRepo.save(resp.data);
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('secUser?offset=' + offset + '&max=100')
        .then((resp) => {
          secUserRepo.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
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
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('secUser/' + uuid, params)
      .then((resp) => {
        // if (resp.data) {
        //   clinicSectorUsersRepo.where('user_id', resp.data.id).delete();
        //   secUserRoleRepo.where('user_id', resp.data.id).delete();
        // }
        secUserRepo.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('secUser/' + uuid)
      .then(() => {
        secUserRepo.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return secUserDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        secUserRepo.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return secUserDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        secUserRepo.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return secUserDexie
      .toArray()
      .then((rows: any) => {
        secUserRepo.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return secUserDexie
      .delete(paramsId)
      .then(() => {
        secUserRepo.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return secUserDexie
      .bulkAdd(params)
      .then(() => {
        secUserRepo.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },
  async apiSave(userLogin: any) {
    return this.post(userLogin);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return secUserRepo.getModel().$newInstance();
  },
  getAllFromStorage() {
    return secUserRepo.all();
  },

  getClinicsByUsername(username: string) {
    return secUserRepo.withAllRecursive(1).where('username', username).first();
  },

  getAllUsers() {
    return secUserRepo
      .query()
      .with('clinics', (query) => {
        query.with('province');
        query.with('facilityType');
        query.with('district', (query1) => {
          query1.with('province');
        });
        query.with('parentClinic', (query2) => {
          query2.with('province');
          query2.with('facilityType');
          query2.with('district', (query3) => {
            query3.with('province');
          });
        });
      })
      .get();
  },
};
