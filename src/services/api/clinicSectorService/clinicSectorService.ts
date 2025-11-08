import { useRepo } from 'pinia-orm';
import { ClinicSector } from '../../../stores/models/clinic/ClinicHierarchy';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import clinicService from '../clinicService/clinicService';

const clinicSector = useRepo(ClinicSector);

const clinicSectorDexie = db[ClinicSector.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let clinicSectorMobileCache: any[] = [];

const setClinicSectorMobileCache = (rows: any[]) => {
  clinicSectorMobileCache = rows.map((row) => clone(row));
};

const getClinicSectorMobileCache = () =>
  clinicSectorMobileCache.map((row) => clone(row));

const refreshClinicSectorMobileCache = async () => {
  const rows = await clinicSectorDexie.toArray();
  setClinicSectorMobileCache(rows);
  return getClinicSectorMobileCache();
};

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
      return this.deleteMobile(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    showloading();
    return api()
      .post('clinicSector', params)
      .then((resp) => {
        clinicSector.save(resp.data);
        closeLoading();
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicSector.save(resp.data);
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
  patchWeb(uuid: string, params: string) {
    showloading();
    return api()
      .patch('clinicSector/' + uuid, params)
      .then((resp) => {
        clinicSector.save(resp.data);
        closeLoading();
      });
  },
  async deleteWeb(uuid: string) {
    return api()
      .delete('clinicSector/' + uuid)
      .then(() => {
        clinicSector.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    if (!isMobile.value) {
      return Promise.resolve(params);
    }
    const payload = clone(params);
    return clinicSectorDexie
      .put(payload)
      .then(async () => {
        await refreshClinicSectorMobileCache();
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
    return clinicSectorDexie
      .put(payload)
      .then(async () => {
        await refreshClinicSectorMobileCache();
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
    return clinicSectorDexie
      .toArray()
      .then((rows: any) => {
        setClinicSectorMobileCache(rows);
        return getClinicSectorMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return clinicSectorDexie
      .delete(paramsId)
      .then(async () => {
        clinicSectorMobileCache = clinicSectorMobileCache.filter(
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
    return clinicSectorDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshClinicSectorMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicSector.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicSectors() {
    // return clinicService.getAllClinicSectors()
    if (isMobile.value) {
      return getClinicSectorMobileCache();
    }
    return clinicSector.withAll().get();
  },

  getClinicSectorsById(clinicSectorId: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().find(
        (item) => item.id === clinicSectorId
      );
    }
    return clinicSector.withAll().where('id', clinicSectorId).first();
  },

  getClinicSectorsByClinicId(clinicId: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().filter(
        (item) => item.parentClinic_id === clinicId
      );
    }
    return clinicSector.query().where('parentClinic_id', clinicId).get();
  },

  getClinicSectorsByFacilityTypeId(clinicId: string, facilityTypeId: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().filter(
        (item) =>
          item.parentClinic_id === clinicId &&
          item.facilityTypeId === facilityTypeId
      );
    }
    return clinicSector
      .query()
      .where('parentClinic_id', clinicId)
      .where('facilityTypeId', facilityTypeId)
      .get();
  },

  getClinicSectorsByIdAndFacilityTypeId(id: string, facilityTypeId: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().filter(
        (item) => item.id === id && item.facilityTypeId === facilityTypeId
      );
    }
    return clinicSector
      .query()
      .where('id', id)
      .where('facilityTypeId', facilityTypeId)
      .get();
  },

  getActivebyClinicId(clinicId: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().filter(
        (item) => item.active && item.parentClinic_id === clinicId
      );
    }
    return clinicSector
      .query()
      .with('facilityType')
      .where((clinicSector) => {
        return clinicSector.active && clinicSector.parentClinic_id === clinicId;
      })
      .get();
  },
  getActiveUSClinicSectorByClinic(clinicId: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache()
        .filter((sector) => {
          const facilityTypeCode =
            sector?.facilityType?.code ?? sector?.facilityType?.CODE ?? '';
          const isAllowed =
            facilityTypeCode === 'PARAGEM_UNICA' ||
            facilityTypeCode === 'NORMAL';
          return (
            sector.active &&
            sector.parentClinic_id === clinicId &&
            isAllowed
          );
        })
        .sort((a, b) => String(a.code || '').localeCompare(b.code || ''));
    }
    return clinicSector
      .withAllRecursive(1)
      .where('active', true)
      .where((sector) => {
        return sector.parentClinic_id === clinicId;
      })
      .whereHas('facilityType', (query) => {
        query.where('code', 'PARAGEM_UNICA').orWhere('code', 'NORMAL');
      })
      .orderBy('code', 'asc')
      .get();
  },
  getClinicSectorByCode(code: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().find((sector) => sector.code === code);
    }
    return clinicSector.query().withAllRecursive(1).where('code', code).first();
  },
  getClinicSectorSlimByCode(code: string) {
    if (isMobile.value) {
      return getClinicSectorMobileCache().find((sector) => sector.code === code);
    }
    return clinicSector.query().where('code', code).first();
  },

  async getClinicSectorsDexie() {
    // const dexiDatabase1 = ClinicSector.entity;
    try {
      const clinicSectors = await clinicSectorDexie.toArray();
      if (isMobile.value) {
        setClinicSectorMobileCache(clinicSectors);
      } else {
        clinicSector.save(clinicSectors);
      }
      return clinicSectors;
    } catch (error) {
      console.error('Failed to get appointments:', error);
    }
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await clinicSectorDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshClinicSectorMobileCache();
  },
};
