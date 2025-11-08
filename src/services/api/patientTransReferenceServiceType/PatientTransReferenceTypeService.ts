import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReferenceType from 'src/stores/models/transreference/PatientTransReferenceType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const patientTransReferenceType = useRepo(PatientTransReferenceType);
const patientTransReferenceTypeDexie = db[PatientTransReferenceType.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let patientTransReferenceTypeMobileCache: any[] = [];

const setPatientTransReferenceTypeMobileCache = (rows: any[]) => {
  patientTransReferenceTypeMobileCache = rows.map((row) => clone(row));
};

const getPatientTransReferenceTypeMobileCache = () =>
  patientTransReferenceTypeMobileCache.map((row) => clone(row));

const refreshPatientTransReferenceTypeMobileCache = async () => {
  const rows = await patientTransReferenceTypeDexie.toArray();
  setPatientTransReferenceTypeMobileCache(rows);
  return getPatientTransReferenceTypeMobileCache();
};

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
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('patientTransReferenceType', params);
      patientTransReferenceType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('patientTransReferenceType?offset=' + offset + '&max=100')
        .then((resp) => {
          patientTransReferenceType.save(resp.data);
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
      const resp = await api().patch(
        'patientTransReferenceType/' + uuid,
        params
      );
      patientTransReferenceType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('patientTransReferenceType/' + uuid);
      patientTransReferenceType.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return patientTransReferenceTypeDexie
      .put(payload)
      .then(async () => {
        await refreshPatientTransReferenceTypeMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  putMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return patientTransReferenceTypeDexie
      .put(payload)
      .then(async () => {
        await refreshPatientTransReferenceTypeMobileCache();
        return payload;
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  getMobile() {
    if (!isMobile.value) {
      return Promise.resolve([]);
    }
    return refreshPatientTransReferenceTypeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return patientTransReferenceTypeDexie
      .delete(paramsId)
      .then(async () => {
        patientTransReferenceTypeMobileCache =
          patientTransReferenceTypeMobileCache.filter((item) => item.id !== paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: any) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return patientTransReferenceTypeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshPatientTransReferenceTypeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/patientTransReferenceType?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReferenceType.getModel().$newInstance();
  },
  getAllFromStorage() {
    if (isMobile.value && !isOnline.value) {
      return getPatientTransReferenceTypeMobileCache();
    }
    return patientTransReferenceType.all();
  },
  getOperationType(operationType: string) {
    if (isMobile.value && !isOnline.value) {
      return (
        getPatientTransReferenceTypeMobileCache().find(
          (entry) => entry.code === operationType
        ) ?? null
      );
    }
    return patientTransReferenceType.where('code', operationType).first();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshPatientTransReferenceTypeMobileCache();
  },
};
