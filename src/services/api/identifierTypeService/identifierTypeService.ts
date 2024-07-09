import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import IdentifierType from 'src/stores/models/identifierType/IdentifierType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const identifierType = useRepo(IdentifierType);
const identifierTypeDexie = IdentifierType.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
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
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('identifierType', params)
      .then((resp) => {
        identifierType.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('identifierType?offset=' + offset + '&max=100')
        .then((resp) => {
          identifierType.save(resp.data);
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
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('identifierType/' + uuid, params)
      .then((resp) => {
        identifierType.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('identifierType/' + uuid)
      .then(() => {
        identifierType.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return db[identifierTypeDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        identifierType.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[identifierTypeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        identifierType.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[identifierTypeDexie]
      .toArray()
      .then((rows: any) => {
        identifierType.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[identifierTypeDexie]
      .delete(paramsId)
      .then(() => {
        identifierType.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },

  addBulkMobile(params: any) {
    return db[identifierTypeDexie]
      .bulkPut(params)
      .then(() => {
        identifierType.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return identifierType.getModel().$newInstance();
  },

  getAllIdentifierTypes() {
    return identifierType.query().withAll().get();
  },
  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('identifierType/identifierTypeFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            this.get(0);
            closeLoading();
          }
        });
    }
  },
};
