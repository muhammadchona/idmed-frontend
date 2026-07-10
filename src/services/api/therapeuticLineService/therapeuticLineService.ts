import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import TherapeuticLine from 'src/stores/models/therapeuticLine/TherapeuticLine';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const therapeuticLine = useRepo(TherapeuticLine);
const therapeuticLineDexie = db[TherapeuticLine.entity];

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
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('therapeuticLine', params);
      therapeuticLine.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticLine?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticLine.save(resp.data);
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
      const resp = await api().patch('therapeuticLine/' + uuid, params);
      therapeuticLine.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('therapeuticLine/' + uuid);
      therapeuticLine.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return therapeuticLineDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        therapeuticLine.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return therapeuticLineDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        therapeuticLine.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return therapeuticLineDexie
      .toArray()
      .then((rows: any) => {
        therapeuticLine.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return therapeuticLineDexie
      .delete(paramsId)
      .then(() => {
        therapeuticLine.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return therapeuticLineDexie
      .bulkPut(params)
      .then(() => {
        therapeuticLine.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getById(id: string) {
    return therapeuticLine
      .query()
      .where((therapeuticRegimen) => {
        return therapeuticRegimen.id === id;
      })
      .first();
  },

  //PINIA
  getAllFromStorage() {
    return therapeuticLine.all();
  },

  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    const therapeuticLineDexieItems = await therapeuticLineDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();

    return therapeuticLineDexieItems;
  },
};
