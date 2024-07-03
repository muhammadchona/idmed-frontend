import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import RoleMenu from 'src/stores/models/userLogin/RoleMenu';
import db from '../../../stores/dexie';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const roleMenu = useRepo(RoleMenu);
const roleMenuDexie = RoleMenu.entity;

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      this.addMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('roleMenu', params);
      roleMenu.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('roleMenu?offset=' + offset + '&max=100')
        .then((resp) => {
          roleMenu.save(resp.data);
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
      const resp = await api().patch('roleMenu/' + uuid, params);
      roleMenu.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('roleMenu/' + uuid);
      roleMenu.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[roleMenuDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        roleMenu.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[roleMenuDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        roleMenu.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return db[roleMenuDexie]
      .toArray()
      .then((rows: any) => {
        roleMenu.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[roleMenuDexie]
      .delete(paramsId)
      .then(() => {
        roleMenu.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[roleMenuDexie]
      .bulkAdd(params)
      .then(() => {
        roleMenu.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  }, // Local Storage Pinia
  newInstanceEntity() {
    return roleMenu.getModel().$newInstance();
  },
  getAllFromStorage() {
    return roleMenu.all();
  },
  getAllByRole(roleId: any) {
    return roleMenu.query().where('role_id', roleId).get();
  },
};
