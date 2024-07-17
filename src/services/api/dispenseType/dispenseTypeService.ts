import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import DispenseType from 'src/stores/models/dispenseType/DispenseType';
import { useLoading } from 'src/composables/shared/loading/loading';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
const { closeLoading, showloading } = useLoading();

const dispenseType = useRepo(DispenseType);
const dispenseTypeDexie = DispenseType.entity;
const { isMobile, isOnline } = useSystemUtils();

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('dispenseType', params);
    dispenseType.save(resp.data);
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      if (offset >= 0) {
        return api()
          .get('dispenseType?offset=' + offset + '&max=100')
          .then((resp) => {
            dispenseType.save(resp.data);
            offset = offset + 100;
            if (resp.data.length > 0) {
              this.get(offset);
            } else {
              closeLoading();
            }
          });
      }
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('dispenseType/' + id, params);
    dispenseType.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('dispenseType/' + id);
    dispenseType.destroy(id);
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get('/dispenseType?offset=' + offset + '&max=' + max);
  },

  async apiFetchById(id: string) {
    return await api().get(`/dispenseType/${id}`);
  },
  addMobile(params: string) {
    return db[dispenseTypeDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        dispenseType.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return db[dispenseTypeDexie]
      .toArray()
      .then((rows: any) => {
        dispenseType.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return db[dispenseTypeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        dispenseType.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[dispenseTypeDexie]
      .bulkPut(params)
      .then(() => {
        dispenseType.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return dispenseType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return dispenseType.all();
  },
  getAllFromDuration(weeks: number) {
    let dispenseTypeList = [];

    if (weeks < 4) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DN';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 4) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DN' || value === 'DM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 8) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DN' || value === 'DM' || value === 'DB';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 12) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DM' || value === 'DT' || value === 'FRM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 16) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DM' || value === 'DB' || value === 'FRM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 20) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return value === 'DM' || value === 'FRM';
        })
        .orderBy('id', 'asc')
        .get();
    } else if (weeks === 24) {
      dispenseTypeList = dispenseType
        .where('code', (value: string) => {
          return (
            value === 'DM' ||
            value === 'DB' ||
            value === 'DT' ||
            value === 'DS' ||
            value === 'FRM'
          );
        })
        .orderBy('id', 'asc')
        .get();
    } else {
      dispenseTypeList = dispenseType.orderBy('id', 'asc').all();
    }

    return dispenseTypeList;
  },
  getById(id: string) {
    return dispenseType
      .query()
      .where((dispenseType) => {
        return dispenseType.id === id;
      })
      .get();
  },

  getAllForGroupDispense() {
    return dispenseType
      .where('code', (value: string) => {
        return (
          value === 'DM' || value === 'DT' || value === 'DS' || value === 'DA'
        );
      })
      .orderBy('id', 'asc')
      .get();
  },
};
