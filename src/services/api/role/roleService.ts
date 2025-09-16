import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Role from 'src/stores/models/userLogin/Role';
import RoleMenu from 'src/stores/models/userLogin/RoleMenu';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import RoleUiSection from 'src/stores/models/userLogin/RoleUiSection';

const role = useRepo(Role);
const roleMenuRepo = useRepo(RoleMenu);
const roleUiSection = useRepo(RoleUiSection);
const roleDexie = db[Role.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
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
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      await this.patchWeb(uuid, params);
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
      const resp = await api().post('role', params);
      role.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('role?offset=' + offset + '&max=100')
        .then((resp) => {
          role.save(resp.data);
          Role.afterInsert?.(resp.data); // manually call it
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('role/' + uuid, params);
      console.log(resp.data);
      if (resp.data) {
        roleMenuRepo.where('role_id', resp.data.id).delete();
        roleUiSection.where('role_id', resp.data.id).delete();
      }
      role.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('role/' + uuid);
      role.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return roleDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        role.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return roleDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        role.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return roleDexie
      .toArray()
      .then((rows: any) => {
        role.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return roleDexie
      .delete(paramsId)
      .then(() => {
        role.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return roleDexie
      .bulkAdd(params)
      .then(() => {
        role.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll() {
    return await api().get('/role');
  },
  async apiSave(role: any) {
    return await api().post('/role', role);
  },
  async apiUpdate(role: any) {
    return await api().put('/role/', role);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return role.getModel().$newInstance();
    //  const instance = role.getModel().$newInstance();
    // instance.uiSections = []; // ✅ Add this
    //  console.log(instance);
    //  return instance;
  },
  getAllFromStorage() {
    return role.all();
  },
  getActiveWithMenus() {
    return role.query().with('menus').withAllRecursive(2).get();
  },
  getByAuthority(auth: any) {
    return role.query().where('authority', auth).first();
  },
  getAllWithMenus() {
    return role.query().with('menus').withAllRecursive(2).get();
  },
};
