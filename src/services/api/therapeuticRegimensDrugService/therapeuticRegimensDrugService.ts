import { useRepo } from 'pinia-orm';
import TherapeuticRegimensDrug from 'src/stores/models/TherapeuticRegimensDrug/TherapeuticRegimensDrug';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import db from '../../../stores/dexie';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const therapeuticRegimensDrug = useRepo(TherapeuticRegimensDrug);
const therapeuticRegimensDrugDexie = TherapeuticRegimensDrug.entity;

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
      const resp = await api().post('therapeuticRegimensDrug', params);
      therapeuticRegimensDrug.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('therapeuticRegimensDrug?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticRegimensDrug.save(resp.data);
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
      const resp = await api().patch('therapeuticRegimensDrug/' + uuid, params);
      therapeuticRegimensDrug.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('therapeuticRegimensDrug/' + uuid);
      therapeuticRegimensDrug.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[therapeuticRegimensDrugDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        therapeuticRegimensDrug.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[therapeuticRegimensDrugDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        therapeuticRegimensDrug.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[therapeuticRegimensDrugDexie]
      .toArray()
      .then((rows: any) => {
        therapeuticRegimensDrug.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[therapeuticRegimensDrugDexie]
      .delete(paramsId)
      .then(() => {
        therapeuticRegimensDrug.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[therapeuticRegimensDrugDexie]
      .bulkPut(params)
      .then(() => {
        therapeuticRegimensDrug.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
};
