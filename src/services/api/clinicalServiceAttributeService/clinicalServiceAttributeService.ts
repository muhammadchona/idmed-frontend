import ClinicalServiceAttribute from 'src/stores/models/ClinicalServiceAttribute/ClinicalServiceAttribute';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import clinicalServiceService from '../clinicalServiceService/clinicalServiceService';

const clinicalServiceAttribute = useRepo(ClinicalServiceAttribute);
const clinicalServiceAttributeDexie = db[ClinicalServiceAttribute.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let clinicalServiceAttributeMobileCache: any[] = [];

const setClinicalServiceAttributeMobileCache = (rows: any[]) => {
  clinicalServiceAttributeMobileCache = rows.map((row) => clone(row));
};

const getClinicalServiceAttributeMobileCache = () =>
  clinicalServiceAttributeMobileCache.map((row) => clone(row));

const refreshClinicalServiceAttributeMobileCache = async () => {
  const rows = await clinicalServiceAttributeDexie.toArray();
  setClinicalServiceAttributeMobileCache(rows);
  return getClinicalServiceAttributeMobileCache();
};

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
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('clinicalServiceAttribute', params);
      clinicalServiceAttribute.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('clinicalServiceAttribute?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicalServiceAttribute.save(resp.data);
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
        'clinicalServiceAttribute/' + uuid,
        params
      );
      clinicalServiceAttribute.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('clinicalServiceAttribute/' + uuid);
      clinicalServiceAttribute.destroy(uuid);
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
    return clinicalServiceAttributeDexie
      .put(payload)
      .then(async () => {
        await refreshClinicalServiceAttributeMobileCache();
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
    return clinicalServiceAttributeDexie
      .put(payload)
      .then(async () => {
        await refreshClinicalServiceAttributeMobileCache();
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
    return refreshClinicalServiceAttributeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return clinicalServiceAttributeDexie
      .delete(paramsId)
      .then(async () => {
        clinicalServiceAttributeMobileCache =
          clinicalServiceAttributeMobileCache.filter(
            (item) => item.id !== paramsId
          );
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  addBulkMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    const payload = clone(params);
    return clinicalServiceAttributeDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshClinicalServiceAttributeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return clinicalServiceAttribute.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicalServiceAttrByClinicalService(clinicalServiceId: string) {
    if (isMobile.value && !isOnline.value) {
      return getClinicalServiceAttributeMobileCache().filter(
        (entry) => entry.service_id === clinicalServiceId
      );
    }
    return clinicalServiceAttribute
      .query()
      .with('clinicalServiceAttributeType')
      .where('service_id', clinicalServiceId)
      .get();
  },

  getAllClinicalServiceAttributes() {
    if (isMobile.value && !isOnline.value) {
      return getClinicalServiceAttributeMobileCache();
    }
    return clinicalServiceAttribute
      .query()
      .with('clinicalServiceAttributeType')
      .get();
  },
  checkWeatherAttExist(clinicalServiceId: string, att: string) {
    if (isMobile.value && !isOnline.value) {
      console.log(getClinicalServiceAttributeMobileCache());
      console.log(clinicalServiceService.getClinicalServiceMobileCache());
      const services = clinicalServiceService.getClinicalServiceMobileCache();
      console.log(att);
      return services.some((service) => {
        // 1. Must match the clinicalServiceId
        if (service.id !== clinicalServiceId) return false;

        // 2. Now check the attributes
        const attributes = service.clinicalServiceAttributes || [];

        return attributes.some((attr) => attr?.code === att);
      });
    }
    const csa = clinicalServiceAttribute
      .where('clinical_service_id', clinicalServiceId)
      .whereHas('clinicalServiceAttributeType', (query) => {
        query.where('code', att);
      })
      .first();
    return csa !== null && csa !== undefined;
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshClinicalServiceAttributeMobileCache();
  },
};
