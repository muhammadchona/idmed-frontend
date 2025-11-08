import { useRepo } from 'pinia-orm';
import FacilityType from 'src/stores/models/facilityType/FacilityType';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const facilityType = useRepo(FacilityType);
const facilityTypeDexie = FacilityType.entity;
const facilityTypeTable = db[facilityTypeDexie];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let facilityTypeMobileCache: any[] = [];

const setFacilityTypeMobileCache = (rows: any[]) => {
  facilityTypeMobileCache = rows.map((row) => clone(row));
};

const getFacilityTypeMobileCache = () =>
  facilityTypeMobileCache.map((row) => clone(row));

const refreshFacilityTypeMobileCache = async () => {
  const rows = await facilityTypeTable.toArray();
  setFacilityTypeMobileCache(rows);
  return getFacilityTypeMobileCache();
};

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
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
      const resp = await api().post('facilityType', params);
      facilityType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('facilityType?offset=' + offset + '&max=100')
        .then((resp) => {
          facilityType.save(resp.data);
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
      const resp = await api().patch('facilityType/' + uuid, params);
      facilityType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('facilityType/' + uuid);
      facilityType.destroy(uuid);
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
    return facilityTypeTable
      .put(payload)
      .then(async () => {
        await refreshFacilityTypeMobileCache();
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
    return facilityTypeTable
      .put(payload)
      .then(async () => {
        await refreshFacilityTypeMobileCache();
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
    return refreshFacilityTypeMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return facilityTypeTable
      .delete(paramsId)
      .then(async () => {
        facilityTypeMobileCache = facilityTypeMobileCache.filter(
          (item) => item.id !== paramsId
        );
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
    return facilityTypeTable
      .bulkPut(payload)
      .then(async () => {
        await refreshFacilityTypeMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  /*Pinia Methods*/
  getAllFacilityTypes() {
    if (isMobile.value && !isOnline.value) {
      return getFacilityTypeMobileCache();
    }
    return facilityType.query().get();
  },
  getAllFacilityTypesWithoutUS() {
    if (isMobile.value && !isOnline.value) {
      return getFacilityTypeMobileCache().filter((entry) => entry.code !== 'US');
    }
    return facilityType
      .query()
      .where((query: any) => {
        return query.code != 'US';
      })
      .get();
  },

  getFacilityTypeClinics() {
    if (isMobile.value && !isOnline.value) {
      return getFacilityTypeMobileCache().filter((entry) => entry.type === 'clinic');
    }
    return facilityType
      .query()
      .where((query: any) => {
        return query.type === 'clinic';
      })
      .get();
  },
  getFacilityTypeClinicSector() {
    if (isMobile.value && !isOnline.value) {
      return getFacilityTypeMobileCache().filter(
        (entry) => entry.type === 'clinic_sector'
      );
    }
    return facilityType
      .query()
      .where((query: any) => {
        return query.type === 'clinic_sector';
      })
      .get();
  },
  getFacilityTypeClinicSectorForDC() {
    if (isMobile.value && !isOnline.value) {
      return getFacilityTypeMobileCache().filter((entry) => {
        return (
          entry.type === 'clinic_sector' &&
          entry.code !== 'PARAGEM_UNICA' &&
          entry.code !== 'PROVEDOR'
        );
      });
    }
    return facilityType
      .query()
      .where((query: any) => {
        return (
          query.type === 'clinic_sector' &&
          query.code !== 'PARAGEM_UNICA' &&
          query.code !== 'PROVEDOR'
        );
      })
      .get();
  },
  getFacilityTypeParagemUnica() {
    if (isMobile.value && !isOnline.value) {
      return (
        getFacilityTypeMobileCache().find(
          (entry) => entry.code === 'PARAGEM_UNICA'
        ) ?? null
      );
    }
    return facilityType
      .query()
      .where((query: any) => {
        return query.code === 'PARAGEM_UNICA';
      })
      .first();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshFacilityTypeMobileCache();
  },
};
