import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import TherapeuticRegimen from 'src/stores/models/therapeuticRegimen/TherapeuticRegimen';
import db from '../../../stores/dexie';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const therapeuticRegimen = useRepo(TherapeuticRegimen);
const therapeuticRegimenDexie = db[TherapeuticRegimen.entity];

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

const clone = (payload: any) =>
  payload === undefined || payload === null
    ? payload
    : JSON.parse(JSON.stringify(payload));

let therapeuticRegimenMobileCache: any[] = [];

const setTherapeuticRegimenMobileCache = (rows: any[]) => {
  therapeuticRegimenMobileCache = rows.map((row) => clone(row));
};

const getTherapeuticRegimenMobileCache = () =>
  therapeuticRegimenMobileCache.map((row) => clone(row));

const refreshTherapeuticRegimenMobileCache = async () => {
  const rows = await therapeuticRegimenDexie.toArray();
  setTherapeuticRegimenMobileCache(rows);
  return getTherapeuticRegimenMobileCache();
};

const matchesClinicalService = (entry: any, clinicalServiceId: string) => {
  const candidateIds = [
    entry?.clinical_service_id,
    entry?.clinicalServiceId,
    entry?.clinicalService?.id,
  ];
  return candidateIds.some((id) => id && id === clinicalServiceId);
};

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  async get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      return await this.getMobile();
    } else {
      return await this.getWeb(offset);
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
      const resp = await api().post('therapeuticRegimen', params);
      therapeuticRegimen.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('therapeuticRegimen?offset=' + offset + '&max=100')
        .then((resp) => {
          therapeuticRegimen.save(resp.data);
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
  getFromProvincial(offset: number) {
    if (offset >= 0) {
      return api()
        .get('therapeuticRegimen/therapeuticRegimenFromProvicnial/' + offset)
        .then((resp) => {
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getFromProvincial(offset);
          } else {
            this.get(0);
            alertSucess('Lista actualizada com sucesso');
          }
        });
    }
  },
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('therapeuticRegimen/' + uuid, params);
      therapeuticRegimen.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('therapeuticRegimen/' + uuid);
      therapeuticRegimen.destroy(uuid);
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
    return therapeuticRegimenDexie
      .put(payload)
      .then(async () => {
        await refreshTherapeuticRegimenMobileCache();
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
    return therapeuticRegimenDexie
      .put(payload)
      .then(async () => {
        await refreshTherapeuticRegimenMobileCache();
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
    return refreshTherapeuticRegimenMobileCache().catch((error: any) => {
      console.log(error);
      throw error;
    });
  },
  deleteMobile(paramsId: string) {
    if (!isMobile.value) {
      return Promise.resolve();
    }
    return therapeuticRegimenDexie
      .delete(paramsId)
      .then(async () => {
        therapeuticRegimenMobileCache = therapeuticRegimenMobileCache.filter(
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
    return therapeuticRegimenDexie
      .bulkPut(payload)
      .then(async () => {
        await refreshTherapeuticRegimenMobileCache();
      })
      .catch((error: any) => {
        console.log(error);
        throw error;
      });
  },

  async getInMobileById(id: string) {
    const resp = await therapeuticRegimenDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first();

    ///  patientVisitDetails.save(resp);
    return resp;
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return therapeuticRegimen.getModel().$newInstance();
  },

  getAllTherapeuticalRegimens() {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache();
    }
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .with('clinicalService')
      .with('prescriptionDetails')
      .get();
  },

  getAllActiveTherapeuticalRegimens() {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().filter((entry) => entry.active);
    }
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('active', true)
      .get();
  },

  getActiveTherapeuticalRegimens() {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().filter((entry) => entry.active);
    }
    return therapeuticRegimen.query().where('active', true).get();
  },

  getAllActiveTherapeuticalRegimensByclinicalService(clinicalServiceId: any) {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().filter((entry) => {
        return matchesClinicalService(entry, clinicalServiceId) && entry.active;
      });
    }
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where((therapeuticRegimen) => {
        return (
          (therapeuticRegimen.clinical_service_id === clinicalServiceId ||
            therapeuticRegimen.clinicalServiceId === '') &&
          therapeuticRegimen.active === true
        );
      })
      .get();
  },

  getAllTherapeuticalRegimensByclinicalService(clinicalServiceId: any) {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().filter((entry) =>
        matchesClinicalService(entry, clinicalServiceId)
      );
    }
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
        });
      })
      .where('clinical_service_id', clinicalServiceId)
      .get();
  },

  getAllTherapeuticalByclinicalService(clinicalServiceId: any) {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().filter((entry) => {
        return entry.active && matchesClinicalService(entry, clinicalServiceId);
      });
    }
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
        query.with('clinicalService', (query) => {
          query.with('identifierType');
          query.where('clinical_service_id', clinicalServiceId);
        });
      })
      .where('active', true)
      .get();
  },
  getAllActiveTherapeuticalHasNoClinicalService() {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().filter((entry) => {
        return (
          entry.active &&
          (!entry.clinical_service_id || entry.clinical_service_id === '')
        );
      });
    }
    return therapeuticRegimen
      .query()
      .with('drugs', (query) => {
        query.with('form');
      })
      .where((therapeuticRegimen) => {
        return (
          therapeuticRegimen.active &&
          (therapeuticRegimen.clinical_service_id === null ||
            therapeuticRegimen.clinical_service_id === '')
        );
      })
      .get();
  },
  getById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return getTherapeuticRegimenMobileCache().find((entry) => entry.id === id);
    }
    return therapeuticRegimen
      .query()
      .where((therapeuticRegimen) => {
        return therapeuticRegimen.id === id;
      })
      .first();
  },
  //Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await therapeuticRegimenDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();
  },
  async refreshMobileCache() {
    if (!isMobile.value) {
      return [];
    }
    return refreshTherapeuticRegimenMobileCache();
  },
};
